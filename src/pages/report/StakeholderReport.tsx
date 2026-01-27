import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { StakeholderLens, LENS_CONFIG, ReportData } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreRing } from '@/components/ScoreRing';
import { ScoreBar, ScoreDisplay } from '@/components/report/ui/ScoreDisplay';
import { Loader2, Play, CheckCircle, RefreshCw, ArrowLeft, Calendar, Clock, Users, Target, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LensSelector } from '@/components/LensToggle';
import { format } from 'date-fns';

interface StakeholderReportData {
  id: string;
  stakeholder_lens: string;
  stakeholder_score: number;
  relevant_parameters: any[];
  relevant_insights: any[];
  executive_summary: string;
  generated_at: string;
  is_stale: boolean;
  // New adapted content fields
  adapted_insights?: any[];
  adapted_recommendations?: any[];
  key_metrics?: Record<string, any>;
  vocabulary_version?: string;
}

// Stakeholder-specific parameter weights and categories
const STAKEHOLDER_RELEVANCE: Record<StakeholderLens, { categories: string[]; weights: Record<string, number> }> = {
  studio_executive: {
    categories: ['Concept & Hook', 'Market', 'Execution', 'Conflict'],
    weights: { 'concept_originality': 1.5, 'commercial_viability': 2.0, 'production_complexity': 1.5 }
  },
  producer: {
    categories: ['Execution', 'Structure', 'Market', 'Character'],
    weights: { 'production_feasibility': 2.0, 'schedule_risk': 1.5, 'budget_alignment': 2.0 }
  },
  actor: {
    categories: ['Character', 'Dialogue', 'Emotional Arc'],
    weights: { 'protagonist_arc_clarity': 2.0, 'dialogue_authenticity': 1.5, 'emotional_beats_variety': 1.5 }
  },
  director: {
    categories: ['Structure', 'World & Logic', 'Emotional Arc', 'Theme'],
    weights: { 'visual_storytelling': 2.0, 'scene_economy': 1.5, 'pacing_control': 1.5 }
  },
  writer: {
    categories: ['Structure', 'Character', 'Dialogue', 'Theme', 'Conflict'],
    weights: { 'thematic_coherence': 1.5, 'dialogue_authenticity': 1.5, 'structural_integrity': 1.5 }
  },
  financier: {
    categories: ['Market', 'Execution', 'Concept & Hook'],
    weights: { 'commercial_viability': 2.5, 'ip_expansion_potential': 2.0, 'production_complexity': 1.5 }
  },
  ott_platform: {
    categories: ['Concept & Hook', 'Character', 'Market', 'Emotional Arc'],
    weights: { 'binge_worthiness': 2.0, 'character_depth': 1.5, 'episode_hook': 2.0 }
  },
  theatrical: {
    categories: ['Concept & Hook', 'Emotional Arc', 'World & Logic', 'Theme'],
    weights: { 'spectacle_potential': 2.0, 'catharsis_strength': 1.5, 'world_immersion': 1.5 }
  },
  investor: {
    categories: ['Market', 'Execution', 'Concept & Hook', 'Web Series'],
    weights: { 'monetization_readiness': 2.5, 'commercial_viability': 2.0, 'retention_curve_design': 1.5 }
  }
};

export default function StakeholderReport() {
  const { runId, stakeholder } = useParams<{ runId: string; stakeholder: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [stakeholderReport, setStakeholderReport] = useState<StakeholderReportData | null>(null);
  const [selectedLens, setSelectedLens] = useState<StakeholderLens>(
    (stakeholder as StakeholderLens) || 'studio_executive'
  );

  useEffect(() => {
    if (stakeholder) {
      setSelectedLens(stakeholder as StakeholderLens);
    }
  }, [stakeholder]);

  useEffect(() => {
    loadData();
  }, [runId, selectedLens]);

  const loadData = async () => {
    if (!runId) return;
    setLoading(true);

    try {
      // Load base report data
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('analysis_run_id', runId)
        .single();

      if (reportError) throw reportError;
      setReportData(report.full_report_data as unknown as ReportData);

      // Check for existing stakeholder report
      const { data: stakeholderData, error: stakeholderError } = await supabase
        .from('stakeholder_reports')
        .select('*')
        .eq('report_id', report.id)
        .eq('stakeholder_lens', selectedLens)
        .maybeSingle();

      if (!stakeholderError && stakeholderData) {
        setStakeholderReport(stakeholderData as unknown as StakeholderReportData);
      } else {
        setStakeholderReport(null);
      }
    } catch (err) {
      console.error('Error loading stakeholder report:', err);
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateStakeholderReport = async () => {
    if (!runId || !reportData || !user) return;
    setGenerating(true);

    try {
      // Get report ID
      const { data: report } = await supabase
        .from('reports')
        .select('id')
        .eq('analysis_run_id', runId)
        .single();

      if (!report) throw new Error('Report not found');

      // Call the edge function to generate adapted content
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'generate-stakeholder-report',
        {
          body: {
            reportId: report.id,
            stakeholderLens: selectedLens
          }
        }
      );

      if (functionError) {
        console.error('Edge function error:', functionError);
        // Fall back to local generation if edge function fails
        await generateLocalStakeholderReport(report.id);
      } else {
        toast({
          title: 'Report Generated',
          description: `${lensConfig.label} report ready with adapted content`
        });
        await loadData();
      }
    } catch (err) {
      console.error('Error generating stakeholder report:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate stakeholder report',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  // Fallback local generation (without AI adaptation)
  const generateLocalStakeholderReport = async (reportDbId: string) => {
    const relevance = STAKEHOLDER_RELEVANCE[selectedLens];
    
    // Filter parameters by relevance
    const relevantParams = (reportData!.parameterScores || []).filter(p => 
      relevance.categories.includes(p.category)
    ).map(p => ({
      ...p,
      weightedScore: p.score * (relevance.weights[p.parameterName] || 1.0)
    }));

    // Calculate weighted score
    const totalWeight = relevantParams.reduce((sum, p) => sum + (relevance.weights[p.parameterName] || 1.0), 0);
    const weightedSum = relevantParams.reduce((sum, p) => sum + p.weightedScore, 0);
    const stakeholderScore = totalWeight > 0 ? weightedSum / totalWeight : (reportData!.lensScores?.[selectedLens] || 0);

    // Filter insights by relevance
    const relevantInsights = (reportData!.insights || []).filter(i =>
      relevance.categories.some(cat => i.category.toLowerCase().includes(cat.toLowerCase()))
    );

    // Generate executive summary
    const executiveSummary = `${lensConfig.label} Assessment: "${reportData!.scriptMetadata?.title}" scores ${stakeholderScore.toFixed(1)}/10 from a ${lensConfig.label.toLowerCase()} perspective. ${
      relevantParams.filter(p => p.score >= 7).length > 0 
        ? `Key strengths in ${relevantParams.filter(p => p.score >= 7).slice(0, 3).map(p => p.displayName || p.parameterName).join(', ')}. `
        : ''
    }${
      relevantParams.filter(p => p.score < 5).length > 0
        ? `Areas requiring attention: ${relevantParams.filter(p => p.score < 5).slice(0, 2).map(p => p.displayName || p.parameterName).join(', ')}.`
        : 'No critical concerns identified.'
    }`;

    // Check if record exists first
    const { data: existingRecord } = await supabase
      .from('stakeholder_reports')
      .select('id')
      .eq('report_id', reportDbId)
      .eq('stakeholder_lens', selectedLens)
      .maybeSingle();

    // Convert to JSON-serializable format
    const relevantParamsJson = JSON.parse(JSON.stringify(relevantParams));
    const relevantInsightsJson = JSON.parse(JSON.stringify(relevantInsights));

    if (existingRecord) {
      const { error: updateError } = await supabase
        .from('stakeholder_reports')
        .update({
          stakeholder_score: stakeholderScore,
          relevant_parameters: relevantParamsJson,
          relevant_insights: relevantInsightsJson,
          executive_summary: executiveSummary,
          generated_at: new Date().toISOString(),
          is_stale: false
        })
        .eq('id', existingRecord.id);

      if (updateError) throw updateError;
    } else {
      const insertData = {
        report_id: reportDbId,
        stakeholder_lens: selectedLens,
        stakeholder_score: stakeholderScore,
        relevant_parameters: relevantParamsJson,
        relevant_insights: relevantInsightsJson,
        executive_summary: executiveSummary,
        generated_at: new Date().toISOString(),
        is_stale: false
      };

      const { error: insertError } = await supabase
        .from('stakeholder_reports')
        .insert(insertData as any);

      if (insertError) throw insertError;
    }

    toast({
      title: 'Report Generated',
      description: `${lensConfig.label} report ready`
    });

    await loadData();
  };

  const handleLensChange = (lens: StakeholderLens) => {
    navigate(`/report/${runId}/stakeholder/${lens}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Report Not Found</h2>
        <p className="text-muted-foreground mt-2">Unable to load report data.</p>
        <Button onClick={() => navigate('/reports')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
      </div>
    );
  }

  const lensConfig = LENS_CONFIG[selectedLens];
  const relevance = STAKEHOLDER_RELEVANCE[selectedLens];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/report/${runId}`)} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Full Report
          </Button>
          <h1 className="text-3xl font-bold">{lensConfig.label} Report</h1>
          <p className="text-muted-foreground">{lensConfig.description}</p>
        </div>
        <LensSelector
          activeLens={selectedLens}
          onLensChange={handleLensChange}
          compact
        />
      </div>

      {/* No stakeholder report yet - prompt to generate */}
      {!stakeholderReport ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Generate {lensConfig.label} Report</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create a customized analysis focused on parameters most relevant to {lensConfig.label.toLowerCase()}s: {relevance.categories.slice(0, 3).join(', ')}.
            </p>
            <Button onClick={generateStakeholderReport} disabled={generating} size="lg">
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stakeholder Score Hero */}
          <Card className="bg-gradient-to-br from-primary/5 via-transparent to-chart-6/5 overflow-hidden">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className={cn(
                      stakeholderReport.is_stale 
                        ? 'bg-amber-500/10 text-amber-500' 
                        : 'bg-emerald-500/10 text-emerald-500'
                    )}>
                      {stakeholderReport.is_stale ? (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Stale
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Current
                        </>
                      )}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(stakeholderReport.generated_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold">{reportData.scriptMetadata?.title}</h2>
                  <p className="text-muted-foreground">{stakeholderReport.executive_summary}</p>
                  
                  <Button 
                    variant="outline" 
                    onClick={generateStakeholderReport} 
                    disabled={generating}
                    size="sm"
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", generating && "animate-spin")} />
                    Regenerate
                  </Button>
                </div>
                
                <div className="flex justify-center">
                  <ScoreRing 
                    score={stakeholderReport.stakeholder_score} 
                    size="xl" 
                    label={`${lensConfig.label} Score`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Relevant Categories */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Key Focus Areas for {lensConfig.label}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relevance.categories.map(category => {
                const categoryParams = (stakeholderReport.relevant_parameters as any[]).filter(
                  p => p.category === category
                );
                const avgScore = categoryParams.length > 0
                  ? categoryParams.reduce((sum, p) => sum + p.score, 0) / categoryParams.length
                  : 0;
                
                return (
                  <Card key={category} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-sm">{category}</span>
                        <ScoreDisplay score={avgScore} size="sm" showLabel={false} />
                      </div>
                      <ScoreBar score={avgScore} showValue={false} />
                      <p className="text-xs text-muted-foreground mt-2">
                        {categoryParams.length} parameters analyzed
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Top Parameters */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Critical Parameters
            </h3>
            <div className="grid gap-4">
              {(stakeholderReport.relevant_parameters as any[])
                .sort((a, b) => (relevance.weights[b.parameterName] || 1) - (relevance.weights[a.parameterName] || 1))
                .slice(0, 10)
                .map((param, idx) => (
                  <Card key={param.parameterId || idx}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{param.displayName || param.parameterName}</span>
                            <Badge variant="secondary" className="text-xs">{param.category}</Badge>
                            {relevance.weights[param.parameterName] && (
                              <Badge variant="outline" className="text-xs bg-primary/5">
                                High Priority
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{param.rationale}</p>
                        </div>
                        <ScoreDisplay score={param.score} size="sm" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>

          {/* Adapted Recommendations (if available) */}
          {(stakeholderReport.adapted_recommendations as any[] | undefined)?.length ? (
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Recommendations for {lensConfig.label}
              </h3>
              <div className="grid gap-3">
                {(stakeholderReport.adapted_recommendations as any[]).map((rec, idx) => (
                  <Card key={idx} className={cn(
                    rec.priority === 'High' && 'border-destructive/30 bg-destructive/5',
                    rec.priority === 'Medium' && 'border-chart-4/30 bg-chart-4/5'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant={rec.priority === 'High' ? 'destructive' : rec.priority === 'Medium' ? 'default' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{rec.action}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.rationale}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          {/* Adapted Insights (if available) or Relevant Insights */}
          {((stakeholderReport.adapted_insights as any[] | undefined)?.length || (stakeholderReport.relevant_insights as any[]).length > 0) && (
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {lensConfig.label}-Relevant Insights
              </h3>
              <div className="grid gap-4">
                {((stakeholderReport.adapted_insights as any[] | undefined)?.length 
                  ? (stakeholderReport.adapted_insights as any[])
                  : (stakeholderReport.relevant_insights as any[])
                ).map((insight, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant={insight.priority === 1 ? 'default' : 'secondary'}>
                          P{insight.priority}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                          {insight.actionable && (
                            <Badge variant="outline" className="mt-2 text-xs">Actionable</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
