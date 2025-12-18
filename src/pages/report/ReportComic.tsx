import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { PanelGallery } from '@/components/report/PanelGallery';
import { ArtReferenceSheet } from '@/components/report/ArtReferenceSheet';
import { Card } from '@/components/ui/card';
import { Palette, Layout, Layers, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  isComic: boolean;
}

export default function ReportComic() {
  const { reportData } = useOutletContext<ReportContextValue>();

  // Get comic-specific category scores
  const comicCategories = [
    { key: 'Comic Visuals', label: 'Visual Storytelling', icon: Eye },
    { key: 'Comic Dialogue', label: 'Dialogue Design', icon: Layout },
    { key: 'Comic Pacing', label: 'Panel Pacing', icon: Layers },
    { key: 'Comic Art Direction', label: 'Art Direction', icon: Palette },
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center">
        <span className="px-4 py-1.5 rounded-full bg-chart-5/10 text-chart-5 text-sm font-medium">
          Comic Analysis
        </span>
        <h2 className="text-3xl lg:text-4xl font-bold mt-4 mb-2">
          Visual Storytelling Analysis
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Specialized analysis for graphic narrative and comic scripts
        </p>
      </div>

      {/* Comic-Specific Scores */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {comicCategories.map((category) => {
          const score = reportData.categoryScores?.[category.key] || 0;
          const Icon = category.icon;
          
          return (
            <Card key={category.key} className="p-6 bg-card/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-chart-5/10">
                  <Icon className="h-6 w-6 text-chart-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{category.label}</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    score >= 7 ? "text-success" :
                    score >= 5 ? "text-chart-4" :
                    "text-warning"
                  )}>
                    {score.toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    score >= 7 ? "bg-success" :
                    score >= 5 ? "bg-chart-4" :
                    "bg-warning"
                  )}
                  style={{ width: `${score * 10}%` }}
                />
              </div>
            </Card>
          );
        })}
      </section>

      {/* Panel Gallery */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Panel Flow Analysis</h3>
          <p className="text-muted-foreground">
            Scene-by-scene breakdown of panel composition and layout
          </p>
        </div>
        <PanelGallery scenes={reportData.scenes || []} />
      </section>

      {/* Art Reference Sheet */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Art Reference Guide</h3>
          <p className="text-muted-foreground">
            Visual style recommendations and reference notes
          </p>
        </div>
        <ArtReferenceSheet 
          characters={reportData.characters || []}
          scenes={reportData.scenes || []}
        />
      </section>

      {/* Visual Storytelling Tips */}
      <section>
        <Card className="p-8 bg-gradient-to-br from-chart-5/5 via-card to-chart-6/5">
          <h3 className="text-2xl font-bold mb-6">Visual Storytelling Recommendations</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-success/10 h-fit">
                  <Eye className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="font-medium">Visual Hierarchy</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure clear focal points in each panel to guide reader attention
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10 h-fit">
                  <Layout className="h-4 w-4 text-chart-2" />
                </div>
                <div>
                  <p className="font-medium">Panel Variety</p>
                  <p className="text-sm text-muted-foreground">
                    Mix panel sizes and shapes to control pacing and emphasis
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-chart-4/10 h-fit">
                  <Layers className="h-4 w-4 text-chart-4" />
                </div>
                <div>
                  <p className="font-medium">Page Composition</p>
                  <p className="text-sm text-muted-foreground">
                    Balance dialogue-heavy and action panels for optimal flow
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-chart-6/10 h-fit">
                  <Palette className="h-4 w-4 text-chart-6" />
                </div>
                <div>
                  <p className="font-medium">Color Strategy</p>
                  <p className="text-sm text-muted-foreground">
                    Use consistent color palettes to establish mood and setting
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
