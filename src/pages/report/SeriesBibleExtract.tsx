import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  SectionHeader, 
  DiagnosisSummary,
  WeightedParameterList,
  DevelopmentFocus,
  SubSectionHeader,
  ScoreDisplay,
} from '@/components/report/ui';
import { InlineMaturity } from '@/components/report/ui/MaturityBadge';
import { 
  BookOpen, Copy, Check, Lock, Unlock, Palette, Globe, 
  User, Repeat, ArrowRight, Sparkles 
} from 'lucide-react';
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

// Matcher functions for each bible section
const isPremise = (p: ParameterScore) =>
  p.parameterName?.includes('concept') ||
  p.parameterName?.includes('hook') ||
  p.parameterName?.includes('compressibility') ||
  p.parameterName?.includes('familiarity') ||
  p.parameterName?.includes('logline');

const isWorld = (p: ParameterScore) =>
  p.parameterName?.includes('world') ||
  p.parameterName?.includes('setting') ||
  p.parameterName?.includes('plausibility') ||
  p.parameterName?.includes('spatial') ||
  p.category === 'World & Logic';

const isTone = (p: ParameterScore) =>
  p.parameterName?.includes('tone') ||
  p.parameterName?.includes('genre') ||
  p.parameterName?.includes('thematic') ||
  p.parameterName?.includes('symbol') ||
  p.parameterName?.includes('motif');

const isArc = (p: ParameterScore) =>
  p.parameterName?.includes('want_vs_need') ||
  p.parameterName?.includes('transformation') ||
  p.parameterName?.includes('psychological') ||
  p.parameterName?.includes('agency') ||
  p.parameterName?.includes('flaw');

const isSeries = (p: ParameterScore) =>
  p.parameterName?.includes('serial') ||
  p.parameterName?.includes('episode') ||
  p.parameterName?.includes('franchise') ||
  p.parameterName?.includes('retention') ||
  p.parameterName?.includes('momentum') ||
  p.category === 'Web Series';

const ALL_MATCHERS = [isPremise, isWorld, isTone, isArc, isSeries];

export default function SeriesBibleExtract() {
  const context = useOutletContext<ReportContextValue>();
  const { reportData, currentScore } = context;
  const [copied, setCopied] = useState(false);

  const scriptType = reportData.scriptMetadata?.scriptType;
  const isEpisodicFormat = ['web_series', 'pilot', 'episode'].includes(scriptType || '');

  const allParams = (reportData.parameterScores || []) as ParameterScore[];

  // Section-specific parameter lists
  const premiseParams = useMemo(() => allParams.filter(isPremise), [allParams]);
  const worldParams = useMemo(() => allParams.filter(isWorld), [allParams]);
  const toneParams = useMemo(() => allParams.filter(isTone), [allParams]);
  const arcParams = useMemo(() => allParams.filter(isArc), [allParams]);
  const seriesParams = useMemo(() => allParams.filter(isSeries), [allParams]);

  // Consolidated deduplicated list for standardized components
  const bibleParameters = useMemo(() => {
    const seen = new Set<string>();
    const result: Array<{
      parameterName: string;
      displayName: string;
      score: number;
      rationale?: string;
      weight: number;
    }> = [];
    for (const p of allParams) {
      if (seen.has(p.parameterName)) continue;
      if (ALL_MATCHERS.some(m => m(p))) {
        seen.add(p.parameterName);
        result.push({
          parameterName: p.parameterName,
          displayName: p.displayName || p.parameterName,
          score: p.score,
          rationale: p.rationale,
          weight: 1.0,
        });
      }
    }
    return result;
  }, [allParams]);

  // Scores
  const getAvgScore = (params: ParameterScore[]) =>
    params.length > 0 ? params.reduce((s, p) => s + p.score, 0) / params.length : currentScore;

  const sectionScore = useMemo(() => {
    if (bibleParameters.length === 0) return currentScore;
    return Math.round(bibleParameters.reduce((s, p) => s + p.score, 0) / bibleParameters.length);
  }, [bibleParameters, currentScore]);

  const premiseScore = getAvgScore(premiseParams);
  const worldScore = getAvgScore(worldParams);
  const toneScore = getAvgScore(toneParams);
  const arcScore = getAvgScore(arcParams);
  const seriesScore = getAvgScore(seriesParams);

  const getTopRationale = (params: ParameterScore[]) => {
    const sorted = [...params].sort((a, b) => b.score - a.score);
    return sorted[0]?.rationale || 'Analysis pending...';
  };

  // World rules extraction
  const worldRules = useMemo(() => {
    const fixed: string[] = [];
    const flexible: string[] = [];
    worldParams.forEach(p => {
      if (p.score >= 7) fixed.push(p.displayName || p.parameterName);
      else if (p.score >= 4) flexible.push(p.displayName || p.parameterName);
    });
    return {
      fixed: fixed.length > 0 ? fixed : ['Core story logic', 'Primary setting rules', 'Character capabilities'],
      flexible: flexible.length > 0 ? flexible : ['Secondary locations', 'Relationship dynamics', 'Revelation timing'],
    };
  }, [worldParams]);

  // Copy summary
  const generatePlainTextSummary = () => {
    const title = reportData.scriptMetadata?.title || 'Untitled Script';
    const logline = reportData.scriptMetadata?.logline || premiseParams[0]?.rationale || 'Logline not provided';
    let summary = `SERIES BIBLE EXTRACT - ${title}\n${'='.repeat(40)}\n\n`;
    summary += `CORE PREMISE\n${'-'.repeat(20)}\n${logline}\n\n`;
    summary += `WORLD RULES\n${'-'.repeat(20)}\nFixed: ${worldRules.fixed.join(', ')}\nFlexible: ${worldRules.flexible.join(', ')}\n\n`;
    summary += `TONAL GUARDRAILS\n${'-'.repeat(20)}\n${getTopRationale(toneParams)}\n\n`;
    summary += `CHARACTER TRAJECTORIES\n${'-'.repeat(20)}\n${getTopRationale(arcParams)}\n\n`;
    if (isEpisodicFormat) {
      summary += `SERIES ENGINE\n${'-'.repeat(20)}\n${getTopRationale(seriesParams)}\n\n`;
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

  const basePath = window.location.pathname.split('/bible')[0];

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* ── Standardized Header ── */}
      <SectionHeader
        title="Series Bible Extract"
        subtitle="World rules, character trajectories, and tonal guardrails"
        icon={BookOpen}
        score={sectionScore}
      >
        <InlineMaturity score={sectionScore} />
      </SectionHeader>

      {/* ── Diagnosis Summary ── */}
      <DiagnosisSummary
        parameters={bibleParameters}
        categoryName="Series Bible"
        developmentLink={`${basePath}/development`}
      />

      {/* ── Weighted Parameter Breakdown ── */}
      <WeightedParameterList
        parameters={bibleParameters}
        title="Series Bible Parameter Breakdown"
        initiallyExpanded={false}
        defaultVisibleCount={6}
      />

      {/* ══════════════════════════════════════════
          Bible-Specific Detail Sections
          ══════════════════════════════════════════ */}

      {/* Core Premise */}
      <Card className="bg-card border border-border overflow-hidden">
        <div className="p-6 border-b border-border/50">
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
                  <span className="shrink-0 mt-0.5 text-xs px-1.5 py-0.5 rounded bg-destructive/10 border border-destructive/30 text-destructive">
                    Locked
                  </span>
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
                  <span className="shrink-0 mt-0.5 text-xs px-1.5 py-0.5 rounded bg-chart-4/10 border border-chart-4/30 text-chart-4">
                    Flex
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
              {toneParams[0]?.rationale?.slice(0, 80) || 'Grounded, emotional, high-stakes'}
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
      </Card>

      {/* Character Trajectories */}
      <Card className="bg-card border border-border p-6">
        <SubSectionHeader
          title="Character Trajectories"
          subtitle="Start → End transformation arcs"
          score={arcScore}
        />
        {arcParams.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
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
                {param.rationale && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{param.rationale}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
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
              <p className="text-sm text-muted-foreground">Elements that return to baseline each episode.</p>
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
              <p className="text-sm text-muted-foreground">Elements that build across the season.</p>
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
        </Card>
      )}

      {/* Development Focus */}
      {(() => {
        const items = bibleParameters
          .filter(p => p.score < 70)
          .sort((a, b) => a.score - b.score)
          .map(p => ({ title: p.displayName, description: p.rationale || '' }));
        return items.length > 0 ? (
          <DevelopmentFocus
            sectionName="Series Bible"
            items={items}
            developmentPath={`${basePath}/development`}
            relatedSections={[
              { label: 'Story Diagnosis', path: `${basePath}/story` },
              { label: 'Character Diagnosis', path: `${basePath}/characters` },
              { label: 'Format Diagnosis', path: `${basePath}/format` },
            ]}
          />
        ) : null;
      })()}

      {/* Copy Summary Footer */}
      <Card className="p-5 bg-card border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold">Quick Reference Export</h4>
            <p className="text-sm text-muted-foreground">
              Copy a plain-text summary for writers' rooms, pitch decks, or production docs.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
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
