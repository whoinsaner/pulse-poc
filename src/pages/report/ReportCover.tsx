import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { 
  getDecisionSignal, 
  getMaturityStage,
  getDiagnosticCategory,
  extractScore,
} from '@/lib/scoreUtils';
import { MaturityBadge } from '@/components/report/ui/MaturityBadge';
import { CompactDiagnosis } from '@/components/report/ui/DiagnosisSummary';
import { DecisionSignalBadge } from '@/components/report/DecisionSignalBadge';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Users,
  Palette,
  TrendingUp,
  ListTodo,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Monitor,
  Smartphone,
  LayoutPanelTop,
} from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

// Navigation sections configuration
const NAVIGATION_SECTIONS = [
  { id: 'story', label: 'Story', icon: BookOpen, path: '/story', categories: ['Concept & Hook', 'Structure', 'Conflict'] },
  { id: 'characters', label: 'Characters', icon: Users, path: '/characters', categories: ['Character'] },
  { id: 'craft', label: 'Craft', icon: Palette, path: '/craft', categories: ['Dialogue', 'Theme', 'World & Logic', 'Emotional Arc'] },
  { id: 'commercial', label: 'Commercial', icon: TrendingUp, path: '/commercial', categories: ['Market', 'Execution'] },
];

export default function ReportCover() {
  const context = useOutletContext<ReportContextValue>();
  
  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading report...</div>;
  }

  const { reportData, activeLens, currentScore } = context;
  const metadata = reportData.scriptMetadata;
  const decision = getDecisionSignal(currentScore);
  const maturity = getMaturityStage(currentScore);

  // Group parameters by diagnostic category
  const diagnostics = useMemo(() => {
    const params = reportData.parameterScores || [];
    return {
      working: params.filter(p => p.score >= 70),
      underdeveloped: params.filter(p => p.score >= 40 && p.score < 70),
      broken: params.filter(p => p.score < 40),
    };
  }, [reportData.parameterScores]);

  // Calculate section scores
  const sectionScores = useMemo(() => {
    const categoryScores = reportData.categoryScores || {};
    
    return NAVIGATION_SECTIONS.map(section => {
      const relevantScores = section.categories
        .map(cat => extractScore(categoryScores[cat]))
        .filter(score => score > 0);
      
      const avgScore = relevantScores.length > 0
        ? relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length
        : 0;
      
      return {
        ...section,
        score: Math.round(avgScore),
      };
    });
  }, [reportData.categoryScores]);

  // Compute a fallback score from all available category scores
  const overallCategoryAverage = useMemo(() => {
    const scores = Object.values(reportData.categoryScores || {}).map(extractScore).filter(s => s > 0);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : Math.round(currentScore * 10);
  }, [reportData.categoryScores, currentScore]);

  // Get format-specific section if applicable
  const formatSection = useMemo(() => {
    const scriptType = metadata?.scriptType;
    const getFormatScore = (keys: string[]) => {
      const scores = keys.map(k => extractScore(reportData.categoryScores?.[k])).filter(s => s > 0);
      return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : overallCategoryAverage;
    };

    if (scriptType === 'web_series') {
      return { id: 'format', label: 'Web Series', icon: Monitor, path: '/format', score: getFormatScore(['Web Series', 'Web Series Format']) };
    }
    if (scriptType === 'micro_drama') {
      return { id: 'format', label: 'Micro Drama', icon: Smartphone, path: '/format', score: getFormatScore(['Micro Drama', 'Micro Drama Format']) };
    }
    if (scriptType === 'comic') {
      return { id: 'format', label: 'Comic', icon: LayoutPanelTop, path: '/format', score: getFormatScore(['Comic Visuals', 'Comic Dialogue', 'Comic Pacing', 'Comic Collaboration']) };
    }
    return null;
  }, [metadata?.scriptType, reportData.categoryScores, overallCategoryAverage]);

  // Get top working and needs-work items
  const topWorking = diagnostics.working.slice(0, 3).map(p => p.displayName);
  const topNeedsWork = [...diagnostics.broken, ...diagnostics.underdeveloped].slice(0, 3).map(p => ({
    name: p.displayName,
    isBroken: p.score < 40,
  }));

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        {/* Title and metadata */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {metadata?.title || 'Script Analysis'}
          </h1>
          {metadata?.logline && (
            <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
              {metadata.logline}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {metadata?.scriptType && (
              <Badge variant="secondary" className="capitalize">
                {metadata.scriptType.replace('_', ' ')}
              </Badge>
            )}
            {metadata?.pageCount && (
              <Badge variant="secondary">{metadata.pageCount} pages</Badge>
            )}
            {(metadata?.sceneCount ?? reportData.scenes?.length) ? (
              <Badge variant="secondary">
                {metadata?.sceneCount ?? reportData.scenes.length} scenes
              </Badge>
            ) : null}
            {(metadata?.characterCount ?? reportData.characters?.length) ? (
              <Badge variant="secondary">
                {metadata?.characterCount ?? reportData.characters.length} characters
              </Badge>
            ) : null}
            {metadata?.genre && (
              <Badge variant="secondary">{metadata.genre}</Badge>
            )}
            {metadata?.subgenre && (
              <Badge variant="secondary">{metadata.subgenre}</Badge>
            )}
            {metadata?.theme && (
              <Badge variant="secondary">{metadata.theme}</Badge>
            )}
            {metadata?.cinemaTradition && metadata.cinemaTradition !== 'auto_detect' && (
              <Badge variant="outline" className="border-primary/30 text-primary capitalize">
                {metadata.cinemaTradition.replace(/_/g, ' ')} Tradition
              </Badge>
            )}
          </div>
        </div>

        {/* Decision Signal */}
        <Card className={cn('p-6', decision.bgColor, `border ${decision.borderColor}`)}>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DecisionSignalBadge score={currentScore} size="lg" />
                <span className="text-2xl font-bold font-mono">{Math.round(currentScore)}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">
                {decision.description}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Maturity Status */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Maturity Status
        </h3>
        <MaturityBadge score={currentScore} showDescription size="lg" />
        
        {/* Summary statement based on diagnostics */}
        <p className="mt-4 text-sm text-muted-foreground border-t border-border/50 pt-4">
          {diagnostics.working.length > diagnostics.broken.length
            ? `Strong ${topWorking.slice(0, 2).join(' and ').toLowerCase()}${diagnostics.broken.length > 0 ? `, but ${diagnostics.broken[0]?.displayName?.toLowerCase()} needs structural work` : ''}.`
            : diagnostics.broken.length > 0
              ? `Foundational work needed on ${diagnostics.broken.slice(0, 2).map(p => p.displayName.toLowerCase()).join(' and ')}.`
              : 'Script shows solid development across core parameters.'}
        </p>
      </Card>

      {/* What's Working / What Needs Work */}
      <div className="grid md:grid-cols-2 gap-4">
        <ExpandableWorkingCard items={diagnostics.working} />
        <ExpandableNeedsWorkCard broken={diagnostics.broken} underdeveloped={diagnostics.underdeveloped} />
      </div>

      {/* Quick Navigation */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Quick Navigation
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sectionScores.map((section) => {
            const Icon = section.icon;
            const diagnostic = getDiagnosticCategory(section.score);
            
            return (
              <Link 
                key={section.id}
                to={`.${section.path}`}
                className="block"
              >
                <Card className="p-4 hover:border-primary/50 transition-colors h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn('p-2 rounded-lg', diagnostic.bgColor)}>
                      <Icon className={cn('h-4 w-4', diagnostic.color)} />
                    </div>
                    <span className="font-medium">{section.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn('font-mono font-bold text-lg', diagnostic.color)}>
                      {section.score}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Card>
              </Link>
            );
          })}
          
          {/* Format-specific section */}
          {formatSection && (
            <Link to={`.${formatSection.path}`} className="block">
              <Card className="p-4 hover:border-primary/50 transition-colors h-full bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <formatSection.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{formatSection.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-lg text-primary">
                    {Math.round(formatSection.score)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}

const INITIAL_VISIBLE = 3;

function ExpandableWorkingCard({ items }: { items: Array<{ displayName: string; score: number }> }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, INITIAL_VISIBLE);
  const remaining = items.length - INITIAL_VISIBLE;

  return (
    <Card className="p-5 bg-success/5 border-success/20">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="h-5 w-5 text-success" />
        <h3 className="font-semibold">What's Working</h3>
        <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
      </div>
      <ul className="space-y-2">
        {visible.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
            <span>{item.displayName}</span>
          </li>
        ))}
      </ul>
      {items.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 text-xs font-medium text-success transition-colors hover:opacity-80"
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> +{remaining} more</>
          )}
        </button>
      )}
    </Card>
  );
}

function ExpandableNeedsWorkCard({ broken, underdeveloped }: { broken: Array<{ displayName: string; score: number }>; underdeveloped: Array<{ displayName: string; score: number }> }) {
  const [expanded, setExpanded] = useState(false);
  const allItems = [...broken, ...underdeveloped];
  const visible = expanded ? allItems : allItems.slice(0, INITIAL_VISIBLE);
  const remaining = allItems.length - INITIAL_VISIBLE;

  return (
    <Card className="p-5 bg-chart-4/5 border-chart-4/20">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-chart-4" />
        <h3 className="font-semibold">What Needs Work</h3>
        <Badge variant="secondary" className="ml-auto">{allItems.length}</Badge>
      </div>
      <ul className="space-y-2">
        {visible.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            {item.score < 40 ? (
              <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-chart-4 shrink-0" />
            )}
            <span>{item.displayName}</span>
          </li>
        ))}
      </ul>
      {allItems.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 text-xs font-medium text-chart-4 transition-colors hover:opacity-80"
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> +{remaining} more</>
          )}
        </button>
      )}
    </Card>
  );
}
