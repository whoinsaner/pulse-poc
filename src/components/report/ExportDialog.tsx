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
  executiveSummary?: string | null;
}

type ExportFormat = 'json' | 'summary' | 'pdf';

export function ExportDialog({ reportId, reportTitle, reportData, activeLens = 'studio_executive', scriptType = 'feature', executiveSummary }: ExportDialogProps) {
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
      description: 'Concise overview with key scores and insights (PDF)',
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
    const extension = format === 'json' ? 'json' : 'pdf';
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
      } else {
        // Summary format — convert markdown to PDF
        const { jsPDF } = await import('jspdf');
        const summaryDoc = new jsPDF({ unit: 'mm', format: 'a4' });
        const content = data.content || '';
        const pw = summaryDoc.internal.pageSize.getWidth();

        // Title
        summaryDoc.setFontSize(18);
        summaryDoc.setFont('helvetica', 'bold');
        summaryDoc.text(data.title || reportTitle, 20, 25);
        summaryDoc.setDrawColor(99, 102, 241);
        summaryDoc.setLineWidth(0.8);
        summaryDoc.line(20, 30, 60, 30);

        // Body
        summaryDoc.setFontSize(10);
        summaryDoc.setFont('helvetica', 'normal');
        let sy = 38;
        const contentLines = content.split('\n');
        for (const rawLine of contentLines) {
          const trimmed = rawLine.trim();
          if (!trimmed) { sy += 4; continue; }

          // Handle markdown headers
          if (trimmed.startsWith('####')) {
            sy += 3;
            summaryDoc.setFontSize(11);
            summaryDoc.setFont('helvetica', 'bold');
            const headerText = trimmed.replace(/^#{1,4}\s*/, '').replace(/\*\*/g, '');
            if (sy > 275) { summaryDoc.addPage(); sy = 20; }
            summaryDoc.text(headerText, 20, sy);
            sy += 6;
            summaryDoc.setFontSize(10);
            summaryDoc.setFont('helvetica', 'normal');
            continue;
          }
          if (trimmed.startsWith('###')) {
            sy += 4;
            summaryDoc.setFontSize(12);
            summaryDoc.setFont('helvetica', 'bold');
            const headerText = trimmed.replace(/^#{1,3}\s*/, '').replace(/\*\*/g, '');
            if (sy > 275) { summaryDoc.addPage(); sy = 20; }
            summaryDoc.text(headerText, 20, sy);
            sy += 7;
            summaryDoc.setFontSize(10);
            summaryDoc.setFont('helvetica', 'normal');
            continue;
          }
          if (trimmed.startsWith('##')) {
            sy += 5;
            summaryDoc.setFontSize(14);
            summaryDoc.setFont('helvetica', 'bold');
            const headerText = trimmed.replace(/^#{1,2}\s*/, '').replace(/\*\*/g, '');
            if (sy > 275) { summaryDoc.addPage(); sy = 20; }
            summaryDoc.text(headerText, 20, sy);
            sy += 8;
            summaryDoc.setFontSize(10);
            summaryDoc.setFont('helvetica', 'normal');
            continue;
          }
          if (trimmed.startsWith('#')) {
            continue; // Skip top-level title (already rendered above)
          }
          if (trimmed === '---') { sy += 3; continue; }

          // Strip markdown bold markers
          const cleanLine = trimmed.replace(/\*\*/g, '');
          const wrapped = summaryDoc.splitTextToSize(cleanLine, pw - 40);
          for (const wl of wrapped) {
            if (sy > 275) { summaryDoc.addPage(); sy = 20; }
            summaryDoc.text(wl, 20, sy);
            sy += 5;
          }
        }

        // Footer
        const ph = summaryDoc.internal.pageSize.getHeight();
        summaryDoc.setFontSize(8);
        summaryDoc.setTextColor(150);
        summaryDoc.text(
          `Generated ${new Date().toLocaleDateString()} - Pulse AI Script Analysis`,
          pw / 2, ph - 10, { align: 'center' }
        );

        const pdfFilename = filename.endsWith('.pdf') ? filename : filename.replace(/\.\w+$/, '.pdf');
        summaryDoc.save(pdfFilename);
      }

      toast({
        title: 'Export Complete',
        description: `Your ${format === 'summary' ? 'executive summary PDF' : format === 'pdf' ? 'full PDF report' : 'data'} has been downloaded.`,
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
