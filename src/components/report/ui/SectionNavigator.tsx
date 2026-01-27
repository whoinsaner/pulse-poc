import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NavigationSection {
  id: string;
  label: string;
  path: string;
}

interface SectionNavigatorProps {
  sections: NavigationSection[];
  currentSection: string;
  basePath: string;
  className?: string;
}

export function SectionNavigator({
  sections,
  currentSection,
  basePath,
  className,
}: SectionNavigatorProps) {
  const currentIndex = sections.findIndex(s => s.id === currentSection);
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection = currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;

  return (
    <div className={cn(
      'flex items-center justify-between gap-4 pt-6 mt-8 border-t border-border/50',
      className
    )}>
      {/* Previous */}
      <div className="flex-1">
        {prevSection ? (
          <Link 
            to={`${basePath}${prevSection.path}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>
              <span className="text-xs uppercase tracking-wide block">Previous</span>
              <span className="font-medium">{prevSection.label}</span>
            </span>
          </Link>
        ) : (
          <div /> // Spacer
        )}
      </div>

      {/* Center - View All */}
      <Link to={basePath}>
        <Button variant="outline" size="sm" className="gap-1.5">
          <LayoutGrid className="h-3.5 w-3.5" />
          Cover
        </Button>
      </Link>

      {/* Next */}
      <div className="flex-1 flex justify-end">
        {nextSection ? (
          <Link 
            to={`${basePath}${nextSection.path}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group text-right"
          >
            <span>
              <span className="text-xs uppercase tracking-wide block">Next</span>
              <span className="font-medium">{nextSection.label}</span>
            </span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <div /> // Spacer
        )}
      </div>
    </div>
  );
}

// Compact cross-links for inline use
interface CrossLinkProps {
  to: string;
  label: string;
  className?: string;
}

export function CrossLink({ to, label, className }: CrossLinkProps) {
  return (
    <Link 
      to={to}
      className={cn(
        'inline-flex items-center gap-1 text-sm text-primary hover:underline',
        className
      )}
    >
      {label}
      <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  );
}
