import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { PanelGallery } from '@/components/report/PanelGallery';
import { ArtReferenceSheet } from '@/components/report/ArtReferenceSheet';
import { Card } from '@/components/ui/card';
import { Palette, Layout, Layers, Eye, MessageSquare, Users, Cog, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  isComic: boolean;
}

export default function ReportComic() {
  const { reportData } = useOutletContext<ReportContextValue>();

  // Comic-specific categories (New Framework - 8 categories)
  const comicCategories = [
    { key: 'Comic Visuals', label: 'Sequential Storytelling', icon: Eye, description: 'Panel flow, page architecture, visual integrity' },
    { key: 'Comic Dialogue', label: 'Lettering & Balloons', icon: MessageSquare, description: 'Dialogue load, balloon engineering, reading flow' },
    { key: 'Comic Pacing', label: 'Page-Turn Impact', icon: Layers, description: 'Emotional payload, structural modularity, reveals' },
    { key: 'Comic Collaboration', label: 'Art-Script Synergy', icon: Palette, description: 'Art-writing balance, collaboration readiness' },
    { key: 'Comic Characters', label: 'Character Visual Identity', icon: Users, description: 'Silhouette distinctiveness, emotional readability' },
    { key: 'Comic Production', label: 'Production Pipeline', icon: Cog, description: 'Pipeline awareness, production feasibility' },
    { key: 'Comic Market', label: 'Market Positioning', icon: TrendingUp, description: 'Format fit, audience targeting' },
    { key: 'Comic Structure', label: 'Page Architecture', icon: Layout, description: 'Structural modularity, page turn engineering' },
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

      {/* Comic-Specific Scores - 8 Categories */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {comicCategories.map((category) => {
          // Handle both 0-10 and 0-100 scale scores
          const rawScore = reportData.categoryScores?.[category.key] || 0;
          const score = rawScore > 10 ? rawScore / 10 : rawScore;
          const Icon = category.icon;
          
          return (
            <Card key={category.key} className="p-6 bg-card/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-chart-5/10">
                  <Icon className="h-5 w-5 text-chart-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{category.label}</p>
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
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {category.description}
              </p>
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
