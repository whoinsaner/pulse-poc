import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, History, BarChart3, Clock, Calendar, 
  FileType, Hash, User
} from 'lucide-react';
import { format } from 'date-fns';
import { ScriptVersionHistory } from '@/components/ScriptVersionHistory';
import { AnalysisRunHistory } from '@/components/AnalysisRunHistory';
import type { ScriptFormat, ScriptType } from '@/types/database';

interface Script {
  id: string;
  title: string;
  format: ScriptFormat;
  script_type: ScriptType;
  page_count: number | null;
  genre: string | null;
  logline: string | null;
  created_at: string;
  updated_at: string;
  file_url: string;
}

interface ScriptDetailDialogProps {
  script: Script | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScriptDetailDialog({ script, open, onOpenChange }: ScriptDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('details');

  if (!script) return null;

  const formatLabel = (format: ScriptFormat) => {
    const labels: Record<ScriptFormat, string> = {
      pdf: 'PDF',
      fdx: 'Final Draft',
      fountain: 'Fountain',
      highland: 'Highland',
      txt: 'Plain Text',
      docx: 'Word Document',
    };
    return labels[format] || format;
  };

  const scriptTypeLabel = (type: ScriptType) => {
    const labels: Record<ScriptType, string> = {
      feature: 'Feature Film',
      pilot: 'TV Pilot',
      episode: 'Episode',
      short: 'Short Film',
      documentary: 'Documentary',
      comic: 'Comic/Graphic Novel',
      web_series: 'Web Series',
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            {script.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Versions
            </TabsTrigger>
            <TabsTrigger value="analyses" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analyses
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="details" className="mt-0 space-y-6">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <FileType className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wide">Format</span>
                  </div>
                  <p className="font-medium">{formatLabel(script.format)}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wide">Type</span>
                  </div>
                  <p className="font-medium">{scriptTypeLabel(script.script_type)}</p>
                </div>

                {script.page_count && (
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Hash className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wide">Pages</span>
                    </div>
                    <p className="font-medium">{script.page_count} pages</p>
                  </div>
                )}

                {script.genre && (
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <span className="text-xs uppercase tracking-wide">Genre</span>
                    </div>
                    <p className="font-medium">{script.genre}</p>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wide">Uploaded</span>
                  </div>
                  <p className="font-medium">{format(new Date(script.created_at), 'MMM d, yyyy')}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wide">Last Updated</span>
                  </div>
                  <p className="font-medium">{format(new Date(script.updated_at), 'MMM d, yyyy')}</p>
                </div>
              </div>

              {/* Logline */}
              {script.logline && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <span className="text-xs uppercase tracking-wide">Logline</span>
                  </div>
                  <p className="text-sm leading-relaxed">{script.logline}</p>
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex items-center gap-2">
                <Badge variant="outline">{script.format.toUpperCase()}</Badge>
                <Badge variant="secondary">{scriptTypeLabel(script.script_type)}</Badge>
                {script.genre && <Badge variant="secondary">{script.genre}</Badge>}
              </div>
            </TabsContent>

            <TabsContent value="versions" className="mt-0">
              <ScriptVersionHistory 
                scriptId={script.id} 
                scriptTitle={script.title}
              />
            </TabsContent>

            <TabsContent value="analyses" className="mt-0">
              <AnalysisRunHistory 
                scriptId={script.id} 
                scriptTitle={script.title}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
