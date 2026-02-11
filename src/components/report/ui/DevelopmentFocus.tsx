import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CrossLink } from './SectionNavigator';
import { StakeholderLens } from '@/types/database';
import { RECOMMENDATION_FRAMES } from '@/lib/stakeholderVocabulary';

interface DevelopmentItem {
  title: string;
  description: string;
  linkTo?: string;
  linkLabel?: string;
  priority?: 'High' | 'Medium' | 'Low';
}

interface DevelopmentFocusProps {
  sectionName: string;
  items: DevelopmentItem[];
  developmentPath?: string;
  relatedSections?: Array<{ label: string; path: string }>;
  stakeholderLens?: StakeholderLens | null;
  className?: string;
}

export function DevelopmentFocus({
  sectionName,
  items,
  developmentPath = '/development',
  relatedSections = [],
  stakeholderLens,
  className,
}: DevelopmentFocusProps) {
  if (items.length === 0) {
    return null;
  }

  // Get stakeholder-specific action framing
  const actionFrame = stakeholderLens ? RECOMMENDATION_FRAMES[stakeholderLens] : null;

  return (
    <Card className={cn('p-5 bg-primary/5 border-primary/20', className)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-sm font-semibold">
              {actionFrame ? `${actionFrame.actionVerb.split(' ')[0]} Focus` : 'Development Focus'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {actionFrame 
                ? `For ${sectionName}, ${actionFrame.actionVerb.toLowerCase()} ${actionFrame.decisionContext}:`
                : `For ${sectionName}, prioritize:`}
            </p>
          </div>

          <ul className="space-y-2">
            {items.slice(0, 2).map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm">{index + 1}.</span>
                <div>
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.priority && (
                    <span className={cn(
                      'ml-2 text-xs px-1.5 py-0.5 rounded',
                      item.priority === 'High' && 'bg-destructive/10 text-destructive',
                      item.priority === 'Medium' && 'bg-chart-4/10 text-chart-4',
                      item.priority === 'Low' && 'bg-muted text-muted-foreground'
                    )}>
                      {item.priority}
                    </span>
                  )}
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </Card>
  );
}

// Inline version for smaller spaces
interface InlineDevelopmentFocusProps {
  message: string;
  linkTo: string;
  linkLabel?: string;
  className?: string;
}

export function InlineDevelopmentFocus({
  message,
  linkTo,
  linkLabel = 'See Development Priorities',
  className,
}: InlineDevelopmentFocusProps) {
  return (
    <div className={cn(
      'flex items-center justify-between gap-4 p-3 rounded-lg bg-primary/5 border border-primary/20',
      className
    )}>
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      
      <Link 
        to={linkTo}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
      >
        {linkLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
