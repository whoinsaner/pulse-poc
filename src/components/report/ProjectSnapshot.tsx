import { ScoreRing } from '@/components/ScoreRing';
import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { User, Film, FileText, Calendar, MapPin, Palette, Target } from 'lucide-react';

interface ProjectSnapshotProps {
  reportData: ReportData;
  reportTitle: string;
  currentScore: number;
  activeLens: StakeholderLens;
}

export function ProjectSnapshot({ reportData, reportTitle, currentScore, activeLens }: ProjectSnapshotProps) {
  const metadata = reportData.scriptMetadata;
  
  const getReadinessLabel = (score: number) => {
    if (score >= 80) return 'Production-Ready';
    if (score >= 65) return 'High-Potential, Near Ready';
    if (score >= 50) return 'High-Potential, Not Production-Ready';
    if (score >= 35) return 'Requires Significant Development';
    return 'Early Development Stage';
  };

  const details = [
    { label: 'Genre', value: metadata?.genre || 'Not specified', icon: Film },
    { label: 'Format', value: metadata?.scriptType ? metadata.scriptType.charAt(0).toUpperCase() + metadata.scriptType.slice(1) : 'Feature Film', icon: FileText },
    { label: 'Pages', value: metadata?.pageCount ? `${metadata.pageCount} pages` : 'N/A', icon: Calendar },
    { label: 'Status', value: 'Analysis Complete', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Title and Summary */}
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
          {metadata?.title || reportTitle}
          <span className="text-muted-foreground"> - Project Snapshot</span>
        </h1>
        {metadata?.logline && (
          <p className="text-lg text-muted-foreground max-w-4xl leading-relaxed">
            {metadata.logline}
          </p>
        )}
      </div>

      {/* Project Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {details.map((detail) => (
          <div key={detail.label} className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <detail.icon className="h-4 w-4" />
              {detail.label}
            </div>
            <p className="font-semibold">{detail.value}</p>
          </div>
        ))}
      </div>

      {/* Overall Readiness Score */}
      <div className="flex flex-col lg:flex-row items-center gap-8 p-8 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-6">
          <ScoreRing score={currentScore} size="lg" showLabel />
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
              Overall Readiness ({LENS_CONFIG[activeLens].label})
            </p>
            <p className="text-3xl font-bold">{currentScore.toFixed(1)} / 10</p>
            <p className="text-primary font-medium mt-1">{getReadinessLabel(currentScore * 10)}</p>
          </div>
        </div>

        {/* Additional context */}
        <div className="lg:ml-auto grid grid-cols-2 gap-4">
          {metadata?.genre && (
            <div className="flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tone:</span>
              <span className="font-medium">{metadata.genre}</span>
            </div>
          )}
          {metadata?.pageCount && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Pages:</span>
              <span className="font-medium">{metadata.pageCount}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm col-span-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Market:</span>
            <span className="font-medium">OTT-friendly positioning</span>
          </div>
        </div>
      </div>
    </div>
  );
}
