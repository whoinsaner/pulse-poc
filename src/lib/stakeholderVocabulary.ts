import { StakeholderLens, LENS_CONFIG } from '@/types/database';

// Vocabulary mapping for transforming base diagnostic terms to stakeholder-specific language
export interface VocabularyEntry {
  baseTerm: string;
  translations: Partial<Record<StakeholderLens, string>>;
}

// Core vocabulary translations - how concepts should be framed for each stakeholder
export const DIAGNOSTIC_VOCABULARY: VocabularyEntry[] = [
  {
    baseTerm: 'Character lacks depth',
    translations: {
      actor: 'Limited opportunities for emotional range display',
      producer: 'May require additional character development passes',
      financier: 'Character appeal risk affecting marketability',
      director: 'Insufficient character texture for visual storytelling',
      writer: 'Character interiority needs layering',
      studio_executive: 'Lead role may not attract A-list talent',
      ott_platform: 'Character stickiness may impact retention',
      theatrical: 'Audience connection point underdeveloped',
      investor: 'Star attachment difficulty factor'
    }
  },
  {
    baseTerm: 'Structural issues',
    translations: {
      actor: 'Scene flow disrupts performance rhythm',
      producer: 'Schedule impact from structural rewrites',
      financier: 'Development cost risk from story architecture',
      director: 'Pacing challenges require editorial solutions',
      writer: 'Act breaks and turning points need strengthening',
      studio_executive: 'Script requires development cycle before greenlight',
      ott_platform: 'Episode structure affects binge mechanics',
      theatrical: 'Third act resolution impacts audience satisfaction',
      investor: 'Development timeline risk factor'
    }
  },
  {
    baseTerm: 'Market concerns',
    translations: {
      actor: 'Role visibility in competitive landscape',
      producer: 'Distribution positioning challenges',
      financier: 'ROI risk factors in current market',
      director: 'Genre positioning affects creative latitude',
      writer: 'Commercial expectations may constrain voice',
      studio_executive: 'Quadrant appeal requires consideration',
      ott_platform: 'Algorithm compatibility and discoverability',
      theatrical: 'Box office positioning in release window',
      investor: 'Market timing and competitive positioning'
    }
  },
  {
    baseTerm: 'Protagonist arc unclear',
    translations: {
      actor: 'Character journey lacks clear transformation beats for performance showcase',
      producer: 'Lead arc needs clarification before casting conversations',
      financier: 'Weak protagonist reduces star attachment and marketing hooks',
      director: 'Character through-line needs visual anchoring',
      writer: 'Protagonist want/need and flaw require sharpening',
      studio_executive: 'Lead character marketability needs development',
      ott_platform: 'Protagonist journey affects episode hooks and season arc',
      theatrical: 'Audience surrogate lacks clear emotional throughline',
      investor: 'Lead role attachment risk affects package value'
    }
  },
  {
    baseTerm: 'Dialogue issues',
    translations: {
      actor: 'Lines lack subtext and actable intention',
      producer: 'Dialogue pass needed, potential for dialogue polish hire',
      financier: 'Quotable moments and marketing soundbites limited',
      director: 'Dialogue pacing affects scene rhythm',
      writer: 'Subtext, voice distinction, and exposition balance need work',
      studio_executive: 'Trailer moments and marketing hooks underdeveloped',
      ott_platform: 'Shareable dialogue moments for social engagement limited',
      theatrical: 'Crowd-pleasing lines and memorable quotes sparse',
      investor: 'Word-of-mouth hooks and viral potential reduced'
    }
  },
  {
    baseTerm: 'Pacing problems',
    translations: {
      actor: 'Scene durations affect performance building and emotional peaks',
      producer: 'Runtime concerns may require editorial intervention',
      financier: 'Audience attention risk in key revenue segments',
      director: 'Rhythm and tempo require careful post-production attention',
      writer: 'Scene length variation and act timing need calibration',
      studio_executive: 'Runtime may impact theatrical exhibition flexibility',
      ott_platform: 'Skip-forward risk in slower segments',
      theatrical: 'Intermission placement and act timing concerns',
      investor: 'Engagement metrics risk in longer formats'
    }
  },
  {
    baseTerm: 'Theme underdeveloped',
    translations: {
      actor: 'Character motivation lacks philosophical grounding',
      producer: 'Thematic marketing angles need clarification',
      financier: 'Message clarity affects awards positioning',
      director: 'Visual motif opportunities unexplored',
      writer: 'Central argument and controlling idea need strengthening',
      studio_executive: 'Cultural relevance hook needs sharpening',
      ott_platform: 'Discussion-worthy elements for social engagement thin',
      theatrical: 'Post-viewing conversation drivers limited',
      investor: 'Prestige potential and awards circuit positioning weak'
    }
  },
  {
    baseTerm: 'Production complexity high',
    translations: {
      actor: 'Demanding shooting conditions may affect performance',
      producer: 'Budget and schedule risk from execution requirements',
      financier: 'Cost-to-return ratio concern',
      director: 'Technical requirements may constrain creative choices',
      writer: 'Script may need production-friendly alternatives',
      studio_executive: 'Execution risk requires experienced filmmaker',
      ott_platform: 'Episode budget consistency across season challenging',
      theatrical: 'Spectacle expectations require adequate resources',
      investor: 'Capital requirements and production risk elevated'
    }
  }
];

// Executive summary templates per stakeholder
export const EXECUTIVE_SUMMARY_TEMPLATES: Record<StakeholderLens, {
  prefix: string;
  scoreLabel: string;
  strengthsIntro: string;
  concernsIntro: string;
}> = {
  actor: {
    prefix: 'Role Assessment',
    scoreLabel: 'Castability Score',
    strengthsIntro: 'Performance opportunities in',
    concernsIntro: 'Craft considerations'
  },
  producer: {
    prefix: 'Production Assessment',
    scoreLabel: 'Greenlight Confidence',
    strengthsIntro: 'Execution advantages in',
    concernsIntro: 'Production risks'
  },
  financier: {
    prefix: 'Investment Assessment',
    scoreLabel: 'Investment Confidence',
    strengthsIntro: 'ROI indicators in',
    concernsIntro: 'Risk factors'
  },
  director: {
    prefix: 'Creative Assessment',
    scoreLabel: 'Director Attachment Score',
    strengthsIntro: 'Visual storytelling potential in',
    concernsIntro: 'Creative challenges'
  },
  writer: {
    prefix: 'Craft Assessment',
    scoreLabel: 'Development Score',
    strengthsIntro: 'Strengths in',
    concernsIntro: 'Development focus areas'
  },
  studio_executive: {
    prefix: 'Greenlight Assessment',
    scoreLabel: 'Production Readiness',
    strengthsIntro: 'Commercial strengths in',
    concernsIntro: 'Development requirements'
  },
  ott_platform: {
    prefix: 'Platform Assessment',
    scoreLabel: 'Acquisition Score',
    strengthsIntro: 'Subscriber appeal in',
    concernsIntro: 'Retention concerns'
  },
  theatrical: {
    prefix: 'Exhibition Assessment',
    scoreLabel: 'Theatrical Viability',
    strengthsIntro: 'Big-screen strengths in',
    concernsIntro: 'Exhibition considerations'
  },
  investor: {
    prefix: 'Investment Assessment',
    scoreLabel: 'ROI Confidence',
    strengthsIntro: 'Monetization strengths in',
    concernsIntro: 'Investment risks'
  }
};

// Recommendation framing per stakeholder - how to present action items
export const RECOMMENDATION_FRAMES: Record<StakeholderLens, {
  actionVerb: string;
  decisionContext: string;
  riskFrame: string;
}> = {
  actor: {
    actionVerb: 'Request from writer',
    decisionContext: 'when discussing the role',
    riskFrame: 'role limitations'
  },
  producer: {
    actionVerb: 'Schedule for development',
    decisionContext: 'before packaging',
    riskFrame: 'production risk'
  },
  financier: {
    actionVerb: 'Factor into valuation',
    decisionContext: 'in investment analysis',
    riskFrame: 'ROI impact'
  },
  director: {
    actionVerb: 'Address in prep',
    decisionContext: 'during development',
    riskFrame: 'creative constraints'
  },
  writer: {
    actionVerb: 'Prioritize in rewrite',
    decisionContext: 'in next draft',
    riskFrame: 'craft issues'
  },
  studio_executive: {
    actionVerb: 'Require before greenlight',
    decisionContext: 'for development slate',
    riskFrame: 'execution risk'
  },
  ott_platform: {
    actionVerb: 'Note for development',
    decisionContext: 'in acquisition evaluation',
    riskFrame: 'retention risk'
  },
  theatrical: {
    actionVerb: 'Ensure for release',
    decisionContext: 'in exhibition strategy',
    riskFrame: 'box office risk'
  },
  investor: {
    actionVerb: 'Account for in projections',
    decisionContext: 'in financial model',
    riskFrame: 'investment risk'
  }
};

// Key metrics that each stakeholder cares about
export const STAKEHOLDER_KEY_METRICS: Record<StakeholderLens, {
  primary: string[];
  secondary: string[];
}> = {
  actor: {
    primary: ['Character Depth', 'Dialogue Quality', 'Emotional Range'],
    secondary: ['Screen Time', 'Arc Clarity', 'Scene Partners']
  },
  producer: {
    primary: ['Production Feasibility', 'Schedule Risk', 'Budget Alignment'],
    secondary: ['Location Count', 'VFX Requirements', 'Cast Size']
  },
  financier: {
    primary: ['Commercial Viability', 'IP Potential', 'Market Timing'],
    secondary: ['Comparable Success', 'Budget Ratio', 'Revenue Streams']
  },
  director: {
    primary: ['Visual Potential', 'Pacing Quality', 'Tonal Consistency'],
    secondary: ['Set Pieces', 'Character Moments', 'Theme Clarity']
  },
  writer: {
    primary: ['Structural Integrity', 'Character Arcs', 'Dialogue Authenticity'],
    secondary: ['Theme Coherence', 'Conflict Escalation', 'Scene Economy']
  },
  studio_executive: {
    primary: ['Concept Originality', 'Market Fit', 'Talent Attachability'],
    secondary: ['Franchise Potential', 'Awards Viability', 'Risk Profile']
  },
  ott_platform: {
    primary: ['Binge-worthiness', 'Episode Hooks', 'Season Arc'],
    secondary: ['Demographics', 'Retention Curve', 'Social Shareability']
  },
  theatrical: {
    primary: ['Spectacle Potential', 'Emotional Impact', 'Event Appeal'],
    secondary: ['Runtime', 'Audience Accessibility', 'Repeat Viewing']
  },
  investor: {
    primary: ['Monetization Readiness', 'ROI Indicators', 'Exit Potential'],
    secondary: ['Market Size', 'Competitive Position', 'Risk Factors']
  }
};

// Helper function to translate a base diagnostic term to stakeholder-specific language
export function translateTerm(
  baseTerm: string,
  stakeholderLens: StakeholderLens
): string {
  // Find exact match first
  const entry = DIAGNOSTIC_VOCABULARY.find(
    v => v.baseTerm.toLowerCase() === baseTerm.toLowerCase()
  );
  
  if (entry && entry.translations[stakeholderLens]) {
    return entry.translations[stakeholderLens]!;
  }
  
  // Try partial match
  const partialMatch = DIAGNOSTIC_VOCABULARY.find(
    v => baseTerm.toLowerCase().includes(v.baseTerm.toLowerCase()) ||
         v.baseTerm.toLowerCase().includes(baseTerm.toLowerCase())
  );
  
  if (partialMatch && partialMatch.translations[stakeholderLens]) {
    return partialMatch.translations[stakeholderLens]!;
  }
  
  // Return original if no translation found
  return baseTerm;
}

// Generate stakeholder-specific executive summary
export function generateExecutiveSummary(
  title: string,
  score: number,
  strengths: string[],
  concerns: string[],
  stakeholderLens: StakeholderLens
): string {
  const template = EXECUTIVE_SUMMARY_TEMPLATES[stakeholderLens];
  const config = LENS_CONFIG[stakeholderLens];
  
  const scoreLabel = score >= 75 ? 'strong' : score >= 50 ? 'moderate' : 'weak';
  
  let summary = `${template.prefix}: "${title}" shows ${scoreLabel} indicators from a ${config.label.toLowerCase()} perspective (${template.scoreLabel}: ${Math.round(score)}/100). `;
  
  if (strengths.length > 0) {
    summary += `${template.strengthsIntro} ${strengths.slice(0, 2).join(' and ').toLowerCase()}. `;
  }
  
  if (concerns.length > 0) {
    summary += `${template.concernsIntro}: ${concerns.slice(0, 2).join(', ').toLowerCase()}.`;
  } else {
    summary += 'No critical concerns identified.';
  }
  
  return summary;
}

// Generate stakeholder-specific recommendation
export function generateRecommendation(
  issue: string,
  fixCost: 'Low' | 'Medium' | 'High',
  stakeholderLens: StakeholderLens
): string {
  const frame = RECOMMENDATION_FRAMES[stakeholderLens];
  const translatedIssue = translateTerm(issue, stakeholderLens);
  
  const urgency = fixCost === 'High' ? 'Critical' : fixCost === 'Medium' ? 'Important' : 'Consider';
  
  return `${urgency}: ${frame.actionVerb} to address ${translatedIssue.toLowerCase()} ${frame.decisionContext}. (${frame.riskFrame}: ${fixCost.toLowerCase()} effort to mitigate)`;
}

// Get the current vocabulary version for tracking
export const VOCABULARY_VERSION = '1.0.0';
