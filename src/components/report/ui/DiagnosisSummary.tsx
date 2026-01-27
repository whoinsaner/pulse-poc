import { cn } from '@/lib/utils';
import { getDiagnosticCategory, getFixCostColor, getFixCostBg } from '@/lib/scoreUtils';
import { CheckCircle, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

// Parameter score data interface
export interface DiagnosticParameter {
  parameterName: string;
  displayName: string;
  score: number;
  rationale?: string;
  fixCost?: 'Low' | 'Medium' | 'High';
  evidence?: Array<{ quote?: string; explanation?: string }>;
  linkTo?: string;
}

interface DiagnosisSummaryProps {
  parameters: DiagnosticParameter[];
  categoryName: string;
  developmentLink?: string;
  className?: string;
}

export function DiagnosisSummary({ 
  parameters, 
  categoryName, 
  developmentLink,
  className 
}: DiagnosisSummaryProps) {
  // Group parameters by diagnostic category
  const working = parameters.filter(p => p.score >= 70);
  const underdeveloped = parameters.filter(p => p.score >= 40 && p.score < 70);
  const broken = parameters.filter(p => p.score < 40);

  const IconMap = {
    CheckCircle,
    AlertCircle,
    XCircle,
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* What's Working */}
      {working.length > 0 && (
        <DiagnosisSection
          icon={CheckCircle}
          title="What's Working"
          items={working}
          colorClass="text-success"
          bgClass="bg-success/5"
          borderClass="border-success/20"
        />
      )}

      {/* What's Structurally Broken */}
      {broken.length > 0 && (
        <DiagnosisSection
          icon={XCircle}
          title="What's Structurally Broken"
          items={broken}
          colorClass="text-destructive"
          bgClass="bg-destructive/5"
          borderClass="border-destructive/20"
          showFixCost
          showLink
        />
      )}

      {/* What's Underdeveloped */}
      {underdeveloped.length > 0 && (
        <DiagnosisSection
          icon={AlertCircle}
          title="What's Underdeveloped"
          items={underdeveloped}
          colorClass="text-chart-4"
          bgClass="bg-chart-4/5"
          borderClass="border-chart-4/20"
          showFixCost
        />
      )}

      {/* Empty state */}
      {parameters.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No parameters available for diagnosis.</p>
        </div>
      )}
    </div>
  );
}

interface DiagnosisSectionProps {
  icon: typeof CheckCircle;
  title: string;
  items: DiagnosticParameter[];
  colorClass: string;
  bgClass: string;
  borderClass: string;
  showFixCost?: boolean;
  showLink?: boolean;
}

function DiagnosisSection({
  icon: Icon,
  title,
  items,
  colorClass,
  bgClass,
  borderClass,
  showFixCost = false,
  showLink = false,
}: DiagnosisSectionProps) {
  return (
    <div className={cn('rounded-xl border p-4', bgClass, borderClass)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn('h-4 w-4', colorClass)} />
        <h4 className={cn('text-sm font-semibold', colorClass)}>{title}</h4>
        <Badge variant="secondary" className="text-xs ml-auto">
          {items.length}
        </Badge>
      </div>
      
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.parameterName} className="flex items-start gap-3">
            <span className="text-sm flex-1">
              <span className="font-medium">{item.displayName}</span>
              {item.rationale && (
                <span className="text-muted-foreground"> — {item.rationale}</span>
              )}
              {item.evidence?.[0]?.quote && (
                <span className="block text-xs text-muted-foreground italic mt-1">
                  "{item.evidence[0].quote}"
                </span>
              )}
            </span>
            
            <div className="flex items-center gap-2 shrink-0">
              {showFixCost && item.fixCost && (
                <Badge 
                  variant="outline" 
                  className={cn('text-[10px]', getFixCostColor(item.fixCost), getFixCostBg(item.fixCost))}
                >
                  Fix: {item.fixCost}
                </Badge>
              )}
              
              {showLink && item.linkTo && (
                <Link 
                  to={item.linkTo}
                  className="text-primary hover:underline flex items-center gap-1 text-xs"
                >
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Compact version for sidebar or cards
interface CompactDiagnosisProps {
  working: number;
  underdeveloped: number;
  broken: number;
  className?: string;
}

export function CompactDiagnosis({ working, underdeveloped, broken, className }: CompactDiagnosisProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {working > 0 && (
        <div className="flex items-center gap-1 text-success">
          <CheckCircle className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">{working}</span>
        </div>
      )}
      {underdeveloped > 0 && (
        <div className="flex items-center gap-1 text-chart-4">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">{underdeveloped}</span>
        </div>
      )}
      {broken > 0 && (
        <div className="flex items-center gap-1 text-destructive">
          <XCircle className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">{broken}</span>
        </div>
      )}
    </div>
  );
}
