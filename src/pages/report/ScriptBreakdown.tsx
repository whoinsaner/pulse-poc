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
  Sparkles,
  Check,
  CheckCheck,
  Database,
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
  source: string;
  confidence: number | null;
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
  const [extracting, setExtracting] = useState(false);

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
          source: (t as any).source || 'manual',
          confidence: (t as any).confidence ?? null,
        })));
      }
      if (scenesRes.error) toast.error('Failed to load scenes');
      if (tagsRes.error) toast.error('Failed to load breakdown tags');
      setLoading(false);

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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tag of tags) {
      counts[tag.category] = (counts[tag.category] || 0) + 1;
    }
    return counts;
  }, [tags]);

  const aiPendingCount = useMemo(() => tags.filter(t => t.source === 'ai').length, [tags]);
  const parserTagCount = useMemo(() => tags.filter(t => t.source === 'parser').length, [tags]);

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
      setTags(prev => [...prev, {
        ...data,
        category: data.category as BreakdownCategory,
        source: (data as any).source || 'manual',
        confidence: (data as any).confidence ?? null,
      }]);
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

  const acceptTag = async (tagId: string) => {
    const { error } = await supabase
      .from('breakdown_tags')
      .update({ source: 'ai_accepted' } as any)
      .eq('id', tagId);

    if (error) {
      toast.error('Failed to accept suggestion');
    } else {
      setTags(prev => prev.map(t => t.id === tagId ? { ...t, source: 'ai_accepted' } : t));
    }
  };

  const acceptAllAiTags = async (sceneId?: string) => {
    const aiTags = tags.filter(t => t.source === 'ai' && (!sceneId || t.scene_id === sceneId));
    if (aiTags.length === 0) return;

    const ids = aiTags.map(t => t.id);
    const { error } = await supabase
      .from('breakdown_tags')
      .update({ source: 'ai_accepted' } as any)
      .in('id', ids);

    if (error) {
      toast.error('Failed to accept all suggestions');
    } else {
      setTags(prev => prev.map(t => ids.includes(t.id) ? { ...t, source: 'ai_accepted' } : t));
      toast.success(`Accepted ${ids.length} AI suggestions`);
    }
  };

  const dismissAllAiTags = async (sceneId?: string) => {
    const aiTags = tags.filter(t => t.source === 'ai' && (!sceneId || t.scene_id === sceneId));
    if (aiTags.length === 0) return;

    const ids = aiTags.map(t => t.id);
    const { error } = await supabase
      .from('breakdown_tags')
      .delete()
      .in('id', ids);

    if (error) {
      toast.error('Failed to dismiss suggestions');
    } else {
      setTags(prev => prev.filter(t => !ids.includes(t.id)));
      toast.success(`Dismissed ${ids.length} AI suggestions`);
    }
  };

  const [extractionProgress, setExtractionProgress] = useState<number>(0);

  const pollExtractionJob = useCallback(async (jobId: string) => {
    const poll = async (): Promise<void> => {
      const { data, error } = await supabase
        .from('extraction_jobs')
        .select('status, progress, extracted_count, error')
        .eq('id', jobId)
        .single();

      if (error || !data) {
        toast.error('Failed to check extraction status');
        setExtracting(false);
        setExtractionProgress(0);
        return;
      }

      setExtractionProgress(data.progress || 0);

      if (data.status === 'completed') {
        toast.success(`Extracted ${data.extracted_count} elements`);
        setExtracting(false);
        setExtractionProgress(0);

        // Refresh tags
        if (scriptId) {
          const { data: freshTags } = await supabase
            .from('breakdown_tags')
            .select('*')
            .eq('script_id', scriptId);

          if (freshTags) {
            setTags(freshTags.map(t => ({
              ...t,
              category: t.category as BreakdownCategory,
              source: (t as any).source || 'manual',
              confidence: (t as any).confidence ?? null,
            })));
            setExpandedScenes(new Set(scenes.map(s => s.id)));
          }
        }
        return;
      }

      if (data.status === 'failed') {
        toast.error(data.error || 'Extraction failed');
        setExtracting(false);
        setExtractionProgress(0);
        return;
      }

      // Still processing — poll again
      await new Promise(r => setTimeout(r, 2000));
      return poll();
    };

    return poll();
  }, [scriptId, scenes]);

  const runAutoExtract = async () => {
    if (!scriptId || extracting) return;
    setExtracting(true);
    setExtractionProgress(0);

    try {
      const { data, error } = await supabase.functions.invoke('extract-breakdown', {
        body: { script_id: scriptId },
      });

      if (error) {
        toast.error(error.message || 'Extraction failed');
        setExtracting(false);
        return;
      }

      if (data?.error) {
        if (data.error.includes('Rate limit')) {
          toast.error('Rate limit reached. Please wait a moment and try again.');
        } else if (data.error.includes('credits')) {
          toast.error('AI credits exhausted. Please add credits in Settings → Workspace → Usage.');
        } else {
          toast.error(data.error);
        }
        setExtracting(false);
        return;
      }

      if (data?.job_id) {
        toast.info('AI extraction started — scanning scenes...');
        await pollExtractionJob(data.job_id);
      }
    } catch (e) {
      toast.error('Auto-extraction failed. Please try again.');
      console.error('Auto-extract error:', e);
      setExtracting(false);
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Script Breakdown</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tag production elements by scene — props, wardrobe, VFX, cast, and more
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Button
            onClick={runAutoExtract}
            disabled={extracting || scenes.length === 0}
            className="gap-2"
          >
            {extracting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {extracting ? `Extracting... ${extractionProgress}%` : 'Auto-Extract'}
          </Button>
          {extracting && (
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${extractionProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* AI Pending Banner */}
      {aiPendingCount > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">{aiPendingCount} AI suggestions</span>
              <span className="text-muted-foreground">awaiting review</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => acceptAllAiTags()}>
                <CheckCheck className="h-3 w-3" />
                Accept All
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => dismissAllAiTags()}>
                <X className="h-3 w-3" />
                Dismiss All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>{tags.length} elements across {scenes.length} scenes</span>
          </div>
          {parserTagCount > 0 && (
            <div className="flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              <span>{parserTagCount} from parser</span>
            </div>
          )}
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

          const groupedTags: Record<string, BreakdownTag[]> = {};
          for (const tag of filteredTags) {
            if (!groupedTags[tag.category]) groupedTags[tag.category] = [];
            groupedTags[tag.category].push(tag);
          }

          const sceneAiCount = sceneTags.filter(t => t.source === 'ai').length;

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

                <div className="flex items-center gap-1 shrink-0">
                  {sceneAiCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium px-1.5 py-0.5">
                      <Sparkles className="h-2.5 w-2.5" />
                      {sceneAiCount}
                    </span>
                  )}
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

                  {/* Per-scene AI actions */}
                  {sceneAiCount > 0 && (
                    <div className="px-4 py-2 bg-primary/5 border-b border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        {sceneAiCount} AI suggestion{sceneAiCount !== 1 ? 's' : ''}
                      </span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-0.5 px-2" onClick={() => acceptAllAiTags(scene.id)}>
                          <CheckCheck className="h-3 w-3" /> Accept All
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-0.5 px-2 text-destructive hover:text-destructive" onClick={() => dismissAllAiTags(scene.id)}>
                          <X className="h-3 w-3" /> Dismiss All
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-3">
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
                                {groupedTags[cat].map(tag => {
                                  const isAi = tag.source === 'ai';
                                  const isAiAccepted = tag.source === 'ai_accepted';
                                  const isParser = tag.source === 'parser';
                                  return (
                                    <span
                                      key={tag.id}
                                      className={cn(
                                        'group inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                        config.bgClass, config.textClass, config.borderClass,
                                        isAi && 'border-dashed',
                                        isParser && 'border-solid',
                                        tag.confidence !== null && tag.confidence < 0.5 && 'opacity-70',
                                      )}
                                    >
                                      {isParser && (
                                        <Database className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                                      )}
                                      {(isAi || isAiAccepted) && (
                                        <Sparkles className={cn('h-2.5 w-2.5 shrink-0', isAiAccepted ? 'text-primary/50' : 'text-primary')} />
                                      )}
                                      {tag.element_name}
                                      {tag.confidence !== null && (
                                        <span className="text-[9px] opacity-50 ml-0.5">{Math.round(tag.confidence * 100)}%</span>
                                      )}
                                      {isAi && (
                                        <button
                                          onClick={() => acceptTag(tag.id)}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
                                          title="Accept suggestion"
                                        >
                                          <Check className="h-3 w-3" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => removeTag(tag.id)}
                                        className={cn(
                                          'transition-opacity hover:text-destructive',
                                          isAi ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                                        )}
                                        title={isAi ? 'Dismiss suggestion' : 'Remove element'}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </span>
                                  );
                                })}
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
