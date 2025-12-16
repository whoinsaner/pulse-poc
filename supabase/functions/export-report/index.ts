import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  reportId: string;
  format: 'json' | 'summary' | 'full';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportId, format = 'json' } = await req.json() as ExportRequest;
    
    console.log(`[export-report] Exporting report ${reportId} as ${format}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
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
          page_count
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

function generateFullReport(
  report: any,
  data: any,
  insights: any[],
  scores: any[],
  characters: any[]
): string {
  const categoryScores = groupScoresByCategory(scores);
  
  return `
# ${report.title}
## Full Analysis Report

**Overall Readiness Score: ${Math.round(report.overall_score || 0)}/100**

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

---

## 3. Stakeholder Perspective Analysis

${Object.entries(report.lens_scores || {}).map(([lens, score]) => `
### ${formatLensName(lens)}
**Score: ${Math.round(score as number)}/100**
`).join('\n')}

---

## 4. Detailed Score Breakdown

${Object.entries(categoryScores).map(([category, params]: [string, any]) => `
### ${category}

${params.map((p: any) => `
#### ${p.parameters?.display_name || p.parameter_id}
- **Score**: ${Math.round(p.score)}/100
- **Confidence**: ${Math.round(p.confidence * 100)}%
- **Analysis**: ${p.rationale || 'No rationale provided.'}
`).join('\n')}
`).join('\n')}

---

## 5. Key Insights & Recommendations

${insights
  .sort((a, b) => a.priority - b.priority)
  .map((insight, i) => `
### ${i + 1}. ${insight.title}
**Category**: ${insight.category} | **Priority**: ${insight.priority} | ${insight.actionable ? '✓ Actionable' : ''}

${insight.description}
`).join('\n')}

---

## 6. Character Analysis

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
