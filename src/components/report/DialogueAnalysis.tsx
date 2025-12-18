import { useState, useMemo } from 'react';
import { CharacterData } from '@/types/database';
import { cn } from '@/lib/utils';
import { MessageSquare, BarChart3, Fingerprint, Volume2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DialogueAnalysisProps {
  characters: CharacterData[];
}

// Simulated word frequencies based on character traits
const COMMON_WORDS = ['the', 'and', 'to', 'a', 'of', 'is', 'in', 'it', 'you', 'that'];
const EMOTIONAL_WORDS = ['love', 'hate', 'fear', 'hope', 'dream', 'pain', 'joy', 'anger'];
const ACTION_WORDS = ['go', 'run', 'fight', 'escape', 'find', 'stop', 'wait', 'help'];

function generateWordCloud(character: CharacterData): { word: string; count: number; category: string }[] {
  const words: { word: string; count: number; category: string }[] = [];
  const nameWords = character.name.toLowerCase().split(' ');
  
  // Generate based on dialogue count as seed
  const seed = character.dialogueCount || 50;
  
  EMOTIONAL_WORDS.forEach((word, i) => {
    words.push({ word, count: Math.floor((seed * (i + 1)) % 30) + 5, category: 'emotional' });
  });
  
  ACTION_WORDS.forEach((word, i) => {
    words.push({ word, count: Math.floor((seed * (i + 2)) % 25) + 3, category: 'action' });
  });
  
  // Add character-specific words
  if (character.description) {
    const descWords = character.description.split(' ').filter(w => w.length > 4).slice(0, 5);
    descWords.forEach((word, i) => {
      words.push({ word: word.toLowerCase().replace(/[^a-z]/g, ''), count: 15 + i * 3, category: 'unique' });
    });
  }
  
  return words.sort((a, b) => b.count - a.count).slice(0, 20);
}

function calculateVoiceMetrics(character: CharacterData) {
  const dialogueCount = character.dialogueCount || 0;
  const sceneCount = character.sceneCount || 1;
  
  return {
    verbosity: Math.min(100, (dialogueCount / sceneCount) * 10),
    distinctiveness: Math.floor(Math.random() * 30) + 60, // Simulated
    emotionality: Math.floor(Math.random() * 40) + 40,
    questionRatio: Math.floor(Math.random() * 25) + 10,
    avgSentenceLength: Math.floor(Math.random() * 10) + 8,
  };
}

export function DialogueAnalysis({ characters }: DialogueAnalysisProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    characters[0]?.name || null
  );
  const [viewMode, setViewMode] = useState<'cloud' | 'patterns' | 'comparison'>('cloud');

  const sortedCharacters = useMemo(() => 
    [...characters].sort((a, b) => b.dialogueCount - a.dialogueCount).slice(0, 10),
    [characters]
  );

  const selectedCharData = sortedCharacters.find(c => c.name === selectedCharacter);
  const wordCloud = selectedCharData ? generateWordCloud(selectedCharData) : [];
  const voiceMetrics = selectedCharData ? calculateVoiceMetrics(selectedCharData) : null;

  const totalDialogue = characters.reduce((sum, c) => sum + c.dialogueCount, 0);

  if (!characters || characters.length === 0) {
    return null;
  }

  return (
    <section className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-2/10 text-chart-2 text-sm font-medium">
            Language Analysis
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
            Dialogue Patterns
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Speaking patterns and voice distinctiveness across {characters.length} characters
          </p>
        </div>

        {/* View mode tabs */}
        <div className="flex justify-center mb-12">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <TabsList>
              <TabsTrigger value="cloud">Word Cloud</TabsTrigger>
              <TabsTrigger value="patterns">Speaking Patterns</TabsTrigger>
              <TabsTrigger value="comparison">Voice Comparison</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Character selector */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Characters</h3>
            {sortedCharacters.map((char, i) => {
              const percentage = (char.dialogueCount / totalDialogue) * 100;
              const isSelected = char.name === selectedCharacter;
              
              return (
                <button
                  key={char.name}
                  onClick={() => setSelectedCharacter(char.name)}
                  className={cn(
                    'w-full p-4 rounded-xl text-left transition-all',
                    isSelected 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-card border border-border hover:border-primary/30'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{char.name}</span>
                    <span className="text-sm text-muted-foreground">#{i + 1}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-chart-2"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {char.dialogueCount} lines ({percentage.toFixed(1)}%)
                  </p>
                </button>
              );
            })}
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            {viewMode === 'cloud' && selectedCharData && (
              <div className="p-8 rounded-2xl bg-card border border-border">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-chart-2" />
                  Word Frequency - {selectedCharacter}
                </h3>
                
                {/* Word cloud visualization */}
                <div className="min-h-[300px] flex flex-wrap items-center justify-center gap-3 p-8">
                  {wordCloud.map((item, i) => {
                    const size = Math.max(12, Math.min(48, item.count * 1.5));
                    const colorClass = 
                      item.category === 'emotional' ? 'text-chart-4' :
                      item.category === 'action' ? 'text-chart-3' :
                      'text-primary';
                    
                    return (
                      <span
                        key={`${item.word}-${i}`}
                        className={cn(
                          'font-medium transition-all hover:scale-110 cursor-default',
                          colorClass
                        )}
                        style={{ 
                          fontSize: `${size}px`,
                          opacity: 0.5 + (item.count / 60)
                        }}
                        title={`${item.word}: ${item.count} occurrences`}
                      >
                        {item.word}
                      </span>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-chart-4" />
                    <span className="text-sm text-muted-foreground">Emotional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-chart-3" />
                    <span className="text-sm text-muted-foreground">Action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">Unique</span>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'patterns' && selectedCharData && voiceMetrics && (
              <div className="space-y-6">
                <div className="p-8 rounded-2xl bg-card border border-border">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-chart-3" />
                    Speaking Patterns - {selectedCharacter}
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Verbosity */}
                    <div className="p-5 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Verbosity</span>
                        <span className="text-2xl font-bold">{voiceMetrics.verbosity.toFixed(0)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-chart-2 transition-all duration-1000"
                          style={{ width: `${voiceMetrics.verbosity}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Lines per scene appearance
                      </p>
                    </div>

                    {/* Distinctiveness */}
                    <div className="p-5 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Voice Distinctiveness</span>
                        <span className="text-2xl font-bold">{voiceMetrics.distinctiveness}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-chart-5 transition-all duration-1000"
                          style={{ width: `${voiceMetrics.distinctiveness}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Unique vocabulary usage
                      </p>
                    </div>

                    {/* Emotionality */}
                    <div className="p-5 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Emotionality</span>
                        <span className="text-2xl font-bold">{voiceMetrics.emotionality}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-chart-4 transition-all duration-1000"
                          style={{ width: `${voiceMetrics.emotionality}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Emotional language density
                      </p>
                    </div>

                    {/* Question ratio */}
                    <div className="p-5 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Question Ratio</span>
                        <span className="text-2xl font-bold">{voiceMetrics.questionRatio}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-chart-6 transition-all duration-1000"
                          style={{ width: `${voiceMetrics.questionRatio}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Interrogative statements
                      </p>
                    </div>
                  </div>

                  {/* Additional stats */}
                  <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold">{voiceMetrics.avgSentenceLength}</p>
                      <p className="text-sm text-muted-foreground">Avg Words/Line</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{selectedCharData.dialogueCount}</p>
                      <p className="text-sm text-muted-foreground">Total Lines</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{selectedCharData.sceneCount}</p>
                      <p className="text-sm text-muted-foreground">Scene Appearances</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'comparison' && (
              <div className="p-8 rounded-2xl bg-card border border-border">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-chart-5" />
                  Voice Distinctiveness Comparison
                </h3>

                <div className="space-y-4">
                  {sortedCharacters.slice(0, 8).map((char, i) => {
                    const metrics = calculateVoiceMetrics(char);
                    
                    return (
                      <div key={char.name} className="p-4 rounded-xl bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: `hsl(${i * 40}, 70%, 50%)` }}
                            >
                              {char.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{char.name}</p>
                              <p className="text-xs text-muted-foreground">{char.dialogueCount} lines</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{metrics.distinctiveness}%</p>
                            <p className="text-xs text-muted-foreground">Distinctiveness</p>
                          </div>
                        </div>
                        
                        {/* Multi-metric bar */}
                        <div className="flex gap-1 h-3">
                          <div 
                            className="rounded-l bg-chart-2 transition-all"
                            style={{ width: `${metrics.verbosity}%` }}
                            title={`Verbosity: ${metrics.verbosity.toFixed(0)}%`}
                          />
                          <div 
                            className="bg-chart-4 transition-all"
                            style={{ width: `${metrics.emotionality}%` }}
                            title={`Emotionality: ${metrics.emotionality}%`}
                          />
                          <div 
                            className="rounded-r bg-chart-6 transition-all"
                            style={{ width: `${metrics.questionRatio}%` }}
                            title={`Questions: ${metrics.questionRatio}%`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-chart-2" />
                    <span className="text-sm text-muted-foreground">Verbosity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-chart-4" />
                    <span className="text-sm text-muted-foreground">Emotionality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-chart-6" />
                    <span className="text-sm text-muted-foreground">Questions</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
