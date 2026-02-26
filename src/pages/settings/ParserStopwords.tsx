import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Trash2, Search, Filter } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const CATEGORIES = [
  'pronoun', 'preposition', 'conjunction', 'determiner', 'verb', 'adverb',
  'interrogative', 'location', 'prop', 'direction', 'role', 'other',
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  pronoun: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  preposition: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  conjunction: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  determiner: 'bg-pink-500/10 text-pink-700 border-pink-500/20',
  verb: 'bg-green-500/10 text-green-700 border-green-500/20',
  adverb: 'bg-teal-500/10 text-teal-700 border-teal-500/20',
  interrogative: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  location: 'bg-red-500/10 text-red-700 border-red-500/20',
  prop: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  direction: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  role: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  other: 'bg-muted text-muted-foreground border-border',
};

interface Stopword {
  id: string;
  word: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export default function ParserStopwords() {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const [newWord, setNewWord] = useState('');
  const [newCategory, setNewCategory] = useState<string>('other');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const isAdmin = userRole === 'admin';

  const { data: stopwords = [], isLoading } = useQuery({
    queryKey: ['parser-stopwords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parser_stopwords')
        .select('*')
        .order('category')
        .order('word');
      if (error) throw error;
      return data as Stopword[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async ({ word, category }: { word: string; category: string }) => {
      const { error } = await supabase
        .from('parser_stopwords')
        .insert({ word: word.toUpperCase().trim(), category });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parser-stopwords'] });
      setNewWord('');
      toast.success('Stopword added');
    },
    onError: (e: Error) => {
      if (e.message.includes('duplicate')) {
        toast.error('This word already exists');
      } else {
        toast.error('Failed to add stopword');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('parser_stopwords').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parser-stopwords'] });
      toast.success('Stopword removed');
    },
    onError: () => toast.error('Failed to remove stopword'),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('parser_stopwords')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parser-stopwords'] });
    },
    onError: () => toast.error('Failed to toggle stopword'),
  });

  const filtered = stopwords.filter((sw) => {
    const matchesSearch = !searchTerm || sw.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || sw.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = stopwords.reduce((acc, sw) => {
    acc[sw.category] = (acc[sw.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleAdd = () => {
    const word = newWord.trim();
    if (!word) return;
    addMutation.mutate({ word, category: newCategory });
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Parser Stopwords</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Words in this list are excluded during character extraction. Changes apply to future parses.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Badge
            key={cat}
            variant="outline"
            className={`cursor-pointer ${filterCategory === cat ? CATEGORY_COLORS[cat] : ''}`}
            onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
          >
            {cat} ({categoryCounts[cat] || 0})
          </Badge>
        ))}
      </div>

      {/* Add new */}
      {isAdmin && (
        <div className="flex gap-2">
          <Input
            placeholder="Add stopword..."
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="max-w-xs uppercase"
          />
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={!newWord.trim() || addMutation.isPending} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stopwords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Word</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Active</TableHead>
              {isAdmin && <TableHead className="w-[60px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">No stopwords found</TableCell>
              </TableRow>
            ) : (
              filtered.map((sw) => (
                <TableRow key={sw.id} className={!sw.is_active ? 'opacity-50' : ''}>
                  <TableCell className="font-mono text-sm">{sw.word}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={CATEGORY_COLORS[sw.category] || ''}>
                      {sw.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <button
                        onClick={() => toggleMutation.mutate({ id: sw.id, is_active: !sw.is_active })}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                          sw.is_active
                            ? 'bg-green-500/10 text-green-700 border-green-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {sw.is_active ? 'Active' : 'Disabled'}
                      </button>
                    ) : (
                      <span className="text-xs">{sw.is_active ? 'Active' : 'Disabled'}</span>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(sw.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {stopwords.length} stopwords shown
      </p>
    </div>
  );
}