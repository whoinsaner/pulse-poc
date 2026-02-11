import { useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  SectionHeader, 
  SectionNavigator,
  CrossLink,
} from '@/components/report/ui';
import { 
  getDecisionSignal,
  getFixCostColor,
  getFixCostBg,
  getDiagnosticCategory,
  getWeightTier,
} from '@/lib/scoreUtils';
import { DecisionSignalBadge } from '@/components/report/DecisionSignalBadge';
import { cn } from '@/lib/utils';
import {
  ListTodo,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Target,
  Wrench,
  TrendingUp,
} from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

// Navigation sections
const NAV_SECTIONS = [
  { id: 'cover', label: 'Cover', path: '' },
  { id: 'story', label: 'Story', path: '/story' },
  { id: 'characters', label: 'Characters', path: '/characters' },
  { id: 'craft', label: 'Craft', path: '/craft' },
  { id: 'commercial', label: 'Commercial', path: '/commercial' },
  { id: 'development', label: 'Development', path: '/development' },
];

// Map categories to sections
const CATEGORY_TO_SECTION: Record<string, { label: string; path: string }> = {
  'Concept & Hook': { label: 'Story', path: '/story' },
  'Structure': { label: 'Story', path: '/story' },
  'Conflict': { label: 'Story', path: '/story' },
  'Character': { label: 'Characters', path: '/characters' },
  'Dialogue': { label: 'Craft', path: '/craft' },
  'Theme': { label: 'Craft', path: '/craft' },
  'World & Logic': { label: 'Craft', path: '/craft' },
  'Emotional Arc': { label: 'Craft', path: '/craft' },
  'Market': { label: 'Commercial', path: '/commercial' },
  'Execution': { label: 'Commercial', path: '/commercial' },
  'Web Series': { label: 'Format', path: '/format' },
  'Micro Drama': { label: 'Format', path: '/format' },
};

export default function DevelopmentPriorities() {
  const context = useOutletContext<ReportContextValue>();
  
  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const { reportData, currentScore } = context;
  const decision = getDecisionSignal(currentScore);

  // Get base path
  const basePath = window.location.pathname.split('/development')[0];

  // Categorize all parameters by priority
  const priorities = useMemo(() => {
    const params = reportData.parameterScores || [];
    
    // Priority 1: Broken core parameters (score < 40, weight >= 1.2)
    const criticalCore = params.filter(p => {
      const weight = 1.0; // Would come from lens weights
      return p.score < 40 && weight >= 1.2;
    });
    
    // Priority 2: Broken standard parameters (score < 40, weight < 1.2)
    const criticalStandard = params.filter(p => {
      const weight = 1.0;
      return p.score < 40 && weight < 1.2;
    });
    
    // Priority 3: Underdeveloped core parameters (40-70, high impact)
    const developCore = params.filter(p => {
      return p.score >= 40 && p.score < 70 && p.upsideImpact === 'High';
    });
    
    // Priority 4: Underdeveloped standard (40-70, medium/low impact)
    const developStandard = params.filter(p => {
      return p.score >= 40 && p.score < 70 && p.upsideImpact !== 'High';
    });
    
    // Priority 5: Polish items (70+, but not excellent)
    const polish = params.filter(p => {
      return p.score >= 70 && p.score < 85;
    });

    return {
      criticalCore,
      criticalStandard,
      developCore,
      developStandard,
      polish,
    };
  }, [reportData.parameterScores]);

  // All broken items combined
  const allBroken = [...priorities.criticalCore, ...priorities.criticalStandard];
  const allUnderdeveloped = [...priorities.developCore, ...priorities.developStandard];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <SectionHeader
        title="Development Priorities"
        subtitle="Actionable rewrite focus areas ordered by impact"
        icon={ListTodo}
      >
        <DecisionSignalBadge score={currentScore} size="md" />
      </SectionHeader>

      {/* Decision Context */}
      <Card className={cn('p-5', decision.bgColor, `border ${decision.borderColor}`)}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className={cn('font-semibold mb-1', decision.color)}>
              Current Status: {decision.label}
            </h3>
            <p className="text-sm text-muted-foreground">
              {decision.description}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono">{Math.round(currentScore)}</span>
            <p className="text-xs text-muted-foreground">Overall Score</p>
          </div>
        </div>
      </Card>

      {/* Priority 1: Critical Issues */}
      {allBroken.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold">Priority 1: Fix Critical Issues</h3>
            <Badge variant="destructive">{allBroken.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {allBroken.slice(0, 5).map((param) => (
              <PriorityItem 
                key={param.parameterName}
                param={param}
                basePath={basePath}
                priority="critical"
              />
            ))}
          </div>
        </div>
      )}

      {/* Priority 2: Development Focus */}
      {allUnderdeveloped.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-chart-4" />
            <h3 className="font-semibold">Priority 2: Develop Underdeveloped Areas</h3>
            <Badge className="bg-chart-4/20 text-chart-4">{allUnderdeveloped.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {allUnderdeveloped.slice(0, 6).map((param) => (
              <PriorityItem 
                key={param.parameterName}
                param={param}
                basePath={basePath}
                priority="develop"
              />
            ))}
            {allUnderdeveloped.length > 6 && (
              <p className="text-sm text-muted-foreground pl-4">
                +{allUnderdeveloped.length - 6} more items
              </p>
            )}
          </div>
        </div>
      )}

      {/* Priority 3: Polish */}
      {priorities.polish.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-chart-3" />
            <h3 className="font-semibold">Priority 3: Polish & Refine</h3>
            <Badge className="bg-chart-3/20 text-chart-3">{priorities.polish.length}</Badge>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            {priorities.polish.slice(0, 6).map((param) => (
              <Card key={param.parameterName} className="p-3 bg-chart-3/5 border-chart-3/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{param.displayName}</span>
                  <span className="font-mono text-sm">{param.score}</span>
                </div>
                {param.rationale && (
                  <p className="text-xs text-muted-foreground mt-1">{param.rationale}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Summary Actions */}
      <Card className="p-5 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-2">Next Steps Summary</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {allBroken.length > 0 && (
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  Address {allBroken.length} critical structural issue{allBroken.length !== 1 ? 's' : ''} first
                </li>
              )}
              {priorities.developCore.length > 0 && (
                <li className="flex items-center gap-2">
                  <Wrench className="h-3.5 w-3.5 text-chart-4 shrink-0" />
                  Develop {priorities.developCore.length} high-impact area{priorities.developCore.length !== 1 ? 's' : ''} for maximum improvement
                </li>
              )}
              {allBroken.length === 0 && allUnderdeveloped.length === 0 && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                  Script is in good shape—focus on polish pass
                </li>
              )}
            </ul>
          </div>
        </div>
      </Card>



    </div>
  );
}

// Priority item component
interface PriorityItemProps {
  param: {
    parameterName: string;
    displayName: string;
    score: number;
    category: string;
    rationale?: string;
    fixCost?: string;
    upsideImpact?: string;
    evidence?: Array<{ quote?: string; explanation?: string }>;
  };
  basePath: string;
  priority: 'critical' | 'develop';
}

function PriorityItem({ param, basePath, priority }: PriorityItemProps) {
  const section = CATEGORY_TO_SECTION[param.category];
  const diagnostic = getDiagnosticCategory(param.score);

  return (
    <Card className={cn(
      'p-4',
      priority === 'critical' 
        ? 'bg-destructive/5 border-destructive/20' 
        : 'bg-chart-4/5 border-chart-4/20'
    )}>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{param.displayName}</span>
            <Badge variant="outline" className="text-[10px]">
              {param.category}
            </Badge>
            {param.fixCost && (
              <Badge 
                variant="outline" 
                className={cn('text-[10px]', getFixCostColor(param.fixCost), getFixCostBg(param.fixCost))}
              >
                Fix: {param.fixCost}
              </Badge>
            )}
          </div>
          
          {param.rationale && (
            <p className="text-sm text-muted-foreground mb-2">
              {param.rationale}
            </p>
          )}
          
          {param.evidence?.[0]?.quote && (
            <p className="text-xs text-muted-foreground italic">
              "{param.evidence[0].quote}"
            </p>
          )}
        </div>
        
        <div className="text-right shrink-0">
          <span className={cn('font-mono font-bold text-lg', diagnostic.color)}>
            {param.score}
          </span>
          {section && (
            <Link to={`${basePath}${section.path}`}>
              <Button variant="ghost" size="sm" className="mt-1">
                {section.label}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
