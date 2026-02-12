import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { 
  SectionHeader, 
  ScoreDisplay,
  VerdictBox,
  ScoreBar,
  SubSectionHeader,
} from '@/components/report/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Globe, 
  User, 
  Palette, 
  Repeat, 
  Copy,
  Check,
  Lock,
  Unlock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

interface ParameterScore {
  parameterName: string;
  displayName?: string;
  score: number;
  rationale?: string;
  category?: string;
  evidence?: { quotes?: string[]; scenes?: string[] };
}

export default function SeriesBibleExtract() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();
  const [copied, setCopied] = useState(false);

  const scriptType = reportData.scriptMetadata?.scriptType;
  const isEpisodicFormat = ['web_series', 'pilot', 'episode'].includes(scriptType || '');

  // Extract parameters by category
  const allParams = (reportData.parameterScores || []) as ParameterScore[];

  // Core Premise parameters
  const premiseParams = allParams.filter(p => 
    p.parameterName?.includes('concept') || 
    p.parameterName?.includes('hook') ||
    p.parameterName?.includes('compressibility') ||
    p.parameterName?.includes('familiarity') ||
    p.parameterName?.includes('logline')
  );

  // World Rules parameters
  const worldParams = allParams.filter(p => 
    p.parameterName?.includes('world') || 
    p.parameterName?.includes('setting') ||
    p.parameterName?.includes('plausibility') ||
    p.parameterName?.includes('spatial') ||
    p.category === 'World & Logic'
  );

  // Tonal Guardrails parameters
  const toneParams = allParams.filter(p => 
    p.parameterName?.includes('tone') || 
    p.parameterName?.includes('genre') ||
    p.parameterName?.includes('thematic') ||
    p.parameterName?.includes('symbol') ||
    p.parameterName?.includes('motif')
  );

  // Character Arc parameters
  const arcParams = allParams.filter(p => 
    p.parameterName?.includes('want_vs_need') || 
    p.parameterName?.includes('transformation') ||
    p.parameterName?.includes('psychological') ||
    p.parameterName?.includes('agency') ||
    p.parameterName?.includes('flaw')
  );

  // Series Sustainability parameters (episodic only)
  const seriesParams = allParams.filter(p => 
    p.parameterName?.includes('serial') || 
    p.parameterName?.includes('episode') ||
    p.parameterName?.includes('franchise') ||
    p.parameterName?.includes('retention') ||
    p.parameterName?.includes('momentum') ||
    p.category === 'Web Series'
  );

  // Calculate section scores
  const getAvgScore = (params: ParameterScore[]) => 
    params.length > 0 ? params.reduce((sum, p) => sum + p.score, 0) / params.length : currentScore;

  const premiseScore = getAvgScore(premiseParams);
  const worldScore = getAvgScore(worldParams);
  const toneScore = getAvgScore(toneParams);
  const arcScore = getAvgScore(arcParams);
  const seriesScore = getAvgScore(seriesParams);

  // Get high-level rationale from top parameters
  const getTopRationale = (params: ParameterScore[]) => {
    const sorted = [...params].sort((a, b) => b.score - a.score);
    return sorted[0]?.rationale || 'Analysis pending...';
  };

  // Extract fixed vs flexible world rules from evidence
  const extractWorldRules = () => {
    const fixedRules: string[] = [];
    const flexibleRules: string[] = [];
    
    worldParams.forEach(p => {
      if (p.score >= 7) {
        fixedRules.push(p.displayName || p.parameterName);
      } else if (p.score >= 4) {
        flexibleRules.push(p.displayName || p.parameterName);
      }
    });

    return {
      fixed: fixedRules.length > 0 ? fixedRules : ['Core story logic', 'Primary setting rules', 'Character capabilities'],
      flexible: flexibleRules.length > 0 ? flexibleRules : ['Secondary locations', 'Relationship dynamics', 'Revelation timing']
    };
  };

  const worldRules = extractWorldRules();

  // Generate plain-text summary for export
  const generatePlainTextSummary = () => {
    const title = reportData.scriptMetadata?.title || 'Untitled Script';
    const logline = reportData.scriptMetadata?.logline || premiseParams[0]?.rationale || 'Logline not provided';
    
    let summary = `SERIES BIBLE EXTRACT - ${title}\n`;
    summary += `${'='.repeat(40)}\n\n`;
    
    summary += `CORE PREMISE\n`;
    summary += `-`.repeat(20) + '\n';
    summary += `${logline}\n\n`;
    
    summary += `WORLD RULES\n`;
    summary += `-`.repeat(20) + '\n';
    summary += `Fixed: ${worldRules.fixed.join(', ')}\n`;
    summary += `Flexible: ${worldRules.flexible.join(', ')}\n\n`;
    
    summary += `TONAL GUARDRAILS\n`;
    summary += `-`.repeat(20) + '\n';
    summary += `${getTopRationale(toneParams)}\n\n`;
    
    summary += `CHARACTER TRAJECTORIES\n`;
    summary += `-`.repeat(20) + '\n';
    summary += `${getTopRationale(arcParams)}\n\n`;
    
    if (isEpisodicFormat) {
      summary += `SERIES ENGINE\n`;
      summary += `-`.repeat(20) + '\n';
      summary += `${getTopRationale(seriesParams)}\n\n`;
    }
    
    summary += `\nGenerated by Pulse V2 | ${new Date().toLocaleDateString()}`;
    
    return summary;
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatePlainTextSummary());
      setCopied(true);
      toast.success('Bible summary copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const overallScore = (premiseScore + worldScore + toneScore + arcScore) / 4;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Series Bible Extract"
        subtitle="World rules, character trajectories, and tonal guardrails"
        icon={BookOpen}
        score={overallScore}
      >
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopyToClipboard}
          className="gap-2"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy Summary'}
        </Button>
      </SectionHeader>

      {/* Core Premise Box */}
      <Card className="bg-card border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Core Premise</h3>
                <p className="text-sm text-muted-foreground">The elevator pitch & hook</p>
              </div>
            </div>
            <ScoreDisplay score={premiseScore} size="md" />
          </div>
        </div>
        <CardContent className="p-6">
          <blockquote className="text-lg italic text-foreground/90 border-l-4 border-primary/50 pl-4 mb-4">
            "{reportData.scriptMetadata?.logline || getTopRationale(premiseParams)}"
          </blockquote>
          {premiseParams.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {premiseParams.slice(0, 4).map((p, i) => (
                <div key={i} className="text-center p-3 rounded-lg bg-muted/30">
                  <ScoreDisplay score={p.score} size="sm" />
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {p.displayName || p.parameterName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* World Rules & Constraints */}
      <Card className="bg-card border border-border p-6">
        <SubSectionHeader 
          title="World Rules & Constraints"
          subtitle="What's fixed vs. what can change"
          score={worldScore}
        />
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-5 w-5 text-destructive" />
              <h4 className="font-display font-semibold">Fixed Rules</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              These elements cannot be broken or contradicted.
            </p>
            <ul className="space-y-2">
              {worldRules.fixed.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="shrink-0 mt-0.5 bg-destructive/10 border-destructive/30">
                    Locked
                  </Badge>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-chart-4/5 border border-chart-4/20">
            <div className="flex items-center gap-2 mb-3">
              <Unlock className="h-5 w-5 text-chart-4" />
              <h4 className="font-display font-semibold">Flexible Elements</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              These can evolve with the story.
            </p>
            <ul className="space-y-2">
              {worldRules.flexible.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="shrink-0 mt-0.5 bg-chart-4/10 border-chart-4/30">
                    Flex
                  </Badge>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {worldParams.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="space-y-3">
              {worldParams.slice(0, 4).map((param, i) => (
                <ScoreBar 
                  key={i}
                  score={param.score} 
                  label={param.displayName || param.parameterName}
                  showValue 
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Tonal Guardrails */}
      <Card className="bg-card border border-border p-6">
        <SubSectionHeader 
          title="Tonal Guardrails"
          subtitle="Genre expectations and tonal boundaries"
          score={toneScore}
        />
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-5 w-5 text-primary" />
              <h4 className="font-display font-medium">Genre</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {reportData.scriptMetadata?.genre || 'Drama / Thriller'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-chart-2/5 border border-chart-2/20">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-chart-2" />
              <h4 className="font-display font-medium">Tone</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {toneParams[0]?.rationale?.slice(0, 60) || 'Grounded, emotional, high-stakes'}...
            </p>
          </div>
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-destructive" />
              <h4 className="font-display font-medium">Avoid</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Camp, slapstick, tonal whiplash
            </p>
          </div>
        </div>
        {toneParams.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="space-y-3">
              {toneParams.slice(0, 4).map((param, i) => (
                <ScoreBar 
                  key={i}
                  score={param.score} 
                  label={param.displayName || param.parameterName}
                  showValue 
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Character Trajectories */}
      <Card className="bg-card border border-border p-6">
        <SubSectionHeader 
          title="Character Trajectories"
          subtitle="Start → End transformation arcs"
          score={arcScore}
        />
        <VerdictBox
          type={arcScore >= 7 ? 'success' : arcScore >= 5 ? 'finding' : 'issue'}
          title={arcScore >= 7 ? 'Clear Character Journeys' : arcScore >= 5 ? 'Arc Development Needed' : 'Arcs Unclear'}
          content={getTopRationale(arcParams)}
        />
        {arcParams.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {arcParams.slice(0, 4).map((param, i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <h4 className="font-display font-medium text-sm">
                      {param.displayName || param.parameterName}
                    </h4>
                  </div>
                  <ScoreDisplay score={param.score} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-muted/50">Start</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="px-2 py-1 rounded bg-primary/10">End</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Series Engine (Episodic Only) */}
      {isEpisodicFormat && (
        <Card className="bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-chart-5/20">
              <Repeat className="h-5 w-5 text-chart-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">Series Engine</h3>
              <p className="text-sm text-muted-foreground">Reset vs. Accumulate logic for episodic sustainability</p>
            </div>
            <div className="ml-auto">
              <ScoreDisplay score={seriesScore} size="md" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="p-4 rounded-xl bg-chart-5/5 border border-chart-5/20">
              <h4 className="font-display font-semibold mb-2">Episode Reset</h4>
              <p className="text-sm text-muted-foreground">
                Elements that return to baseline each episode.
              </p>
              <ul className="mt-3 space-y-1">
                <li className="text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-chart-5" />
                  New case/problem/conflict
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-chart-5" />
                  Guest characters
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-chart-5" />
                  Location variety
                </li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h4 className="font-display font-semibold mb-2">Accumulate</h4>
              <p className="text-sm text-muted-foreground">
                Elements that build across the season.
              </p>
              <ul className="mt-3 space-y-1">
                <li className="text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Protagonist relationships
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Mystery/investigation progress
                </li>
                <li className="text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Character growth
                </li>
              </ul>
            </div>
          </div>

          {seriesParams.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="space-y-3">
                {seriesParams.slice(0, 4).map((param, i) => (
                  <ScoreBar 
                    key={i}
                    score={param.score} 
                    label={param.displayName || param.parameterName}
                    showValue 
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Quick Reference Footer */}
      <Card className="bg-card border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display font-semibold">Quick Reference Export</h4>
            <p className="text-sm text-muted-foreground">
              Copy a plain-text summary for writers' rooms, pitch decks, or production docs.
            </p>
          </div>
          <Button 
            onClick={handleCopyToClipboard}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Bible Summary'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
