import { useState, useEffect } from 'react';
import { CharacterData } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Plus, X } from 'lucide-react';

interface CharacterEditDialogProps {
  character: CharacterData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (character: CharacterData) => Promise<void>;
  isNew?: boolean;
}

interface RelationshipEdit {
  character: string;
  type: string;
}

export function CharacterEditDialog({
  character,
  open,
  onOpenChange,
  onSave,
  isNew = false,
}: CharacterEditDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [arcSummary, setArcSummary] = useState('');
  const [relationships, setRelationships] = useState<RelationshipEdit[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (character) {
      setName(character.name);
      setDescription(character.description || '');
      setArcSummary(character.arcSummary || '');
      setRelationships(character.relationships || []);
    } else {
      setName('');
      setDescription('');
      setArcSummary('');
      setRelationships([]);
    }
  }, [character, open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        arcSummary: arcSummary.trim() || undefined,
        dialogueCount: character?.dialogueCount ?? 0,
        sceneCount: character?.sceneCount ?? 0,
        firstAppearance: character?.firstAppearance,
        relationships: relationships.filter(r => r.character.trim()),
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving character:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const addRelationship = () => {
    setRelationships([...relationships, { character: '', type: '' }]);
  };

  const updateRelationship = (index: number, field: 'character' | 'type', value: string) => {
    const updated = [...relationships];
    updated[index][field] = value;
    setRelationships(updated);
  };

  const removeRelationship = (index: number) => {
    setRelationships(relationships.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add Character' : 'Edit Character'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Character name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief character description..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="arc">Character Arc</Label>
            <Textarea
              id="arc"
              value={arcSummary}
              onChange={(e) => setArcSummary(e.target.value)}
              placeholder="Describe the character's journey..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Relationships</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addRelationship}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            {relationships.length > 0 ? (
              <div className="space-y-2">
                {relationships.map((rel, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={rel.character}
                      onChange={(e) => updateRelationship(index, 'character', e.target.value)}
                      placeholder="Character name"
                      className="flex-1"
                    />
                    <Input
                      value={rel.type}
                      onChange={(e) => updateRelationship(index, 'type', e.target.value)}
                      placeholder="Relation type"
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRelationship(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No relationships defined</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isNew ? 'Add Character' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}