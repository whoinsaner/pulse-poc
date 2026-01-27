import { StakeholderLens, ReportData, Report, Evidence } from '@/types/database';

// ==========================================
// MICRO DRAMA SAMPLE #1: "3 Seconds"
// A scroll-stopping thriller about a life-changing moment
// ==========================================

export const SAMPLE_MICRO_DRAMA_1 = {
  id: 'micro-drama-3-seconds',
  title: '3 Seconds',
  logline: 'A surgeon has 3 seconds to choose: save her cheating husband or the stranger who witnessed the affair.',
  genre: 'Thriller',
  scriptType: 'micro_drama' as const,
  duration: 60, // seconds
  pageCount: 1,
};

// ==========================================
// MICRO DRAMA SAMPLE #2: "Last Swipe"
// Dating app horror with a twist
// ==========================================

export const SAMPLE_MICRO_DRAMA_2 = {
  id: 'micro-drama-last-swipe',
  title: 'Last Swipe',
  logline: 'She matched with the perfect guy. His profile said "looking for my last match." She thought it was romantic.',
  genre: 'Horror',
  scriptType: 'micro_drama' as const,
  duration: 90,
  pageCount: 2,
};

// ==========================================
// MICRO DRAMA SAMPLE #3: "The Notification"
// Tech paranoia in 45 seconds
// ==========================================

export const SAMPLE_MICRO_DRAMA_3 = {
  id: 'micro-drama-notification',
  title: 'The Notification',
  logline: 'Her phone shows a notification: "Your location was shared with MOM." Mom died three years ago.',
  genre: 'Horror/Thriller',
  scriptType: 'micro_drama' as const,
  duration: 45,
  pageCount: 1,
};

// ==========================================
// MICRO DRAMA SAMPLE #4: "Table for Two"
// Romantic micro with emotional gut-punch
// ==========================================

export const SAMPLE_MICRO_DRAMA_4 = {
  id: 'micro-drama-table-for-two',
  title: 'Table for Two',
  logline: 'An elderly man dines alone at a fancy restaurant every anniversary. The waiter finally asks about the empty chair.',
  genre: 'Drama/Romance',
  scriptType: 'micro_drama' as const,
  duration: 75,
  pageCount: 1,
};

// Helper to create Evidence array in correct format
const createEvidence = (strengths: string[], weaknesses: string[] = [], quotes: string[] = []): Evidence[] => {
  const evidence: Evidence[] = [];
  
  strengths.forEach((s, i) => {
    evidence.push({
      type: 'content',
      reference: `Strength ${i + 1}`,
      explanation: s,
    });
  });
  
  weaknesses.forEach((w, i) => {
    evidence.push({
      type: 'content',
      reference: `Weakness ${i + 1}`,
      explanation: w,
    });
  });
  
  quotes.forEach((q, i) => {
    evidence.push({
      type: 'dialogue',
      reference: `Quote ${i + 1}`,
      quote: q,
      explanation: 'Key dialogue moment',
    });
  });
  
  return evidence;
};

// ==========================================
// Featured Sample Report Data: "3 Seconds"
// ==========================================

export const SAMPLE_MICRO_DRAMA_REPORT_DATA: ReportData = {
  scriptMetadata: {
    title: SAMPLE_MICRO_DRAMA_1.title,
    logline: SAMPLE_MICRO_DRAMA_1.logline,
    genre: SAMPLE_MICRO_DRAMA_1.genre,
    scriptType: SAMPLE_MICRO_DRAMA_1.scriptType,
    pageCount: SAMPLE_MICRO_DRAMA_1.pageCount,
  },
  overallScore: 91.4,
  lensScores: {
    studio_executive: 82.5,
    producer: 85.3,
    actor: 88.7,
    director: 90.2,
    writer: 87.4,
    financier: 78.9,
    investor: 84.1,
    ott_platform: 94.8,
    theatrical: 45.2,
  } as Record<StakeholderLens, number>,
  categoryScores: {
    'Micro Drama': 93.5,
    'Concept': 92.1,
    'Character': 88.4,
    'Engagement': 95.2,
    'Theme': 84.6,
  },
  parameterScores: [
    // === MICRO DRAMA CORE PARAMETERS (Maximum Weight) ===
    {
      parameterId: 'hook_velocity',
      parameterName: 'hook_velocity',
      displayName: 'Hook Velocity',
      score: 96,
      confidence: 0.95,
      category: 'Micro Drama',
      rationale: 'Exceptional 1.2-second hook. The surgeon\'s dilemma is established in the opening frame with a split-screen of two patients and her frozen expression. Immediate scroll-stop achieved.',
      evidence: createEvidence([
        'Visual hook lands under 2 seconds',
        'Moral dilemma immediately clear',
        'High-stakes emotion in first frame',
      ], [], ['"Choose."']),
    },
    {
      parameterId: 'cliff_density',
      parameterName: 'cliff_density',
      displayName: 'Cliff Density',
      score: 94,
      confidence: 0.93,
      category: 'Micro Drama',
      rationale: '4 tension peaks in 60 seconds (one every 15 seconds). Perfect pacing for mobile consumption. Each cliff builds on the previous without release.',
      evidence: createEvidence([
        'Tension peak at 15s: husband recognition',
        'Tension peak at 30s: witness makes eye contact',
        'Tension peak at 45s: hand moves toward choice',
        'Final cliff at 58s: reveal of actual choice',
      ]),
    },
    // === HIGH-WEIGHT ENGAGEMENT PARAMETERS ===
    {
      parameterId: 'scroll_stop_power',
      parameterName: 'scroll_stop_power',
      displayName: 'Scroll-Stop Power',
      score: 95,
      confidence: 0.94,
      category: 'Micro Drama',
      rationale: 'The opening image—surgical gloves trembling between two crash carts—creates immediate visual arrest. Algorithm-optimized composition with central conflict framing.',
      evidence: createEvidence([
        'High-contrast visual opening',
        'Immediate emotional investment',
        'Face-forward framing for mobile',
      ]),
    },
    {
      parameterId: 'emotional_compression',
      parameterName: 'emotional_compression',
      displayName: 'Emotional Compression',
      score: 92,
      confidence: 0.91,
      category: 'Micro Drama',
      rationale: 'Full emotional arc compressed into 60 seconds: shock → recognition → betrayal → moral crisis → decision → consequence. No wasted beats.',
      evidence: createEvidence([
        'Complete emotional journey',
        'Each second serves the arc',
        'Gut-punch finale lands hard',
      ], [
        'Slight compression on betrayal beat could use one more frame',
      ]),
    },
    {
      parameterId: 'character_legibility_at_speed',
      parameterName: 'character_legibility_at_speed',
      displayName: 'Character Legibility at Speed',
      score: 90,
      confidence: 0.89,
      category: 'Micro Drama',
      rationale: 'Surgeon is immediately readable: professional, competent, emotionally complex. Costume (scrubs), setting (OR), and facial performance convey everything in 2 seconds.',
      evidence: createEvidence([
        'Instant archetype recognition',
        'Visual shorthand works perfectly',
        'Emotional range clear despite brevity',
      ], [
        'Husband/witness distinction could be sharper visually',
      ]),
    },
    {
      parameterId: 'series_hook',
      parameterName: 'series_hook',
      displayName: 'Series Hook',
      score: 88,
      confidence: 0.86,
      category: 'Micro Drama',
      rationale: '"What happens next?" is strong but self-contained. Could expand into hospital-based moral dilemma anthology. Follow potential is high.',
      evidence: createEvidence([
        'Strong anthology potential',
        'Comment section engagement bait',
        'Moral ambiguity drives rewatches',
      ], [
        'Somewhat self-contained—sequel less obvious than cliffhanger endings',
      ]),
    },
    // === SUPPORTING PARAMETERS ===
    {
      parameterId: 'vertical_format_optimization',
      parameterName: 'vertical_format_optimization',
      displayName: 'Vertical Format Optimization',
      score: 94,
      confidence: 0.92,
      category: 'Micro Drama',
      rationale: 'Every shot designed for 9:16. Split-screen moral choice uses vertical real estate brilliantly. Face-forward framing throughout. No horizontal thinking.',
      evidence: createEvidence([
        'Native vertical composition',
        'Effective use of vertical split-screen',
        'Mobile-first blocking',
      ]),
    },
    {
      parameterId: 'dialogue_efficiency',
      parameterName: 'dialogue_efficiency',
      displayName: 'Dialogue Efficiency',
      score: 97,
      confidence: 0.96,
      category: 'Micro Drama',
      rationale: 'Only 4 words of dialogue in entire piece: "Choose." and "I\'m sorry." Maximum impact, minimum verbal real estate. Visual storytelling carries the narrative.',
      evidence: createEvidence([
        'Dialogue is punchline, not exposition',
        'Every word earns its place',
        'Silence amplifies tension',
      ], [], ['"Choose."', '"I\'m sorry."']),
    },
    {
      parameterId: 'visual_hook_density',
      parameterName: 'visual_hook_density',
      displayName: 'Visual Hook Density',
      score: 91,
      confidence: 0.88,
      category: 'Micro Drama',
      rationale: 'Visual hooks every 8-10 seconds. The trembling hands, the wedding ring close-up, the witness\'s knowing look, the final choice. Scroll-resistant imagery throughout.',
      evidence: createEvidence([
        'Ring close-up is genius visual shorthand',
        'Each beat has a screenshot-worthy moment',
        'High shareability factor',
      ]),
    },
    {
      parameterId: 'replay_value',
      parameterName: 'replay_value',
      displayName: 'Replay Value',
      score: 89,
      confidence: 0.87,
      category: 'Micro Drama',
      rationale: 'Moral ambiguity demands rewatch. "Did she make the right choice?" drives comment engagement. Easter eggs in background (other medical staff reactions) reward repeat viewing.',
      evidence: createEvidence([
        'Moral debate in comments',
        'Background details add depth',
        'Different interpretation on rewatch',
      ], [
        'Once the twist is known, some urgency fades',
      ]),
    },
    // === STANDARD CONCEPT PARAMETERS ===
    {
      parameterId: 'concept_originality',
      parameterName: 'concept_originality',
      displayName: 'Concept Originality',
      score: 87,
      confidence: 0.85,
      category: 'Concept',
      rationale: 'Medical moral dilemma is familiar territory, but the specific betrayal-witness twist adds freshness. The compression itself is innovative.',
      evidence: createEvidence([
        'Fresh angle on moral choice trope',
        'Personal stakes elevate generic setup',
      ], [
        'Hospital setting is well-trodden',
      ]),
    },
    {
      parameterId: 'hook_clarity',
      parameterName: 'hook_clarity',
      displayName: 'Hook Clarity',
      score: 95,
      confidence: 0.94,
      category: 'Concept',
      rationale: 'The premise is graspable in 3 seconds flat. One image, one choice, complete understanding. Perfect for social media consumption.',
      evidence: createEvidence([
        'Logline is the entire viewing experience',
        'Zero setup required',
        'Universal emotional stakes',
      ]),
    },
    {
      parameterId: 'want_vs_need',
      parameterName: 'want_vs_need',
      displayName: 'Want vs Need',
      score: 86,
      confidence: 0.82,
      category: 'Character',
      rationale: 'Want: professional integrity. Need: emotional justice. The conflict between duty and personal betrayal is clear even in 60 seconds.',
      evidence: createEvidence([
        'Internal conflict externalized visually',
        'Choice reveals character',
      ], [
        'Limited time prevents deeper exploration',
      ]),
    },
    {
      parameterId: 'moral_complexity',
      parameterName: 'moral_complexity',
      displayName: 'Moral Complexity',
      score: 90,
      confidence: 0.88,
      category: 'Theme',
      rationale: 'No right answer. The audience will debate the choice in comments—exactly the engagement driver micro dramas need. Moral ambiguity is the point.',
      evidence: createEvidence([
        'Debate-worthy ending',
        'No easy answers',
        'Empathy for both choices',
      ]),
    },
  ],
  insights: [
    {
      category: 'Strength',
      title: 'Sub-2-Second Hook Mastery',
      description: 'This micro drama demonstrates elite-level hook velocity. The opening frame contains the entire premise, conflict, and emotional stakes without a single word of dialogue.',
      priority: 1,
      actionable: false,
      supportingEvidence: createEvidence(['Hook velocity score: 96/100', 'Scroll-stop power: 95/100']),
    },
    {
      category: 'Strength',
      title: 'Dialogue Economy Excellence',
      description: 'With only 4 words total, this script proves that micro drama can achieve maximum emotional impact through pure visual storytelling.',
      priority: 2,
      actionable: false,
      supportingEvidence: createEvidence(['Dialogue efficiency: 97/100']),
    },
    {
      category: 'Strength',
      title: 'Vertical-Native Thinking',
      description: 'The split-screen moral choice uses 9:16 format brilliantly. This was conceived for mobile, not adapted to it.',
      priority: 3,
      actionable: false,
      supportingEvidence: createEvidence(['Vertical format optimization: 94/100']),
    },
    {
      category: 'Opportunity',
      title: 'Engagement-Optimized Ending',
      description: 'The morally ambiguous choice is precision-engineered for comment section debate. "Who would you save?" drives virality.',
      priority: 4,
      actionable: true,
      supportingEvidence: createEvidence(['Replay value: 89/100', 'Moral complexity: 90/100']),
    },
  ],
  characters: [
    {
      name: 'Dr. Sarah Chen',
      dialogueCount: 1,
      sceneCount: 1,
      firstAppearance: 1,
      description: 'A skilled surgeon forced to make an impossible choice between duty and personal justice',
      arcSummary: 'Professional → Betrayed → Judge',
      relationships: [
        { character: 'Marcus (Husband)', type: 'spouse', description: 'Cheating husband on the operating table' },
        { character: 'The Witness', type: 'conflict', description: 'Stranger who saw the affair' },
      ],
    },
    {
      name: 'Marcus Chen',
      dialogueCount: 0,
      sceneCount: 1,
      firstAppearance: 1,
      description: 'The cheating husband, now helpless and dependent on his wife\'s mercy',
      arcSummary: 'Betrayer → Vulnerable → Victim',
      relationships: [
        { character: 'Dr. Sarah Chen', type: 'spouse', description: 'Wife he betrayed' },
      ],
    },
    {
      name: 'The Witness',
      dialogueCount: 1,
      sceneCount: 1,
      firstAppearance: 1,
      description: 'A stranger who witnessed the affair and now holds the key to Sarah\'s choice',
      arcSummary: 'Bystander → Catalyst → Judge',
      relationships: [
        { character: 'Dr. Sarah Chen', type: 'conflict', description: 'Knows her husband\'s secret' },
      ],
    },
  ],
  scenes: [
    {
      sceneNumber: 1,
      heading: 'INT. OPERATING ROOM - NIGHT',
      location: 'Hospital OR',
      timeOfDay: 'Night',
      intExt: 'INT',
      pageStart: 1,
      pageEnd: 1,
      description: 'Two patients crash simultaneously. Dr. Chen sees her husband on one table, the witness to his affair on the other. Only time to save one.',
      emotionalTone: 'Tense, morally charged, visceral',
    },
  ],
};

export const SAMPLE_MICRO_DRAMA_REPORT: Report = {
  id: 'sample-micro-drama-report-id',
  analysis_run_id: 'sample-micro-drama-run-id',
  script_id: SAMPLE_MICRO_DRAMA_1.id,
  organization_id: 'sample-org-id',
  title: SAMPLE_MICRO_DRAMA_1.title,
  overall_score: SAMPLE_MICRO_DRAMA_REPORT_DATA.overallScore,
  lens_scores: SAMPLE_MICRO_DRAMA_REPORT_DATA.lensScores,
  executive_summary: `"3 Seconds" is a masterclass in micro drama storytelling. With a 1.2-second hook and only 4 words of dialogue, it delivers a complete emotional arc that's perfectly optimized for vertical mobile consumption. The moral dilemma—a surgeon choosing between her cheating husband and the witness to his affair—is immediately graspable and endlessly debatable. This is exactly what TikTok, Reels, and Shorts algorithms reward: instant engagement, sustained tension, and comment-driving ambiguity.`,
  full_report_data: SAMPLE_MICRO_DRAMA_REPORT_DATA,
  pdf_url: null,
  created_at: new Date().toISOString(),
};

// ==========================================
// All Sample Micro Dramas for Gallery
// ==========================================

export const SAMPLE_MICRO_DRAMAS = [
  SAMPLE_MICRO_DRAMA_1,
  SAMPLE_MICRO_DRAMA_2,
  SAMPLE_MICRO_DRAMA_3,
  SAMPLE_MICRO_DRAMA_4,
];
