import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Download, FileJson, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportDialogProps {
  reportId: string;
  reportTitle: string;
}

type ExportFormat = 'json' | 'summary' | 'full';

export function ExportDialog({ reportId, reportTitle }: ExportDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const exportOptions = [
    {
      format: 'summary' as ExportFormat,
      icon: FileText,
      title: 'Executive Summary',
      description: 'Concise overview with key scores and insights for stakeholders',
    },
    {
      format: 'full' as ExportFormat,
      icon: FileText,
      title: 'Full Report',
      description: 'Comprehensive analysis with all parameters, evidence, and characters',
    },
    {
      format: 'json' as ExportFormat,
      icon: FileJson,
      title: 'Raw JSON Data',
      description: 'Complete data export for custom processing and integrations',
    },
  ];

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    
    try {
      const { data, error } = await supabase.functions.invoke('export-report', {
        body: { reportId, format }
      });

      if (error) throw error;

      if (format === 'json') {
        // Direct JSON download
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${sanitizeFilename(reportTitle)}_export.json`);
      } else {
        // Markdown content - create downloadable file
        const blob = new Blob([data.content], { type: 'text/markdown' });
        downloadBlob(blob, `${sanitizeFilename(reportTitle)}_${format}.md`);
      }

      toast({
        title: 'Export Complete',
        description: `Your ${format === 'summary' ? 'executive summary' : format === 'full' ? 'full report' : 'data'} has been downloaded.`,
      });
      
      setOpen(false);
    } catch (err) {
      console.error('Export error:', err);
      toast({
        title: 'Export Failed',
        description: 'Unable to export report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sanitizeFilename = (name: string): string => {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Choose an export format for "{reportTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isExporting = exporting === option.format;
            
            return (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                disabled={exporting !== null}
                className={cn(
                  'w-full p-4 rounded-lg border text-left transition-all',
                  'hover:border-primary/50 hover:bg-primary/5',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isExporting && 'border-primary bg-primary/5'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    {isExporting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{option.title}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
