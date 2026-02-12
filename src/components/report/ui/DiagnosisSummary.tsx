import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getDiagnosticCategory, getFixCostColor, getFixCostBg } from '@/lib/scoreUtils';
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { StakeholderLens } from '@/types/database';
import { translateTerm } from '@/lib/stakeholderVocabulary';

// Parameter score data interface
export interface DiagnosticParameter {
  parameterName: string;
  displayName: string;
  score: number;
  rationale?: string;
  fixCost?: 'Low' | 'Medium' | 'High';
  evidence?: Array<{ quote?: string; explanation?: string }>;
  linkTo?: string;
  // Adapted content from stakeholder report
  adaptedRationale?: string;
}

interface DiagnosisSummaryProps {
  parameters: DiagnosticParameter[];
  categoryName: string;
  developmentLink?: string;
  stakeholderLens?: StakeholderLens | null;
  verdict?: string;
  className?: string;
}

export function DiagnosisSummary({ 
  parameters, 
  categoryName, 
  developmentLink,
  stakeholderLens,
  verdict,
  className 
}: DiagnosisSummaryProps) {
  // Apply stakeholder-specific translations if lens is set
  const processedParameters = parameters.map(p => {
    if (stakeholderLens && p.rationale) {
      return {
        ...p,
        // Use adapted rationale if available, otherwise translate key terms
        rationale: p.adaptedRationale || translateTermsInText(p.rationale, stakeholderLens)
      };
    }
    return p;
  });

  // Group parameters by diagnostic category
  const working = processedParameters.filter(p => p.score >= 70);
  const underdeveloped = processedParameters.filter(p => p.score >= 40 && p.score < 70);
  const broken = processedParameters.filter(p => p.score < 40);

  // Auto-generate verdict if not provided
  const displayVerdict = verdict || (() => {
    if (parameters.length === 0) return '';
    const avgScore = Math.round(parameters.reduce((s, p) => s + p.score, 0) / parameters.length);
    const topStrengths = working.slice(0, 2).map(p => p.displayName.toLowerCase());
    const topWeaknesses = [...broken, ...underdeveloped].slice(0, 2).map(p => p.displayName.toLowerCase());
    
    const strengthText = topStrengths.length > 0 
      ? `with solid performance in ${topStrengths.join(' and ')}` 
      : '';
    const weaknessText = topWeaknesses.length > 0 
      ? `but needs development in ${topWeaknesses.join(' and ')}` 
      : 'with no critical areas requiring immediate attention';
    
    const level = avgScore >= 75 ? 'strong foundation' : avgScore >= 50 ? 'a developing foundation' : 'significant structural gaps';
    return `The ${categoryName.toLowerCase()} analysis reveals ${level} ${strengthText}, ${weaknessText}.`;
  })();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Verdict */}
      {displayVerdict && (
        <div className="rounded-xl border border-success/20 border-l-4 border-l-success bg-success/5 p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-success/10">
              <Settings2 className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-semibold tracking-tight text-success">Verdict</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{verdict}</p>
            </div>
          </div>
        </div>
      )}

      {parameters.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No parameters available for diagnosis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* What's Working */}
          <DiagnosisSection
            icon={CheckCircle}
            title="What's Working"
            items={working}
            colorClass="text-success"
            bgClass="bg-success/5"
            borderClass="border-l-4 border-l-success border border-success/20"
            emptyMessage="No strengths identified yet"
          />

          {/* What's Broken */}
          <DiagnosisSection
            icon={XCircle}
            title="What's Broken"
            items={broken}
            colorClass="text-destructive"
            bgClass="bg-destructive/5"
            borderClass="border-l-4 border-l-destructive border border-destructive/20"
            showFixCost
            showLink
            emptyMessage="No structural issues found"
          />

          {/* Underdeveloped */}
          <DiagnosisSection
            icon={AlertCircle}
            title="Underdeveloped"
            items={underdeveloped}
            colorClass="text-chart-4"
            bgClass="bg-chart-4/5"
            borderClass="border-l-4 border-l-chart-4 border border-chart-4/20"
            showFixCost
            emptyMessage="No underdeveloped areas found"
          />
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
  emptyMessage?: string;
}

const INITIAL_VISIBLE_COUNT = 3;

function DiagnosisSection({
  icon: Icon,
  title,
  items,
  colorClass,
  bgClass,
  borderClass,
  showFixCost = false,
  showLink = false,
  emptyMessage,
}: DiagnosisSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > INITIAL_VISIBLE_COUNT;
  const visibleItems = expanded ? items : items.slice(0, INITIAL_VISIBLE_COUNT);
  const remainingCount = items.length - INITIAL_VISIBLE_COUNT;

  return (
    <div className={cn('rounded-xl p-4', bgClass, borderClass)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn('h-4 w-4', colorClass)} />
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
      </div>
      
      {items.length === 0 && emptyMessage ? (
        <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
      ) : (
      <ul className="space-y-3">
        {visibleItems.map((item) => (
          <li key={item.parameterName} className="flex items-start gap-2">
            <Icon className={cn('h-3.5 w-3.5 mt-1 shrink-0', colorClass)} />
            <span className="text-sm text-muted-foreground">
              {item.rationale || item.displayName}
              {item.evidence?.[0]?.quote && (
                <span className="block text-xs italic mt-1">
                  (evidence: {item.evidence[0].quote})
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      )}

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex items-center gap-1 mt-3 text-xs font-medium transition-colors hover:opacity-80',
            colorClass
          )}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              +{remainingCount} more
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Helper to translate terms in text using stakeholder vocabulary
function translateTermsInText(text: string, stakeholderLens: StakeholderLens): string {
  // Common terms that might appear in rationales
  const termMappings: Record<string, Record<string, string>> = {
    'lacks depth': {
      actor: 'offers limited emotional range opportunities',
      producer: 'needs development passes',
      financier: 'presents marketability concerns',
      director: 'requires visual texture work',
      writer: 'needs layering',
      studio_executive: 'may limit talent attachment',
      ott_platform: 'may impact viewer retention',
      theatrical: 'has audience connection gaps',
      investor: 'affects package value'
    },
    'structural issues': {
      actor: 'disrupts performance flow',
      producer: 'requires schedule adjustment',
      financier: 'increases development costs',
      director: 'needs pacing attention',
      writer: 'needs act refinement',
      studio_executive: 'requires development cycle',
      ott_platform: 'affects episode mechanics',
      theatrical: 'impacts satisfaction',
      investor: 'extends timeline'
    },
    'unclear': {
      actor: 'lacks clear performance beats',
      producer: 'needs clarification for package',
      financier: 'creates uncertainty',
      director: 'requires visual anchoring',
      writer: 'needs sharpening',
      studio_executive: 'needs development focus',
      ott_platform: 'affects hook clarity',
      theatrical: 'needs audience clarity',
      investor: 'increases risk'
    }
  };

  let result = text;
  for (const [term, translations] of Object.entries(termMappings)) {
    if (result.toLowerCase().includes(term) && translations[stakeholderLens]) {
      result = result.replace(new RegExp(term, 'gi'), translations[stakeholderLens]);
    }
  }
  return result;
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
