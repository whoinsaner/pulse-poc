import { useState, useEffect, useMemo, useCallback } from 'react';
import { useReport } from '@/components/report/ReportLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  BREAKDOWN_CATEGORIES,
  CATEGORY_ORDER,
  type BreakdownCategory,
} from '@/lib/breakdownCategories';
import {
  Plus,
  X,
  Tag,
  Filter,
  ChevronDown,
  ChevronRight,
  Search,
  Loader2,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Scene {
  id: string;
  scene_number: number;
  heading: string;
  location: string | null;
  int_ext: string | null;
  time_of_day: string | null;
  description: string | null;
  page_start: number | null;
  page_end: number | null;
}

interface BreakdownTag {
  id: string;
  scene_id: string;
  script_id: string;
  category: BreakdownCategory;
  element_name: string;
  notes: string | null;
  created_by: string;
}

export default function ScriptBreakdown() {
  const { report, reportData } = useReport();
  const { user } = useAuth();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [tags, setTags] = useState<BreakdownTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<BreakdownCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingToScene, setAddingToScene] = useState<string | null>(null);
  const [newElementName, setNewElementName] = useState('');
  const [newCategory, setNewCategory] = useState<BreakdownCategory>('props');
  const [saving, setSaving] = useState(false);

  const scriptId = report?.script_id;

  // Fetch scenes and tags
  useEffect(() => {
    if (!scriptId) return;

    const fetchData = async () => {
      setLoading(true);
      const [scenesRes, tagsRes] = await Promise.all([
        supabase
          .from('scenes')
          .select('*')
          .eq('script_id', scriptId)
          .order('scene_number'),
        supabase
          .from('breakdown_tags')
          .select('*')
          .eq('script_id', scriptId),
      ]);

      if (scenesRes.data) setScenes(scenesRes.data);
      if (tagsRes.data) {
        setTags(tagsRes.data.map(t => ({
          ...t,
          category: t.category as BreakdownCategory,
        })));
      }
      if (scenesRes.error) toast.error('Failed to load scenes');
      if (tagsRes.error) toast.error('Failed to load breakdown tags');
      setLoading(false);

      // Expand first 3 scenes by default
      if (scenesRes.data && scenesRes.data.length > 0) {
        setExpandedScenes(new Set(scenesRes.data.slice(0, 3).map(s => s.id)));
      }
    };

    fetchData();
  }, [scriptId]);

  const tagsByScene = useMemo(() => {
    const map: Record<string, BreakdownTag[]> = {};
    for (const tag of tags) {
      if (!map[tag.scene_id]) map[tag.scene_id] = [];
      map[tag.scene_id].push(tag);
    }
    return map;
  }, [tags]);

  // Summary stats
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tag of tags) {
      counts[tag.category] = (counts[tag.category] || 0) + 1;
    }
    return counts;
  }, [tags]);

  const filteredScenes = useMemo(() => {
    let result = scenes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.heading.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        tagsByScene[s.id]?.some(t => t.element_name.toLowerCase().includes(q))
      );
    }
    if (filterCategory !== 'all') {
      result = result.filter(s =>
        tagsByScene[s.id]?.some(t => t.category === filterCategory)
      );
    }
    return result;
  }, [scenes, searchQuery, filterCategory, tagsByScene]);

  const toggleScene = useCallback((sceneId: string) => {
    setExpandedScenes(prev => {
      const next = new Set(prev);
      if (next.has(sceneId)) next.delete(sceneId);
      else next.add(sceneId);
      return next;
    });
  }, []);

  const addTag = async (sceneId: string) => {
    if (!newElementName.trim() || !scriptId || !user) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('breakdown_tags')
      .insert({
        scene_id: sceneId,
        script_id: scriptId,
        category: newCategory,
        element_name: newElementName.trim(),
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add element');
    } else if (data) {
      setTags(prev => [...prev, { ...data, category: data.category as BreakdownCategory }]);
      setNewElementName('');
      toast.success(`Added "${data.element_name}" as ${BREAKDOWN_CATEGORIES[newCategory].label}`);
    }
    setSaving(false);
  };

  const removeTag = async (tagId: string) => {
    const { error } = await supabase
      .from('breakdown_tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      toast.error('Failed to remove element');
    } else {
      setTags(prev => prev.filter(t => t.id !== tagId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Script Breakdown</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tag production elements by scene — props, wardrobe, VFX, cast, and more
        </p>
      </div>

      {/* Category Legend + Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Element Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_ORDER.map(cat => {
              const config = BREAKDOWN_CATEGORIES[cat];
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer',
                    config.bgClass,
                    config.textClass,
                    config.borderClass,
                    filterCategory === cat && 'ring-2 ring-ring ring-offset-1'
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', config.dotClass)} />
                  {config.label}
                  {count > 0 && (
                    <span className="ml-0.5 opacity-70">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search + Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scenes or elements..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="h-4 w-4" />
          <span>{tags.length} elements across {scenes.length} scenes</span>
        </div>
      </div>

      {/* Scene Cards */}
      <div className="space-y-2">
        {filteredScenes.map(scene => {
          const sceneTags = tagsByScene[scene.id] || [];
          const isExpanded = expandedScenes.has(scene.id);
          const filteredTags = filterCategory === 'all'
            ? sceneTags
            : sceneTags.filter(t => t.category === filterCategory);

          // Group tags by category
          const groupedTags: Record<string, BreakdownTag[]> = {};
          for (const tag of filteredTags) {
            if (!groupedTags[tag.category]) groupedTags[tag.category] = [];
            groupedTags[tag.category].push(tag);
          }

          return (
            <Card key={scene.id} className="overflow-hidden">
              {/* Scene Header */}
              <button
                onClick={() => toggleScene(scene.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}

                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="inline-flex items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 shrink-0">
                    {scene.scene_number}
                  </span>
                  <span className="font-medium text-sm text-foreground truncate">
                    {scene.heading}
                  </span>
                  {scene.page_start && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      pg. {scene.page_start}{scene.page_end && scene.page_end !== scene.page_start ? `–${scene.page_end}` : ''}
                    </span>
                  )}
                </div>

                {/* Mini category dots */}
                <div className="flex items-center gap-1 shrink-0">
                  {Object.keys(groupedTags).map(cat => (
                    <span
                      key={cat}
                      className={cn('h-2.5 w-2.5 rounded-full', BREAKDOWN_CATEGORIES[cat as BreakdownCategory].dotClass)}
                      title={`${BREAKDOWN_CATEGORIES[cat as BreakdownCategory].label}: ${groupedTags[cat].length}`}
                    />
                  ))}
                  {sceneTags.length > 0 && (
                    <span className="text-xs text-muted-foreground ml-1">{sceneTags.length}</span>
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-border">
                  {scene.description && (
                    <div className="px-4 py-2 bg-muted/30">
                      <p className="text-xs text-muted-foreground italic">{scene.description}</p>
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    {/* Tagged Elements by Category */}
                    {Object.entries(groupedTags).length > 0 ? (
                      <div className="space-y-2">
                        {CATEGORY_ORDER.filter(cat => groupedTags[cat]).map(cat => {
                          const config = BREAKDOWN_CATEGORIES[cat];
                          return (
                            <div key={cat} className="flex items-start gap-2">
                              <span className={cn(
                                'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0 mt-0.5',
                                config.bgClass, config.textClass, config.borderClass
                              )}>
                                <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
                                {config.label}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {groupedTags[cat].map(tag => (
                                  <span
                                    key={tag.id}
                                    className={cn(
                                      'group inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                      config.bgClass, config.textClass, config.borderClass
                                    )}
                                  >
                                    {tag.element_name}
                                    <button
                                      onClick={() => removeTag(tag.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-2">
                        No elements tagged yet. Add production elements below.
                      </p>
                    )}

                    <Separator />

                    {/* Add Element Form */}
                    {addingToScene === scene.id ? (
                      <div className="flex items-center gap-2">
                        <Select
                          value={newCategory}
                          onValueChange={(v) => setNewCategory(v as BreakdownCategory)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORY_ORDER.map(cat => (
                              <SelectItem key={cat} value={cat}>
                                <span className="flex items-center gap-1.5">
                                  <span className={cn('h-2 w-2 rounded-full', BREAKDOWN_CATEGORIES[cat].dotClass)} />
                                  {BREAKDOWN_CATEGORIES[cat].label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Element name..."
                          value={newElementName}
                          onChange={e => setNewElementName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addTag(scene.id)}
                          className="h-8 text-xs flex-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => addTag(scene.id)}
                          disabled={!newElementName.trim() || saving}
                        >
                          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
                          onClick={() => {
                            setAddingToScene(null);
                            setNewElementName('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => setAddingToScene(scene.id)}
                      >
                        <Plus className="h-3 w-3" />
                        Add Element
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredScenes.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {searchQuery || filterCategory !== 'all'
              ? 'No scenes match your search/filter'
              : 'No scenes found for this script'}
          </p>
        </div>
      )}
    </div>
  );
}
