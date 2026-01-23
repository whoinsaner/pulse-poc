/**
 * Pulse V2 Documentation Content
 * Matches the 10-section structure from the Pulse V2 specification
 */

export const PULSE_V2_METADATA = {
  version: '2.0',
  name: 'Pulse V2',
  fullName: 'Universal Script Analysis Framework',
  tagline: 'A Standardized, Cross-Format System for Evaluating Scripts with Clarity, Consistency, and Actionability',
};

export const PULSE_V2_SECTIONS = {
  whatIsPulse: {
    number: 1,
    title: 'What Is Pulse V2?',
    content: `Pulse V2 is a universal script analysis framework designed to evaluate any scripted narrative—across film, OTT, web series, long-form episodes, limited series, and experimental formats—using a single, consistent lens.

It transforms script evaluation from a subjective, taste-driven exercise into a structured diagnostic system that:

• Preserves creative nuance
• Produces comparable, defensible judgments
• Surfaces why a script works or fails
• Clearly signals what to fix, develop, or greenlight

Pulse V2 is format-agnostic, platform-aware, and built for real production and commissioning decisions.`,
  },

  whyNeeded: {
    number: 2,
    title: 'Why Pulse V2 Was Needed',
    content: `Traditional script reviews suffer from predictable problems:

• Feedback varies wildly by reviewer
• Opinions are expressed as instinct, not evidence
• Notes feel contradictory or overwhelming
• Strong ideas die early due to messy drafts
• Weak scripts advance because issues are poorly articulated

Pulse V2 solves this by introducing a shared evaluation language, a parameter-based diagnostic model, and a maturity-led decision framework.`,
  },

  philosophy: {
    number: 3,
    title: 'Core Philosophy of Pulse V2',
    intro: 'Pulse V2 is built on five foundational principles.',
    subsections: [
      {
        id: 'universal',
        number: '3.1',
        title: 'Universal, Not Format-Specific',
        content: `Pulse V2 evaluates story fundamentals, not surface format.

Whether it's a feature film, 30-min OTT episode, 60-min prestige drama, web series, or limited series pilot—the same narrative engines apply:

• Character drive
• Conflict escalation
• Emotional payoff
• Structural logic
• Thematic coherence

Pulse V2 adapts expectations, not standards.`,
      },
      {
        id: 'diagnosis',
        number: '3.2',
        title: 'Diagnosis Over Judgment',
        content: `Pulse V2 does not aim to declare scripts as "good" or "bad."

It answers:
• What is working?
• What is underdeveloped?
• What is structurally broken vs fixable?

This makes it especially effective for early drafts and high-potential concepts.`,
      },
      {
        id: 'weighting',
        number: '3.3',
        title: 'Weighting Reflects Reality',
        content: `Not all flaws are equal.

Pulse V2 applies weighted parameters so that:
• Core story failures matter more than polish issues
• Structural problems outweigh dialogue or formatting concerns
• Market readiness is evaluated separately from creative strength

This prevents false negatives and false positives.`,
      },
      {
        id: 'maturity',
        number: '3.4',
        title: 'Maturity Is as Important as Quality',
        content: `Pulse V2 distinguishes between:
• A weak script
• A strong but unfinished script

Every script is assessed on a Maturity Scale, enabling teams to say:
"This is not ready yet—but it is worth investing in."`,
      },
      {
        id: 'actionability',
        number: '3.5',
        title: 'Actionability Is Mandatory',
        content: `Every Pulse V2 evaluation must end with:
• Clear rewrite priorities
• Clear development focus areas
• A clean decision signal

If a review cannot guide action, it is incomplete.`,
      },
    ],
  },

  parameterModel: {
    number: 4,
    title: 'The Pulse V2 Parameter Model',
    intro: 'Pulse V2 evaluates scripts across 12 core parameters, designed to be comprehensive yet non-redundant.',
    parameters: [
      { name: 'Concept & Core Hook', description: 'Originality, clarity, pitchability' },
      { name: 'Narrative Structure & Pacing', description: 'Act logic, escalation, momentum' },
      { name: 'Protagonist Design & Arc', description: 'Motivation, transformation, agency' },
      { name: 'Antagonistic Force / Opposition', description: 'Credibility, pressure, escalation' },
      { name: 'Conflict & Stakes', description: 'External, internal, relational stakes' },
      { name: 'Emotional Engine', description: 'What makes the audience care' },
      { name: 'Theme & Moral Spine', description: 'What the story is about beneath plot' },
      { name: 'World & Setting Utilization', description: 'Setting as an active narrative device' },
      { name: 'Dialogue & Subtext', description: 'Voice, economy, implication' },
      { name: 'Tone & Genre Cohesion', description: 'Consistency and audience promise' },
      { name: 'Originality & Differentiation', description: 'Why this stands out in the market' },
      { name: 'Market & Platform Fit', description: 'OTT vs theatrical vs web suitability' },
    ],
    footer: `Each parameter is:
• Scored on a consistent scale
• Assigned a weight
• Accompanied by qualitative reasoning

The score is never the conclusion—the explanation is.`,
  },

  maturityScale: {
    number: 5,
    title: 'The Maturity Scale (Pulse V2)',
    intro: 'Pulse V2 uses a clear maturity framework to contextualize scores.',
    levels: [
      { range: '90–100', label: 'Production-Ready', description: 'Minimal rewrites required' },
      { range: '70–89', label: 'Strong / Near-Ready', description: 'Solid core, focused polish needed' },
      { range: '50–69', label: 'Developing', description: 'High potential, structural work required' },
      { range: '30–49', label: 'Underdeveloped', description: 'Foundational issues present' },
      { range: '0–29', label: 'Not Viable (Current Form)', description: 'Core premise or execution broken' },
    ],
    footer: 'This prevents premature rejection of high-upside scripts.',
  },

  outputs: {
    number: 6,
    title: 'Standard Outputs of a Pulse V2 Review',
    intro: 'A Pulse V2 analysis typically produces:',
    items: [
      { name: 'Executive Verdict (1-page)', description: 'For leadership and commissioning' },
      { name: 'Strengths vs Risks Heatmap', description: 'Clear visibility into trade-offs' },
      { name: 'Weighted Scorecard', description: 'Comparable across scripts and formats' },
      { name: 'Maturity Assessment', description: 'Readiness for development or production' },
      { name: 'Top Rewrite Priorities', description: 'Highest ROI fixes first' },
      { name: 'Go / Iterate / Hold Decision Signal', description: 'Clear actionable recommendation' },
    ],
    footer: 'This makes Pulse V2 suitable for both deep development and fast greenlight forums.',
  },

  advantages: {
    number: 7,
    title: 'Advantages of Pulse V2 for the Organization',
    subsections: [
      {
        number: '7.1',
        title: 'Creates a Shared Evaluation Language',
        content: `Writers, producers, execs, and analysts align on what words mean:
• "Structural issue"
• "Weak emotional engine"
• "Antagonist pressure gap"

This dramatically reduces miscommunication.`,
      },
      {
        number: '7.2',
        title: 'Faster, Defensible Decisions',
        content: `Pulse V2 allows leadership to answer:
• Is this worth more development money?
• Where exactly should effort be spent?
• Why are we passing or proceeding?

Decisions become traceable, not political.`,
      },
      {
        number: '7.3',
        title: 'Protects High-Potential Scripts',
        content: `Pulse V2 is designed to save promising scripts from early rejection.

It separates:
• Core promise
• Execution gaps

This is critical in early-stage IP discovery.`,
      },
      {
        number: '7.4',
        title: 'Reduces Reviewer Bias',
        content: `By anchoring feedback to parameters and weights:
• Personal taste is constrained
• Seniority bias is reduced
• Reviews become comparable across teams`,
      },
      {
        number: '7.5',
        title: 'Scales Across Formats and Time',
        content: `Pulse V2 works:
• Across reviewers
• Across drafts (v1 → v2 → v3)
• Across formats (film, OTT, web)

Progress becomes measurable, not anecdotal.`,
      },
    ],
  },

  bestFit: {
    number: 8,
    title: 'Where Pulse V2 Fits Best',
    content: `Pulse V2 is most effective at:

• Script intake & screening
• Development checkpoints
• Greenlight / commissioning reviews
• Rewrite prioritization
• Portfolio-level comparisons

It complements creative instinct—it does not replace it.`,
  },

  whatIsNot: {
    number: 9,
    title: 'What Pulse V2 Is Not',
    content: `Pulse V2 is not:

• A rigid checklist
• A creativity suppressor
• A purely numerical grading system
• A replacement for vision or taste

Think of Pulse V2 as:
A narrative diagnostic system—not a verdict machine.`,
  },

  summary: {
    number: 10,
    title: 'Summary',
    content: `Pulse V2 enables organizations to:

• Evaluate scripts consistently
• Make faster, clearer decisions
• Invest development resources wisely
• Reduce noise and bias
• Protect high-upside storytelling

By making judgment explicit, weighted, and actionable, Pulse V2 turns script evaluation into a strategic advantage, not a bottleneck.`,
  },
};

export const DECISION_SIGNALS = {
  go: {
    label: 'GO',
    scoreRange: '75–100',
    description: 'Proceed to production. Script is greenlight-ready with strong commercial elements.',
  },
  iterate: {
    label: 'ITERATE',
    scoreRange: '50–74',
    description: 'Proceed with development. Requires focused rewrites before packaging.',
  },
  hold: {
    label: 'HOLD',
    scoreRange: '0–49',
    description: 'Not recommended. Requires significant development before reconsideration.',
  },
};
