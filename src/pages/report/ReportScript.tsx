import { useEffect, useState } from 'react';
import { useReport } from '@/components/report/ReportLayout';
import { supabase } from '@/integrations/supabase/client';
import { ScriptContentViewer } from '@/components/ScriptContentViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, BookOpen, Film, Hash } from 'lucide-react';

interface ScriptMetadata {
  title: string;
  genre: string | null;
  page_count: number | null;
  script_type: string;
  logline: string | null;
}

export default function ReportScript() {
  const { report } = useReport();
  const [script, setScript] = useState<ScriptMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScript() {
      if (!report?.script_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('scripts')
        .select('title, genre, page_count, script_type, logline')
        .eq('id', report.script_id)
        .single();

      if (!error && data) {
        setScript(data as ScriptMetadata);
      }
      setLoading(false);
    }

    fetchScript();
  }, [report?.script_id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!report?.script_id || !script) {
    return (
      <div className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Script Found</h3>
        <p className="text-muted-foreground text-sm">
          This report doesn't have an associated script.
        </p>
      </div>
    );
  }

  const typeLabel = script.script_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Script Header */}
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight mb-2">
          {script.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="secondary" className="gap-1">
            <Film className="h-3 w-3" />
            {typeLabel}
          </Badge>
          {script.genre && (
            <Badge variant="outline" className="gap-1">
              <BookOpen className="h-3 w-3" />
              {script.genre}
            </Badge>
          )}
          {script.page_count && (
            <Badge variant="outline" className="gap-1">
              <Hash className="h-3 w-3" />
              {script.page_count} pages
            </Badge>
          )}
        </div>
        {script.logline && (
          <p className="text-sm text-muted-foreground italic max-w-2xl">
            {script.logline}
          </p>
        )}
      </div>

      {/* Real extracted content */}
      <ScriptContentViewer scriptId={report.script_id} scriptTitle={script.title} />
    </div>
  );
}
