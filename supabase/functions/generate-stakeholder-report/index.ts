import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Vocabulary translations for stakeholder-specific language
const DIAGNOSTIC_VOCABULARY: Record<string, Record<string, string>> = {
  'character_depth': {
    actor: 'Performance opportunities and emotional range display potential',
    producer: 'Character development requirements and casting appeal',
    financier: 'Lead role marketability and star attachment potential',
    director: 'Character texture for visual storytelling',
    writer: 'Character interiority and arc development',
    studio_executive: 'Talent attachability and role appeal',
    ott_platform: 'Character stickiness and viewer investment',
    theatrical: 'Audience connection and empathy anchors',
    investor: 'Star attachment factors and package value'
  },
  'structural_integrity': {
    actor: 'Scene flow and performance rhythm',
    producer: 'Production schedule impact and rewrite needs',
    financier: 'Development cost and timeline risk',
    director: 'Pacing challenges and editorial considerations',
    writer: 'Act structure and turning point effectiveness',
    studio_executive: 'Development cycle requirements',
    ott_platform: 'Episode structure and binge mechanics',
    theatrical: 'Act resolution and audience satisfaction',
    investor: 'Development timeline and cost projections'
  },
  'dialogue_quality': {
    actor: 'Line actability and subtext opportunities',
    producer: 'Dialogue polish needs and writer requirements',
    financier: 'Marketing soundbites and trailer moments',
    director: 'Scene rhythm and dialogue pacing',
    writer: 'Voice distinction and exposition balance',
    studio_executive: 'Marketing hooks and memorable moments',
    ott_platform: 'Social shareability and quotable lines',
    theatrical: 'Crowd-pleasing moments and applause lines',
    investor: 'Word-of-mouth hooks and viral potential'
  },
  'market_viability': {
    actor: 'Role visibility and career positioning',
    producer: 'Distribution opportunities and sales positioning',
    financier: 'ROI potential and comparable analysis',
    director: 'Genre positioning and creative latitude',
    writer: 'Commercial expectations and creative freedom',
    studio_executive: 'Quadrant appeal and release strategy',
    ott_platform: 'Algorithm compatibility and discovery potential',
    theatrical: 'Box office positioning and release window',
    investor: 'Market timing and competitive landscape'
  }
};

// Executive summary templates
const SUMMARY_TEMPLATES: Record<string, { prefix: string; scoreLabel: string }> = {
  actor: { prefix: 'Role Assessment', scoreLabel: 'Castability' },
  producer: { prefix: 'Production Assessment', scoreLabel: 'Greenlight Confidence' },
  financier: { prefix: 'Investment Assessment', scoreLabel: 'ROI Confidence' },
  director: { prefix: 'Creative Assessment', scoreLabel: 'Attachment Score' },
  writer: { prefix: 'Craft Assessment', scoreLabel: 'Development Score' },
  studio_executive: { prefix: 'Greenlight Assessment', scoreLabel: 'Production Readiness' },
  ott_platform: { prefix: 'Platform Assessment', scoreLabel: 'Acquisition Score' },
  theatrical: { prefix: 'Exhibition Assessment', scoreLabel: 'Theatrical Viability' },
  investor: { prefix: 'Investment Assessment', scoreLabel: 'Investment Confidence' }
};

// Recommendation action verbs per stakeholder
const ACTION_VERBS: Record<string, string> = {
  actor: 'Request from writer',
  producer: 'Schedule for development',
  financier: 'Factor into valuation',
  director: 'Address in prep',
  writer: 'Prioritize in rewrite',
  studio_executive: 'Require before greenlight',
  ott_platform: 'Note for development',
  theatrical: 'Ensure for release',
  investor: 'Account for in projections'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !authData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { reportId, stakeholderLens } = await req.json();

    if (!reportId || !stakeholderLens) {
      return new Response(JSON.stringify({ error: 'Missing reportId or stakeholderLens' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Generating stakeholder report for ${stakeholderLens}, report ${reportId}`);

    // Fetch base report data
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*, scripts(title, logline, genre, script_type)')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      console.error('Report fetch error:', reportError);
      return new Response(JSON.stringify({ error: 'Report not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const fullReportData = report.full_report_data as any;
    const scriptTitle = (report.scripts as any)?.title || 'Untitled';
    
    // Get parameter scores and insights
    const parameterScores = fullReportData?.parameterScores || [];
    const insights = fullReportData?.insights || [];
    const categoryScores = fullReportData?.categoryScores || {};

    // Use Lovable AI to generate adapted content
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    let adaptedInsights: any[] = [];
    let adaptedRecommendations: any[] = [];
    let adaptedExecutiveSummary = '';

    if (lovableApiKey) {
      try {
        // Prepare context for AI
        const topIssues = parameterScores
          .filter((p: any) => p.score < 70)
          .sort((a: any, b: any) => a.score - b.score)
          .slice(0, 5);

        const topStrengths = parameterScores
          .filter((p: any) => p.score >= 70)
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 3);

        const prompt = `You are adapting script analysis for a ${stakeholderLens.replace('_', ' ')} perspective.

Script: "${scriptTitle}"
Overall Score: ${report.overall_score || 0}

Top Issues (need work):
${topIssues.map((p: any) => `- ${p.displayName || p.parameterName}: ${p.score}/100 - ${p.rationale || 'No rationale'}`).join('\n')}

Top Strengths:
${topStrengths.map((p: any) => `- ${p.displayName || p.parameterName}: ${p.score}/100`).join('\n')}

Key Insights:
${insights.slice(0, 3).map((i: any) => `- ${i.title}: ${i.description}`).join('\n')}

Reframe these findings for a ${stakeholderLens.replace('_', ' ')} using their professional vocabulary and decision-making perspective. Focus on what matters to them specifically.

Return JSON with this structure:
{
  "executiveSummary": "2-3 sentence summary using stakeholder vocabulary",
  "adaptedInsights": [
    { "title": "Reframed title", "description": "Stakeholder-relevant description", "priority": 1-5, "actionable": true/false }
  ],
  "recommendations": [
    { "action": "Specific action for this stakeholder", "priority": "High/Medium/Low", "rationale": "Why this matters to them" }
  ]
}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: 'You are an expert entertainment industry analyst who adapts script coverage for different stakeholders. Always return valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content;
          
          if (content) {
            // Extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                const parsed = JSON.parse(jsonMatch[0]);
                adaptedExecutiveSummary = parsed.executiveSummary || '';
                adaptedInsights = parsed.adaptedInsights || [];
                adaptedRecommendations = parsed.recommendations || [];
              } catch (e) {
                console.error('Failed to parse AI response JSON:', e);
              }
            }
          }
        } else {
          const errorText = await aiResponse.text();
          console.error('AI API error:', aiResponse.status, errorText);
        }
      } catch (aiError) {
        console.error('AI generation error:', aiError);
      }
    }

    // Fallback to template-based generation if AI fails
    if (!adaptedExecutiveSummary) {
      const template = SUMMARY_TEMPLATES[stakeholderLens] || SUMMARY_TEMPLATES.producer;
      const score = report.overall_score || 0;
      const scoreLevel = score >= 75 ? 'strong' : score >= 50 ? 'moderate' : 'developing';
      
      adaptedExecutiveSummary = `${template.prefix}: "${scriptTitle}" shows ${scoreLevel} indicators (${template.scoreLabel}: ${Math.round(score)}/100). Key focus areas for ${stakeholderLens.replace('_', ' ')} consideration have been identified.`;
    }

    if (adaptedInsights.length === 0) {
      // Generate from base insights with vocabulary translation
      adaptedInsights = insights.slice(0, 5).map((insight: any, idx: number) => ({
        title: insight.title,
        description: insight.description,
        priority: insight.priority || idx + 1,
        actionable: insight.actionable !== false,
        originalCategory: insight.category
      }));
    }

    if (adaptedRecommendations.length === 0) {
      // Generate from low-scoring parameters
      const lowScoring = parameterScores
        .filter((p: any) => p.score < 60)
        .sort((a: any, b: any) => a.score - b.score)
        .slice(0, 3);

      const actionVerb = ACTION_VERBS[stakeholderLens] || 'Address';
      
      adaptedRecommendations = lowScoring.map((p: any) => ({
        action: `${actionVerb}: ${p.displayName || p.parameterName}`,
        priority: p.score < 40 ? 'High' : p.score < 50 ? 'Medium' : 'Low',
        rationale: p.rationale || `Score of ${p.score}/100 requires attention`
      }));
    }

    // Calculate stakeholder-specific score
    const stakeholderScore = report.overall_score || 0;

    // Key metrics for this stakeholder
    const keyMetrics: Record<string, any> = {
      overallScore: stakeholderScore,
      topCategory: Object.entries(categoryScores).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0],
      weakestCategory: Object.entries(categoryScores).sort(([,a], [,b]) => (a as number) - (b as number))[0]?.[0],
      parameterCount: parameterScores.length,
      strengthCount: parameterScores.filter((p: any) => p.score >= 70).length,
      issueCount: parameterScores.filter((p: any) => p.score < 50).length
    };

    // Check for existing stakeholder report
    const { data: existingReport } = await supabase
      .from('stakeholder_reports')
      .select('id')
      .eq('report_id', reportId)
      .eq('stakeholder_lens', stakeholderLens)
      .maybeSingle();

    const reportPayload = {
      stakeholder_score: stakeholderScore,
      executive_summary: adaptedExecutiveSummary,
      adapted_insights: adaptedInsights,
      adapted_recommendations: adaptedRecommendations,
      key_metrics: keyMetrics,
      vocabulary_version: '1.0.0',
      generated_at: new Date().toISOString(),
      is_stale: false,
      relevant_parameters: parameterScores,
      relevant_insights: insights
    };

    let result;
    if (existingReport) {
      const { data, error } = await supabase
        .from('stakeholder_reports')
        .update(reportPayload)
        .eq('id', existingReport.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('stakeholder_reports')
        .insert({
          report_id: reportId,
          stakeholder_lens: stakeholderLens,
          ...reportPayload
        })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    console.log(`Successfully generated stakeholder report for ${stakeholderLens}`);

    return new Response(JSON.stringify({
      success: true,
      stakeholderReport: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-stakeholder-report:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
