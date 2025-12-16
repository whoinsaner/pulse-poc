import { CharacterData } from '@/types/database';
import { cn } from '@/lib/utils';
import { Users, MessageSquare, Film, ArrowRight } from 'lucide-react';

interface CharactersSectionProps {
  characters: CharacterData[];
}

export function CharactersSection({ characters }: CharactersSectionProps) {
  if (!characters || characters.length === 0) {
    return null;
  }

  // Sort by dialogue count to highlight main characters
  const sortedCharacters = [...characters].sort((a, b) => b.dialogueCount - a.dialogueCount);
  const mainCharacters = sortedCharacters.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Characters</h2>
          <p className="text-muted-foreground">
            {characters.length} characters analyzed
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mainCharacters.map((character, index) => (
          <div
            key={character.name}
            className={cn(
              'p-5 rounded-xl bg-card border border-border',
              'hover:border-primary/30 hover:shadow-lg transition-all duration-300',
              'animate-fade-up'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">{character.name}</h3>
                {character.firstAppearance && (
                  <p className="text-xs text-muted-foreground">
                    First appears: Scene {character.firstAppearance}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10">
                <span className="text-xs font-medium">#{index + 1}</span>
              </div>
            </div>

            {character.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {character.description}
              </p>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{character.dialogueCount}</span>
                <span className="text-xs text-muted-foreground">lines</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Film className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{character.sceneCount}</span>
                <span className="text-xs text-muted-foreground">scenes</span>
              </div>
            </div>

            {character.arcSummary && (
              <div className="p-3 rounded-lg bg-muted/50 mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Character Arc</p>
                <p className="text-sm">{character.arcSummary}</p>
              </div>
            )}

            {character.relationships && character.relationships.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Relationships</p>
                <div className="flex flex-wrap gap-2">
                  {character.relationships.slice(0, 3).map((rel, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-xs"
                    >
                      <ArrowRight className="h-3 w-3" />
                      {rel.character}
                      <span className="text-muted-foreground">({rel.type})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show remaining characters count */}
      {characters.length > 6 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            + {characters.length - 6} more supporting characters
          </p>
        </div>
      )}
    </div>
  );
}
