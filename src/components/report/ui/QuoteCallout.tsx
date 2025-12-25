import { cn } from '@/lib/utils';
import { Quote, FileText, MessageSquare } from 'lucide-react';

interface QuoteCalloutProps {
  quote: string;
  source?: string;
  page?: number;
  character?: string;
  type?: 'dialogue' | 'action' | 'general';
  className?: string;
}

export function QuoteCallout({ 
  quote, 
  source, 
  page, 
  character,
  type = 'general',
  className 
}: QuoteCalloutProps) {
  const icons = {
    dialogue: MessageSquare,
    action: FileText,
    general: Quote,
  };
  const Icon = icons[type];

  return (
    <blockquote className={cn(
      "relative rounded-xl border border-border bg-muted/30 p-4 pl-12",
      className
    )}>
      <Icon className="absolute left-4 top-4 h-5 w-5 text-primary/60" />
      <p className="text-sm italic text-foreground/90 leading-relaxed">
        "{quote}"
      </p>
      {(source || page || character) && (
        <footer className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {character && (
            <span className="font-medium text-foreground">{character}</span>
          )}
          {character && (source || page) && <span>—</span>}
          {source && <span>{source}</span>}
          {page && <span>Page {page}</span>}
        </footer>
      )}
    </blockquote>
  );
}

// Multiple quotes in a grid
interface QuoteGridProps {
  quotes: {
    quote: string;
    source?: string;
    page?: number;
    character?: string;
    type?: 'dialogue' | 'action' | 'general';
  }[];
  columns?: 1 | 2;
  className?: string;
}

export function QuoteGrid({ quotes, columns = 2, className }: QuoteGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1",
      className
    )}>
      {quotes.map((q, index) => (
        <QuoteCallout key={index} {...q} />
      ))}
    </div>
  );
}

// Inline quote for text context
interface InlineQuoteProps {
  quote: string;
  className?: string;
}

export function InlineQuote({ quote, className }: InlineQuoteProps) {
  return (
    <span className={cn(
      "inline-block px-2 py-0.5 bg-primary/10 rounded text-sm italic",
      className
    )}>
      "{quote}"
    </span>
  );
}
