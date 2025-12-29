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
    <Card className="border-primary/20 bg-card/95">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Select Stakeholder Perspective</CardTitle>
            <CardDescription>
              Choose who this analysis is for — we'll focus on the parameters that matter most to them.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selected}
          onValueChange={(value) => setSelected(value as StakeholderLens | 'all')}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
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
                  'relative flex flex-col gap-2 p-4 rounded-lg border cursor-pointer transition-all',
                  isSelected 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={option} id={option} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {isAll ? 'All Stakeholders' : config?.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isAll 
                        ? 'Comprehensive analysis covering all perspectives' 
                        : desc?.focus
                      }
                    </p>
                    {!isAll && desc && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {desc.keyMetrics.slice(0, 2).map((metric) => (
                          <Badge key={metric} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Label>
            );
          })}
        </RadioGroup>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Selected:</span>
            <StakeholderBadge lens={selected === 'all' ? null : selected} size="sm" />
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button onClick={handleConfirm}>
              Start Analysis
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
