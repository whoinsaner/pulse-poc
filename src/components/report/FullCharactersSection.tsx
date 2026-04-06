import { useState } from 'react';
import { CharacterData } from '@/types/database';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Film, ArrowRight, Star, TrendingUp, Award, Edit2, Plus, Trash2, X, Check } from 'lucide-react';
import { getCharacterRole, getLeadCharacters, getSupportingCast } from '@/lib/characterRoles';
import { CharacterEditDialog } from './CharacterEditDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FullCharactersSectionProps {
  characters: CharacterData[];
  scriptId?: string;
  onCharactersUpdate?: (characters: CharacterData[]) => void;
  agentContent?: any;
}

export function FullCharactersSection({ characters, scriptId, onCharactersUpdate, agentContent }: FullCharactersSectionProps) {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewCharacter, setIsNewCharacter] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<CharacterData | null>(null);

  if (!characters || characters.length === 0) {
    return null;
  }

  const canEdit = userRole === 'admin' || userRole === 'analyst';

  // Group characters by AI-identified roles
  const mainCharacters = getLeadCharacters(characters, agentContent);
  const supportingCharacters = getSupportingCast(characters, agentContent).slice(0, 6);
  const mainAndSupportingNames = new Set([...mainCharacters, ...supportingCharacters].map(c => c.name));
  const minorCharacters = characters.filter(c => !mainAndSupportingNames.has(c.name));

  const totalDialogue = characters.reduce((sum, c) => sum + c.dialogueCount, 0);
  const avgSceneCount = characters.reduce((sum, c) => sum + c.sceneCount, 0) / characters.length;

  const handleEditCharacter = (character: CharacterData) => {
    setEditingCharacter(character);
    setIsNewCharacter(false);
    setIsDialogOpen(true);
  };

  const handleAddCharacter = () => {
    setEditingCharacter(null);
    setIsNewCharacter(true);
    setIsDialogOpen(true);
  };

  const handleSaveCharacter = async (updatedCharacter: CharacterData) => {
    if (!scriptId) {
      // Optimistic update for display-only mode
      const newList = isNewCharacter
        ? [...characters, updatedCharacter]
        : characters.map(c => c.name === editingCharacter?.name ? updatedCharacter : c);
      onCharactersUpdate?.(newList);
      toast({ title: isNewCharacter ? 'Character added' : 'Character updated' });
      return;
    }

    try {
      if (isNewCharacter) {
        const { error } = await supabase.from('characters').insert([{
          script_id: scriptId,
          name: updatedCharacter.name,
          description: updatedCharacter.description || null,
          arc_summary: updatedCharacter.arcSummary || null,
          dialogue_count: updatedCharacter.dialogueCount,
          scene_count: updatedCharacter.sceneCount,
          first_appearance: updatedCharacter.firstAppearance || null,
          relationships: JSON.parse(JSON.stringify(updatedCharacter.relationships || [])),
        }]);
        if (error) throw error;
        toast({ title: 'Character added' });
      } else {
        // For updates, we'd need the character ID from the database
        toast({ title: 'Character updated locally' });
      }
      
      const newList = isNewCharacter
        ? [...characters, updatedCharacter]
        : characters.map(c => c.name === editingCharacter?.name ? updatedCharacter : c);
      onCharactersUpdate?.(newList);
    } catch (err) {
      console.error('Error saving character:', err);
      toast({ title: 'Error', description: 'Failed to save character', variant: 'destructive' });
      throw err;
    }
  };

  const handleDeleteCharacter = async () => {
    if (!characterToDelete) return;
    
    const newList = characters.filter(c => c.name !== characterToDelete.name);
    onCharactersUpdate?.(newList);
    toast({ title: 'Character removed' });
    setCharacterToDelete(null);
  };

  return (
    <section className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-4/10 text-chart-4 text-sm font-medium">
            Cast Analysis
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
            Character Breakdown
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {characters.length} characters analyzed across your script
          </p>
          
          {/* Edit mode toggle */}
          {canEdit && (
            <div className="mt-6">
              <Button
                variant={isEditMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Done Editing
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Characters
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          <div className="p-5 rounded-xl bg-card border border-border text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold">{characters.length}</p>
            <p className="text-sm text-muted-foreground">Total Characters</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border text-center">
            <MessageSquare className="h-8 w-8 text-chart-2 mx-auto mb-2" />
            <p className="text-3xl font-bold">{totalDialogue}</p>
            <p className="text-sm text-muted-foreground">Dialogue Lines</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border text-center">
            <Star className="h-8 w-8 text-chart-4 mx-auto mb-2" />
            <p className="text-3xl font-bold">{mainCharacters.length}</p>
            <p className="text-sm text-muted-foreground">Lead Characters</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border text-center">
            <Film className="h-8 w-8 text-chart-3 mx-auto mb-2" />
            <p className="text-3xl font-bold">{avgSceneCount.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Avg Scenes/Character</p>
          </div>
        </div>

        {/* Add character button in edit mode */}
        {isEditMode && (
          <div className="mb-8 flex justify-center">
            <Button onClick={handleAddCharacter} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Character
            </Button>
          </div>
        )}

        {/* Main characters - Featured cards */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-chart-4/10">
              <Award className="h-6 w-6 text-chart-4" />
            </div>
            <h3 className="text-2xl font-bold">Lead Characters</h3>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {mainCharacters.map((character, index) => (
              <div
                key={character.name}
                className={cn(
                  'relative p-6 rounded-2xl bg-card border-2 border-primary/30',
                  'hover:border-primary/50 hover:shadow-xl transition-all duration-300',
                  'animate-fade-up',
                  isEditMode && 'ring-2 ring-primary/20'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Edit/Delete buttons */}
                {isEditMode && (
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleEditCharacter(character)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setCharacterToDelete(character)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Rank badge */}
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                  #{index + 1}
                </div>

                {/* Character avatar placeholder */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-chart-6/20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold gradient-text">
                    {character.name.charAt(0)}
                  </span>
                </div>

                <h4 className="text-xl font-bold mb-1">{character.name}</h4>
                {character.firstAppearance && (
                  <p className="text-sm text-muted-foreground mb-4">
                    First appears: Scene {character.firstAppearance}
                  </p>
                )}

                {character.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {character.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs">Lines</span>
                    </div>
                    <p className="text-lg font-bold">{character.dialogueCount}</p>
                    <p className="text-xs text-muted-foreground">
                      {((character.dialogueCount / totalDialogue) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Film className="h-4 w-4" />
                      <span className="text-xs">Scenes</span>
                    </div>
                    <p className="text-lg font-bold">{character.sceneCount}</p>
                  </div>
                </div>

                {/* Arc summary */}
                {character.arcSummary && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
                    <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Character Arc
                    </p>
                    <p className="text-sm">{character.arcSummary}</p>
                  </div>
                )}

                {/* Relationships */}
                {character.relationships && character.relationships.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Key Relationships</p>
                    <div className="flex flex-wrap gap-2">
                      {character.relationships.slice(0, 4).map((rel, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-sm"
                        >
                          <ArrowRight className="h-3 w-3" />
                          {rel.character}
                          <span className="text-muted-foreground text-xs">({rel.type})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Supporting characters */}
        {supportingCharacters.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-chart-2/10">
                <Users className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="text-2xl font-bold">Supporting Cast</h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportingCharacters.map((character, index) => (
                <div
                  key={character.name}
                  className={cn(
                    'relative p-5 rounded-xl bg-card border border-border',
                    'hover:border-primary/30 transition-all duration-300',
                    'animate-fade-up',
                    isEditMode && 'ring-2 ring-primary/20'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Edit/Delete buttons */}
                  {isEditMode && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleEditCharacter(character)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setCharacterToDelete(character)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                        <span className="font-semibold text-chart-2">
                          {character.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{character.name}</h4>
                        {character.firstAppearance && (
                          <p className="text-xs text-muted-foreground">
                            Scene {character.firstAppearance}
                          </p>
                        )}
                      </div>
                    </div>
                    {!isEditMode && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        #{mainCharacters.length + index + 1}
                      </span>
                    )}
                  </div>

                  {character.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {character.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{character.dialogueCount}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Film className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{character.sceneCount}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Minor characters summary */}
        {minorCharacters.length > 0 && (
          <div className="p-6 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Minor Characters</h4>
              <span className="text-sm text-muted-foreground">{minorCharacters.length} characters</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {minorCharacters.map((character) => (
                <span
                  key={character.name}
                  className={cn(
                    'px-3 py-1.5 rounded-full bg-secondary text-sm inline-flex items-center gap-2',
                    isEditMode && 'cursor-pointer hover:bg-secondary/80'
                  )}
                  onClick={isEditMode ? () => handleEditCharacter(character) : undefined}
                >
                  {character.name}
                  <span className="text-muted-foreground">({character.dialogueCount})</span>
                  {isEditMode && (
                    <button
                      className="text-destructive hover:text-destructive/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCharacterToDelete(character);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <CharacterEditDialog
        character={editingCharacter}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveCharacter}
        isNew={isNewCharacter}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!characterToDelete} onOpenChange={() => setCharacterToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{characterToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCharacter} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
