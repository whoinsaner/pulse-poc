import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Download, FileJson, FileText, Loader2, FileType } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReportData, StakeholderLens, ScriptType } from '@/types/database';
import { generateFullReportPDF } from '@/lib/fullReportPdfGenerator';

interface ExportDialogProps {
  reportId: string;
  reportTitle: string;
  reportData?: ReportData | null;
  activeLens?: StakeholderLens;
  scriptType?: ScriptType;
}

type ExportFormat = 'json' | 'summary' | 'full' | 'pdf';

export function ExportDialog({ reportId, reportTitle, reportData, activeLens = 'studio_executive', scriptType = 'feature' }: ExportDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [customFilename, setCustomFilename] = useState('');

  const exportOptions = [
    {
      format: 'pdf' as ExportFormat,
      icon: FileType,
      title: 'PDF Report',
      description: 'Full book-style PDF with TOC, agent narratives, and all sections',
      badge: 'Recommended',
    },
    {
      format: 'summary' as ExportFormat,
      icon: FileText,
      title: 'Executive Summary',
      description: 'Concise overview with key scores and insights',
    },
    {
      format: 'full' as ExportFormat,
      icon: FileText,
      title: 'Full Report',
      description: 'Comprehensive analysis with all parameters and evidence',
    },
    {
      format: 'json' as ExportFormat,
      icon: FileJson,
      title: 'Raw JSON Data',
      description: 'Complete data export for custom processing',
    },
  ];

  const getFilename = (format: ExportFormat) => {
    const base = customFilename.trim() || sanitizeFilename(reportTitle);
    const extension = format === 'json' ? 'json' : format === 'pdf' ? 'pdf' : 'md';
    return `${base}_${format}.${extension}`;
  };

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    
    try {
      // PDF: generate client-side if we have reportData
      if (format === 'pdf' && reportData) {
        const blob = await generateFullReportPDF(reportData, reportTitle, activeLens, scriptType);
        downloadBlob(blob, getFilename('pdf'));
        toast({
          title: 'Export Complete',
          description: 'Your full PDF report has been downloaded.',
        });
        setOpen(false);
        return;
      }

      // Fallback to edge function for non-PDF or when reportData missing
      const { data, error } = await supabase.functions.invoke('export-report', {
        body: { reportId, format }
      });

      if (error) throw error;

      const filename = getFilename(format);

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, filename);
      } else if (format === 'pdf') {
        // Fallback PDF from edge function
        if (data.pdf) {
          const binaryString = atob(data.pdf);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          downloadBlob(blob, filename);
        } else {
          // Convert markdown to a simple text-based PDF instead of raw .md
          const { jsPDF } = await import('jspdf');
          const fallbackDoc = new jsPDF({ unit: 'mm', format: 'a4' });
          const lines = fallbackDoc.splitTextToSize(data.content || '', 170);
          let fy = 20;
          for (const line of lines) {
            if (fy > 275) { fallbackDoc.addPage(); fy = 20; }
            fallbackDoc.text(line, 20, fy);
            fy += 5;
          }
          fallbackDoc.save(filename.replace(/\.\w+$/, '.pdf'));
        }
      } else {
        const blob = new Blob([data.content], { type: 'text/markdown' });
        downloadBlob(blob, filename);
      }

      toast({
        title: 'Export Complete',
        description: `Your ${format === 'summary' ? 'executive summary' : format === 'full' ? 'full report' : format === 'pdf' ? 'PDF report' : 'data'} has been downloaded.`,
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
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
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
        
        <div className="space-y-4 py-4">
          {/* Custom filename input */}
          <div className="space-y-2">
            <Label htmlFor="filename" className="text-sm text-muted-foreground">
              Custom filename (optional)
            </Label>
            <Input
              id="filename"
              placeholder={sanitizeFilename(reportTitle)}
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Export options */}
          <div className="space-y-2">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              const isExporting = exporting === option.format;
              
              return (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  disabled={exporting !== null}
                  className={cn(
                    'w-full p-4 rounded-xl border text-left transition-all',
                    'hover:border-primary/50 hover:bg-primary/5',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    isExporting && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {isExporting ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{option.title}</h4>
                        {option.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
