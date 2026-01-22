import { useState } from 'react';
import { StakeholderLens, LENS_CONFIG } from '@/types/database';
import { STAKEHOLDER_DESCRIPTIONS } from '@/lib/stakeholderConfig';
import { StakeholderBadge, STAKEHOLDER_ICONS } from '@/components/StakeholderBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StakeholderSelectorProps {
  onSelect: (lens: StakeholderLens | null) => void;
  onCancel?: () => void;
  selectedLens?: StakeholderLens | null;
}

const STAKEHOLDER_OPTIONS: (StakeholderLens | 'all')[] = [
  'all',
  'studio_executive',
  'producer',
  'director',
  'writer',
  'actor',
  'financier',
  'ott_platform',
  'theatrical',
];

export function StakeholderSelector({ 
  onSelect, 
  onCancel,
  selectedLens: initialLens 
}: StakeholderSelectorProps) {
  const [selected, setSelected] = useState<StakeholderLens | 'all'>(initialLens ?? 'all');

  const handleConfirm = () => {
    onSelect(selected === 'all' ? null : selected);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-foreground">Select Stakeholder Perspective</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose who this analysis is for — we'll focus on the parameters that matter most to them.
          </p>
        </div>
      </div>

      {/* Grid of options */}
      <RadioGroup
        value={selected}
        onValueChange={(value) => setSelected(value as StakeholderLens | 'all')}
        className="grid grid-cols-3 gap-3"
      >
        {STAKEHOLDER_OPTIONS.map((option) => {
          const isAll = option === 'all';
          const Icon = isAll ? Users : STAKEHOLDER_ICONS[option as StakeholderLens];
          const config = isAll ? null : LENS_CONFIG[option as StakeholderLens];
          const desc = isAll ? null : STAKEHOLDER_DESCRIPTIONS[option as StakeholderLens];
          const isSelected = selected === option;

          return (
            <Label
              key={option}
              htmlFor={option}
              className={cn(
                'group relative flex flex-col rounded-lg border-2 p-4 cursor-pointer transition-all h-[140px] overflow-hidden',
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
              )}
            >
              {/* Radio + Icon + Label row */}
              <div className="flex items-center gap-2 mb-2">
                <RadioGroupItem value={option} id={option} className="shrink-0" />
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium text-sm text-foreground leading-tight">
                  {isAll ? 'All Stakeholders' : config?.label}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                {isAll 
                  ? 'Comprehensive analysis covering all perspectives' 
                  : desc?.focus
                }
              </p>
              
              {/* Key metrics badges */}
              {!isAll && desc && (
                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                  {desc.keyMetrics.slice(0, 2).map((metric) => (
                    <span 
                      key={metric} 
                      className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              )}
            </Label>
          );
        })}
      </RadioGroup>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Selected:</span>
          <StakeholderBadge lens={selected === 'all' ? null : selected} size="sm" />
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleConfirm}>
            Start Analysis
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Compact version for inline use
export function StakeholderQuickSelect({
  value,
  onChange,
  className,
}: {
  value: StakeholderLens | null;
  onChange: (lens: StakeholderLens | null) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => onChange(null)}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
          value === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
        )}
      >
        <Users className="h-3.5 w-3.5 inline mr-1.5" />
        All
      </button>
      {Object.entries(LENS_CONFIG).map(([lens, config]) => {
        const Icon = STAKEHOLDER_ICONS[lens as StakeholderLens];
        return (
          <button
            key={lens}
            onClick={() => onChange(lens as StakeholderLens)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              value === lens
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            )}
          >
            <Icon className="h-3.5 w-3.5 inline mr-1.5" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
