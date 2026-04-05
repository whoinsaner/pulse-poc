import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  reportId: string;
  format: 'json' | 'summary' | 'full' | 'pdf';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No auth token provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with user's token to verify auth and check access
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const reportId = typeof body?.reportId === 'string' && uuidRegex.test(body.reportId) ? body.reportId : null;
    const validFormats = ['json', 'summary', 'full', 'pdf'] as const;
    const format = (typeof body?.format === 'string' && validFormats.includes(body.format as any) ? body.format : 'json') as ExportRequest['format'];

    if (!reportId) {
      return new Response(
        JSON.stringify({ error: 'reportId must be a valid UUID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has access to the report via RLS
    const { data: reportAccess, error: accessError } = await supabaseAuth
      .from('reports')
      .select('id, organization_id')
      .eq('id', reportId)
      .single();

    if (accessError || !reportAccess) {
      return new Response(
        JSON.stringify({ error: 'Not found or unauthorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[export-report] Exporting report ${reportId} as ${format}`);

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch report with all related data
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        *,
        scripts (
          title,
          genre,
          script_type,
          logline,
          page_count,
          episode_length_class
        )
      `)
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      throw new Error(`Report not found: ${reportError?.message}`);
    }

    // Fetch additional data
    const [insightsResult, scoresResult, charactersResult] = await Promise.all([
      supabase.from('insights').select('*').eq('analysis_run_id', report.analysis_run_id),
      supabase.from('parameter_scores').select('*, parameters(*)').eq('analysis_run_id', report.analysis_run_id),
      supabase.from('characters').select('*').eq('script_id', report.script_id),
    ]);

    if (format === 'json') {
      // Raw JSON export
      const exportData = {
        report: {
          id: report.id,
          title: report.title,
          overallScore: report.overall_score,
          lensScores: report.lens_scores,
          executiveSummary: report.executive_summary,
          createdAt: report.created_at,
        },
        script: report.scripts,
        fullReportData: report.full_report_data,
        insights: insightsResult.data || [],
        parameterScores: scoresResult.data || [],
        characters: charactersResult.data || [],
      };

      return new Response(
        JSON.stringify(exportData, null, 2),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, '_')}_export.json"`,
          } 
        }
      );
    }

    // Generate markdown/text for PDF-ready export
    const fullReportData = report.full_report_data as any;
    const insights = insightsResult.data || [];
    const scores = scoresResult.data || [];
    const characters = charactersResult.data || [];

    if (format === 'summary') {
      // Executive Summary export
      const summaryContent = generateExecutiveSummary(report, fullReportData, insights);
      
      return new Response(
        JSON.stringify({ 
          content: summaryContent,
          title: `${report.title} - Executive Summary`,
          format: 'markdown'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (format === 'pdf') {
      // Generate PDF-ready markdown content
      // Note: Full PDF generation would require a PDF library
      // For now, we return markdown that can be converted client-side
      const pdfContent = generateFullReport(report, fullReportData, insights, scores, characters);
      
      return new Response(
        JSON.stringify({ 
          content: pdfContent,
          title: `${report.title} - Analysis Report`,
          format: 'pdf-ready',
          // PDF base64 would be here if we had a PDF library
          pdf: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Full report export
    const fullContent = generateFullReport(report, fullReportData, insights, scores, characters);
    
    return new Response(
      JSON.stringify({ 
        content: fullContent,
        title: `${report.title} - Full Analysis Report`,
        format: 'markdown'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[export-report] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateExecutiveSummary(report: any, data: any, insights: any[]): string {
  const topInsights = insights
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);

  const lensScores = Object.entries(report.lens_scores || {})
    .map(([lens, score]) => `- **${formatLensName(lens)}**: ${Math.round(score as number)}/100`)
    .join('\n');

  return `
# ${report.title}
## Executive Summary

**Overall Readiness Score: ${Math.round(report.overall_score || 0)}/100**

### Script Overview
${data.scriptMetadata?.logline ? `*${data.scriptMetadata.logline}*\n` : ''}
- **Genre**: ${data.scriptMetadata?.genre || 'Not specified'}
- **Type**: ${data.scriptMetadata?.scriptType || 'Feature'}
- **Page Count**: ${data.scriptMetadata?.pageCount || 'Unknown'}
${data.scriptMetadata?.cinemaTradition && data.scriptMetadata.cinemaTradition !== 'auto_detect' ? `- **Cinema Tradition**: ${data.scriptMetadata.cinemaTradition.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}` : ''}

### Stakeholder Perspective Scores
${lensScores}

### Key Findings

${topInsights.map((insight, i) => `
#### ${i + 1}. ${insight.title}
${insight.description}
`).join('\n')}

---
*Generated by Pulse AI Script Analysis*
*${new Date().toLocaleDateString()}*
`.trim();
}

function formatParameterWithGuide(param: any): string {
  const displayName = param.parameters?.display_name || param.parameter_id;
  const description = param.parameters?.description || '';
  const scoringGuide = param.parameters?.scoring_guide || '';
  const maturity = param.maturity || 'Not assessed';
  const riskLevel = param.risk_level || 'Not assessed';
  
  return `
#### ${displayName}
${description ? `*${description}*\n` : ''}
- **Score**: ${Math.round(param.score)}/100
- **Confidence**: ${Math.round((param.confidence || 0) * 100)}%
- **Maturity**: ${maturity}
- **Risk Level**: ${riskLevel}
- **Analysis**: ${param.rationale || 'No rationale provided.'}
${scoringGuide ? `\n> **Scoring Guide**: ${scoringGuide}` : ''}
`;
}

function generateFullReport(
  report: any,
  data: any,
  insights: any[],
  scores: any[],
  characters: any[]
): string {
  const categoryScores = groupScoresByCategory(scores);
  const isComic = data.scriptMetadata?.scriptType === 'comic';
  const isWebSeries = data.scriptMetadata?.scriptType === 'web_series';
  const episodeLengthClass = report.scripts?.episode_length_class;
  
  // Separate comic-specific parameters
  const comicCategories = ['Comic Visuals', 'Comic Dialogue', 'Comic Pacing', 'Comic Collaboration', 
                          'Comic Characters', 'Comic Production', 'Comic Market', 'Comic Structure'];
  const webSeriesCategories = ['Web Series'];
  
  const comicParams = scores.filter(s => comicCategories.includes(s.parameters?.category || ''));
  const webSeriesParams = scores.filter(s => webSeriesCategories.includes(s.parameters?.category || ''));
  const coreParams = scores.filter(s => 
    !comicCategories.includes(s.parameters?.category || '') && 
    !webSeriesCategories.includes(s.parameters?.category || '')
  );
  const coreCategories = groupScoresByCategory(coreParams);

  const episodeLengthLabel = episodeLengthClass === 'short_form_web' ? 'Short-Form (<10 min)' :
                             episodeLengthClass === 'mid_form_web' ? 'Mid-Form (10-30 min)' :
                             episodeLengthClass === 'long_form_web' ? 'Long-Form (45-70+ min)' : null;

  // Extract cliffhanger-related parameters across formats
  const cliffhangerParamNames = [
    'cliffhangers', 'structural_modularity', 'serial_momentum', 
    'episode_end_hooks', 'binge_continuity_pressure', 'mid_episode_rehooking'
  ];
  const cliffhangerParams = scores.filter(s => 
    cliffhangerParamNames.includes(s.parameters?.name || '') ||
    cliffhangerParamNames.includes(s.parameter_id || '')
  );
  const hasCliffhangerAnalysis = cliffhangerParams.length > 0 && (isComic || isWebSeries);
  
  return `
# ${report.title}
## Full Analysis Report

**Overall Readiness Score: ${Math.round(report.overall_score || 0)}/100**
${isComic ? '\n*Comic Script Analysis - 14 Agents (10 Core + 4 Comic-Specialized)*\n' : ''}
${isWebSeries ? `\n*Web Series Analysis - WebSeriesAgent with 13 Parameters*\n${episodeLengthLabel ? `*Episode Length Class: ${episodeLengthLabel}*\n` : ''}` : ''}

---

## 1. Executive Summary

${report.executive_summary || 'No executive summary available.'}

---

## 2. Script Overview

${data.scriptMetadata?.logline ? `*${data.scriptMetadata.logline}*\n` : ''}
| Attribute | Value |
|-----------|-------|
| Genre | ${data.scriptMetadata?.genre || 'Not specified'} |
| Type | ${data.scriptMetadata?.scriptType || 'Feature'} |
| Page Count | ${data.scriptMetadata?.pageCount || 'Unknown'} |
${isWebSeries && episodeLengthLabel ? `| Episode Length | ${episodeLengthLabel} |` : ''}

---

## 3. Stakeholder Perspective Analysis

${Object.entries(report.lens_scores || {}).map(([lens, score]) => `
### ${formatLensName(lens)}
**Score: ${Math.round(score as number)}/100**
`).join('\n')}

---

## 4. Core Parameter Analysis

${Object.entries(coreCategories).map(([category, params]: [string, any]) => `
### ${category}

${params.map((p: any) => formatParameterWithGuide(p)).join('\n')}
`).join('\n')}

---

${isWebSeries ? `
## 5. Web Series Analysis

### Digital-First Series Parameters
This analysis includes evaluation from the WebSeriesAgent covering ${webSeriesParams.length} parameters optimized for algorithmic discovery, retention, and platform-native consumption.

${episodeLengthClass === 'long_form_web' ? `
### Long-Form Parameters (Activated)
The following bonus parameters are evaluated for episodes exceeding 45 minutes:
- Mid-Episode Re-Hooking (attention reset points every 12-15 minutes)
- Soft Act Integrity (internal act-like pivots)
- Binge Continuity Pressure (next-click behavior optimization)
` : ''}

### Web Series Parameters

${webSeriesParams.map((p: any) => formatParameterWithGuide(p)).join('\n')}

---

## 6. Key Insights & Recommendations
` : isComic ? `
## 5. Comic-Specific Analysis

### Specialized Comic Agents
This analysis includes evaluation from 4 specialized comic agents:
- **PanelFlowAgent** - Sequential storytelling, panel economy, page architecture
- **LetteringBalloonAgent** - Dialogue load, balloon engineering, reading flow
- **PageTurnImpactAgent** - Emotional payload, structural modularity, reveals
- **ArtScriptSynergyAgent** - Art-writing balance, collaboration readiness

### Comic Parameters

${comicParams.map((p: any) => formatParameterWithGuide(p)).join('\n')}

---

## 6. Key Insights & Recommendations
` : `
## 5. Key Insights & Recommendations
`}

${hasCliffhangerAnalysis ? `
---

## Cliffhanger & Serialization Analysis

${isComic ? `
### Comic Page-Turn Impact
Cliffhangers in comics are evaluated through the **PageTurnImpactAgent**, focusing on how page turns create suspense, reveals, and reader momentum.
` : ''}
${isWebSeries ? `
### Web Series Episode Hooks
For web series, cliffhangers are critical for algorithmic promotion and viewer retention. The **WebSeriesAgent** evaluates serial momentum and episode-end hooks.
${episodeLengthClass === 'long_form_web' ? '\n*Long-form episodes (45+ min) receive additional weighting (1.2x) for serial_momentum to ensure strong episode conclusions.*' : ''}
` : ''}

| Parameter | Score | Risk | Maturity | Analysis |
|-----------|-------|------|----------|----------|
${cliffhangerParams.map(p => {
  const name = p.parameters?.display_name || p.parameter_id || 'Unknown';
  const score = Math.round(p.score || 0);
  const risk = p.risk_level || 'N/A';
  const maturity = p.maturity || 'N/A';
  const rationale = (p.rationale || 'No analysis').slice(0, 80) + (p.rationale?.length > 80 ? '...' : '');
  return `| ${name} | ${score}/100 | ${risk} | ${maturity} | ${rationale} |`;
}).join('\n')}

` : ''}

${insights
  .sort((a, b) => a.priority - b.priority)
  .map((insight, i) => `
### ${i + 1}. ${insight.title}
**Category**: ${insight.category} | **Priority**: ${insight.priority} | ${insight.actionable ? '✓ Actionable' : ''}

${insight.description}
`).join('\n')}

---

## ${isComic || isWebSeries ? '7' : '6'}. Character Analysis

| Character | Dialogue Lines | Scene Count | Description |
|-----------|----------------|-------------|-------------|
${characters.slice(0, 10).map(c => 
  `| ${c.name} | ${c.dialogue_count || 0} | ${c.scene_count || 0} | ${(c.description || '-').slice(0, 50)}... |`
).join('\n')}

---

*Generated by Pulse AI Script Analysis*
*${new Date().toLocaleDateString()}*
`.trim();
}

function formatLensName(lens: string): string {
  return lens
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function groupScoresByCategory(scores: any[]): Record<string, any[]> {
  return scores.reduce((acc, score) => {
    const category = score.parameters?.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(score);
    return acc;
  }, {} as Record<string, any[]>);
}
