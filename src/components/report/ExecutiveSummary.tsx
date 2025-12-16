import { ScriptType } from '@/types/database';
import { FileText, Sparkles } from 'lucide-react';

interface ExecutiveSummaryProps {
  summary: string;
  scriptMetadata?: {
    title: string;
    logline?: string;
    genre?: string;
    scriptType: ScriptType;
    pageCount?: number;
  };
}

export function ExecutiveSummary({ summary, scriptMetadata }: ExecutiveSummaryProps) {
  if (!summary) {
    return null;
  }

  // Split summary into paragraphs for better readability
  const paragraphs = summary.split('\n\n').filter(Boolean);

  return (
    <div className="bg-card/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Executive Summary</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main summary */}
          <div className="lg:col-span-2 space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-lg leading-relaxed text-muted-foreground animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Quick stats sidebar */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Script Details</span>
              </div>
              <dl className="space-y-2 text-sm">
                {scriptMetadata?.genre && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Genre</dt>
                    <dd className="font-medium">{scriptMetadata.genre}</dd>
                  </div>
                )}
                {scriptMetadata?.scriptType && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium capitalize">{scriptMetadata.scriptType}</dd>
                  </div>
                )}
                {scriptMetadata?.pageCount && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Pages</dt>
                    <dd className="font-medium">{scriptMetadata.pageCount}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* AI Analysis badge */}
            <div className="p-4 rounded-lg gradient-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium">AI-Powered Analysis</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This report was generated using 9 specialized AI agents analyzing structure, character, dialogue, and market factors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
