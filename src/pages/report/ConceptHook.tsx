import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  SubSectionHeader,
  VerdictBox, 
  AssessmentCard,
  ScoreBar,
  StrengthWeaknessList,
  RecommendationCard,
  QuoteCallout
} from '@/components/report/ui';
import { Lightbulb, Zap, Target, TrendingUp, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function ConceptHook() {
  const { reportData, activeLens, currentScore } = useOutletContext<ReportContextValue>();
  
  // Get concept-related scores from parameters - Concept & Hook category
  const conceptParams = reportData.parameterScores?.filter(p => 
    ['concept', 'concept & hook', 'hook'].includes(p.category?.toLowerCase() || '') ||
    p.parameterName?.toLowerCase().includes('concept') ||
    p.parameterName?.toLowerCase().includes('hook') ||
    p.parameterName?.toLowerCase().includes('logline') ||
    p.parameterName?.toLowerCase().includes('premise') ||
    p.parameterName?.toLowerCase().includes('originality')
  ) || [];

  const conceptScore = conceptParams.length > 0 
    ? conceptParams.reduce((sum, p) => sum + p.score, 0) / conceptParams.length 
    : reportData.categoryScores?.['Concept & Hook'] || currentScore;

  const categoryScore = typeof reportData.categoryScores?.['Concept & Hook'] === 'number'
    ? reportData.categoryScores['Concept & Hook']
    : (reportData.categoryScores?.['Concept & Hook'] as { score?: number })?.score || conceptScore;

  // Get related insights
  const conceptInsights = reportData.insights?.filter(i => 
    i.category?.toLowerCase().includes('concept') ||
    i.category?.toLowerCase().includes('hook') ||
    i.title?.toLowerCase().includes('concept') ||
    i.title?.toLowerCase().includes('hook')
  ) || [];

  // Assessment items based on available data
  const assessments = [
    { 
      label: 'Commercially Viable Concept', 
      status: categoryScore >= 7 ? 'yes' as const : categoryScore >= 5 ? 'partial' as const : 'no' as const,
      description: 'Appeals to target demographic with market potential'
    },
    { 
      label: 'Clear Logline Pitch', 
      status: reportData.scriptMetadata?.logline ? 'yes' as const : 'partial' as const,
      description: 'Can be communicated in one compelling sentence'
    },
    { 
      label: 'Unique Hook', 
      status: categoryScore >= 6.5 ? 'yes' as const : categoryScore >= 4.5 ? 'partial' as const : 'no' as const,
      description: 'Distinctive element that sets it apart'
    },
    { 
      label: 'Genre Clarity', 
      status: reportData.scriptMetadata?.genre ? 'yes' as const : 'no' as const,
      description: 'Clear genre positioning for audience expectations'
    },
  ];

  const strengths = conceptParams.filter(p => p.score >= 7).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 100)
  }));

  const weaknesses = conceptParams.filter(p => p.score < 5).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 100)
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Concept & Hook"
        subtitle="Evaluating the core idea, marketability, and pitch potential"
        icon={Lightbulb}
        score={categoryScore}
      />

      {/* Overall Concept Assessment */}
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Concept Assessment" />
        <div className="grid md:grid-cols-2 gap-4">
          {assessments.map((item, index) => (
            <div 
              key={index}
              className={cn(
                "p-4 rounded-lg border",
                item.status === 'yes' ? 'border-success/30 bg-success/5' :
                item.status === 'partial' ? 'border-warning/30 bg-warning/5' :
                'border-destructive/30 bg-destructive/5'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-medium">{item.label}</span>
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  item.status === 'yes' ? 'bg-success/20 text-success' :
                  item.status === 'partial' ? 'bg-warning/20 text-warning' :
                  'bg-destructive/20 text-destructive'
                )}>
                  {item.status === 'yes' ? 'Yes' : item.status === 'partial' ? 'Partial' : 'No'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Logline Analysis */}
      {reportData.scriptMetadata?.logline && (
        <Card className="p-6">
          <SubSectionHeader title="Studio-Grade Logline" />
          <QuoteCallout
            quote={reportData.scriptMetadata.logline}
            type="general"
          />
          <div className="mt-4">
            <h4 className="font-medium mb-2">Why This Works:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary mt-0.5" />
                <span>Establishes clear protagonist and stakes</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Target className="h-4 w-4 text-chart-2 mt-0.5" />
                <span>Implies central conflict and tension</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-chart-3 mt-0.5" />
                <span>Suggests genre and tone expectations</span>
              </li>
            </ul>
          </div>
        </Card>
      )}

      {/* Parameter Scores */}
      {conceptParams.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Concept Parameters" />
          <div className="space-y-4">
            {conceptParams.map((param, index) => (
              <div key={index}>
                <ScoreBar 
                  score={param.score} 
                  label={param.displayName || param.parameterName}
                  showValue 
                />
                {param.rationale && (
                  <p className="text-sm text-muted-foreground mt-1 pl-0">{param.rationale}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList
          strengths={strengths}
          weaknesses={weaknesses}
        />
      )}

      {/* Key Findings */}
      {conceptInsights.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Key Findings" />
          <div className="space-y-4">
            {conceptInsights.map((insight, index) => (
              <VerdictBox
                key={index}
                type={insight.priority <= 1 ? 'error' : insight.priority <= 2 ? 'warning' : 'info'}
                title={insight.title}
                content={insight.description}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-6">
        <SubSectionHeader title="Recommendations" />
        <div className="space-y-3">
          {categoryScore < 7 && (
            <RecommendationCard
              title="Strengthen the Hook"
              description="Consider amplifying the unique selling proposition that differentiates this concept from similar projects in the market."
              priority={categoryScore < 5 ? 'high' : 'medium'}
              effort="moderate"
            />
          )}
          {!reportData.scriptMetadata?.logline && (
            <RecommendationCard
              title="Craft a Clear Logline"
              description="Develop a one-sentence pitch that captures the essence of the story, protagonist, and central conflict."
              priority="high"
              effort="easy"
            />
          )}
          <RecommendationCard
            title="Market Positioning"
            description="Identify 2-3 comparable titles that have performed well and align your concept's positioning accordingly."
            priority="low"
            effort="easy"
          />
        </div>
      </Card>
    </div>
  );
}
