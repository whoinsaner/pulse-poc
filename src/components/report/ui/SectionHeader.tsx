import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { ScoreDisplay } from './ScoreDisplay';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  score?: number;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  score, 
  icon: Icon,
  className,
  children 
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-border/50",
      className
    )}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm">
            <Icon className="h-7 w-7 text-primary" />
          </div>
        )}
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {children}
        {score !== undefined && (
          <ScoreDisplay score={score} size="lg" />
        )}
      </div>
    </div>
  );
}

// Sub-section header for nested content
interface SubSectionHeaderProps {
  title: string;
  subtitle?: string;
  score?: number;
  className?: string;
}

export function SubSectionHeader({ title, subtitle, score, className }: SubSectionHeaderProps) {
  return (
    <div className={cn(
      "flex items-center justify-between pb-4 border-b border-border/30 mb-5",
      className
    )}>
      <div>
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {score !== undefined && (
        <ScoreDisplay score={score} size="sm" />
      )}
    </div>
  );
}
