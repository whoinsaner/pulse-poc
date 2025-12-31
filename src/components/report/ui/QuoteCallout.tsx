import { cn } from '@/lib/utils';
import { Quote, FileText, MessageSquare } from 'lucide-react';

interface QuoteCalloutProps {
  quote: string;
  source?: string;
  page?: number;
  character?: string;
  type?: 'dialogue' | 'action' | 'general';
  className?: string;
  style?: React.CSSProperties;
}

export function QuoteCallout({ 
  quote, 
  source, 
  page, 
  character,
  type = 'general',
  className,
  style
}: QuoteCalloutProps) {
  const icons = {
    dialogue: MessageSquare,
    action: FileText,
    general: Quote,
  };
  const Icon = icons[type];

  return (
    <blockquote 
      className={cn(
      "relative glass-premium rounded-xl p-5 pl-14 transition-all duration-300 hover:shadow-lg group",
        className
      )}
      style={style}
    >
      <div className="absolute left-4 top-4 p-2 rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="font-display text-sm italic text-foreground/90 leading-relaxed tracking-wide">
        "{quote}"
      </p>
      {(source || page || character) && (
        <footer className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
          {character && (
            <span className="font-display font-medium text-foreground">{character}</span>
          )}
          {character && (source || page) && <span className="text-primary/50">—</span>}
          {source && <span>{source}</span>}
          {page && <span className="font-mono">Page {page}</span>}
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
      "grid gap-5",
      columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1",
      className
    )}>
      {quotes.map((q, index) => (
        <QuoteCallout 
          key={index} 
          {...q}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
        />
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
      "inline-block px-3 py-1 bg-primary/10 rounded-lg text-sm font-display italic backdrop-blur-sm transition-colors duration-200 hover:bg-primary/15",
      className
    )}>
      "{quote}"
    </span>
  );
}
