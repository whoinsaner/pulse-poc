import { ReportData, StakeholderLens, Report } from '@/types/database';

// Sample web series script metadata
export const SAMPLE_WEB_SERIES_SCRIPT = {
  title: 'The Algorithm',
  logline: 'A content creator discovers the platform algorithm is predicting real-world deaths, and she might be next.',
  genre: 'Sci-Fi Thriller',
  scriptType: 'web_series' as const,
  episodeLengthClass: 'mid_form_web' as const,
  pageCount: 18,
};

export const SAMPLE_WEB_SERIES_REPORT_DATA: ReportData = {
  scriptMetadata: {
    title: SAMPLE_WEB_SERIES_SCRIPT.title,
    logline: SAMPLE_WEB_SERIES_SCRIPT.logline,
    genre: SAMPLE_WEB_SERIES_SCRIPT.genre,
    scriptType: SAMPLE_WEB_SERIES_SCRIPT.scriptType,
    pageCount: SAMPLE_WEB_SERIES_SCRIPT.pageCount,
  },
  overallScore: 84.2,
  lensScores: {
    studio_executive: 79.5,
    producer: 82.1,
    actor: 85.3,
    director: 86.7,
    writer: 88.2,
    financier: 76.8,
    investor: 81.4,
    ott_platform: 91.2,
    theatrical: 68.4,
  } as Record<StakeholderLens, number>,
  categoryScores: {
    'Concept & Hook': 92,
    'Structure': 85,
    'Character': 83,
    'Conflict': 88,
    'Theme': 81,
    'Dialogue': 79,
    'World & Logic': 84,
    'Emotional Arc': 80,
    'Market': 86,
    'Execution': 82,
    'Web Series': 89,
  },
  parameterScores: [
    // Web Series Parameters
    {
      parameterId: 'param-web-1',
      parameterName: 'hook_efficiency',
      displayName: 'Hook Efficiency',
      category: 'Web Series',
      score: 94,
      confidence: 0.95,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Cold open delivers mystery hook within first 30 seconds with the @PredictorX notification.',
      evidence: [
        { type: 'scene', reference: 'Cold Open', quote: 'Notification from @PredictorX - "You have 72 hours."', explanation: 'Hook lands before 30-second mark' }
      ]
    },
    {
      parameterId: 'param-web-2',
      parameterName: 'scroll_stop_potential',
      displayName: 'Scroll-Stop Potential',
      category: 'Web Series',
      score: 91,
      confidence: 0.93,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Opening frame with ring light and influencer setup is visually striking.',
      evidence: [
        { type: 'scene', reference: 'Opening shot', explanation: 'Ring light harsh shadows + notification = strong thumbnail potential' }
      ]
    },
    {
      parameterId: 'param-web-3',
      parameterName: 'retention_curve_design',
      displayName: 'Retention Curve Design',
      category: 'Web Series',
      score: 88,
      confidence: 0.90,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Strong attention reset at mid-point with Devon\'s revelation.',
      evidence: [
        { type: 'structure', reference: 'Mid-episode & End', explanation: 'Retention peaks at Devon reveal and cliffhanger' }
      ]
    },
    {
      parameterId: 'param-web-4',
      parameterName: 'episodic_momentum',
      displayName: 'Episodic Momentum',
      category: 'Web Series',
      score: 92,
      confidence: 0.94,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Each scene escalates stakes with countdown timer.',
      evidence: [
        { type: 'structure', reference: 'Throughout', explanation: 'Countdown timer creates episodic urgency' }
      ]
    },
    {
      parameterId: 'param-web-5',
      parameterName: 'binge_trigger_density',
      displayName: 'Binge Trigger Density',
      category: 'Web Series',
      score: 90,
      confidence: 0.92,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Multiple open loops ensure viewers continue to next episode.',
      evidence: [
        { type: 'structure', reference: 'Episode structure', explanation: '4+ open questions trigger next episode' }
      ]
    },
    {
      parameterId: 'param-web-6',
      parameterName: 'algorithmic_compatibility',
      displayName: 'Algorithmic Compatibility',
      category: 'Web Series',
      score: 93,
      confidence: 0.95,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Thriller genre performs well on digital platforms.',
      evidence: [
        { type: 'market', reference: 'Format analysis', explanation: 'Genre, length, and structure align with platform preferences' }
      ]
    },
    {
      parameterId: 'param-concept-1',
      parameterName: 'hook_clarity',
      displayName: 'Hook Clarity',
      category: 'Concept & Hook',
      score: 95,
      confidence: 0.97,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Crystal clear 10-second pitch: algorithm predicting deaths.',
      evidence: [
        { type: 'structure', reference: 'Logline', explanation: 'High-concept premise immediately graspable' }
      ]
    },
    {
      parameterId: 'param-theme-1',
      parameterName: 'tone_genre_cohesion',
      displayName: 'Tone & Genre Cohesion',
      category: 'Theme',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'The script effectively maintains its tech-thriller tone throughout, balancing paranoid tension with the meta-commentary on algorithm culture. Genre promises are fulfilled.',
      evidence: [
        { type: 'structure', reference: 'Throughout', explanation: 'Consistent thriller tension with modern tech-horror undertones' }
      ]
    },
  ],
  insights: [
    {
      category: 'Strength',
      title: 'Platform-Native Premise',
      description: 'The meta-narrative of an algorithm thriller on algorithm-driven platforms creates unique marketing synergy.',
      priority: 1,
      actionable: false,
      supportingEvidence: [
        { type: 'market', reference: 'Genre fit', explanation: 'Self-aware premise appeals to digital-native audience' }
      ],
    },
    {
      category: 'Strength',
      title: 'Optimal Hook Placement',
      description: 'Mystery hook lands in first 30 seconds with clear stakes (death countdown).',
      priority: 2,
      actionable: false,
      supportingEvidence: [
        { type: 'structure', reference: 'Cold Open', explanation: 'Sub-30-second hook maximizes watch-through' }
      ],
    },
    {
      category: 'Opportunity',
      title: 'Amplify Meme/Viral Moments',
      description: 'Episode could benefit from additional shareable moments.',
      priority: 1,
      actionable: true,
      supportingEvidence: [
        { type: 'market', reference: 'Social sharing', explanation: 'More clip-worthy moments increase organic reach' }
      ],
    },
    {
      category: 'Risk',
      title: 'Devon Exposition Load',
      description: 'Devon\'s algorithm explanation scene carries heavy exposition.',
      priority: 1,
      actionable: true,
      supportingEvidence: [
        { type: 'structure', reference: 'Act Two', explanation: 'Info-dump = retention risk' }
      ],
    },
  ],
  characters: [
    {
      name: 'Maya Chen',
      description: 'Lifestyle influencer with 2.3M followers.',
      dialogueCount: 24,
      sceneCount: 6,
      firstAppearance: 1,
      arcSummary: 'From content creator to conspiracy investigator.',
      relationships: [
        { character: 'Harper', type: 'roommate', description: 'Trusted confidant' },
        { character: 'Devon Park', type: 'informant', description: 'Reluctant source' },
      ]
    },
    {
      name: 'Harper',
      description: 'Film student, Maya\'s roommate.',
      dialogueCount: 8,
      sceneCount: 2,
      firstAppearance: 3,
      arcSummary: 'Skeptic who becomes believer.',
      relationships: [
        { character: 'Maya Chen', type: 'roommate', description: 'Protective friend' },
      ]
    },
    {
      name: 'Devon Park',
      description: 'Ex-platform engineer.',
      dialogueCount: 12,
      sceneCount: 1,
      firstAppearance: 4,
      arcSummary: 'Whistleblower torn between guilt and self-preservation.',
      relationships: [
        { character: 'Maya Chen', type: 'informant', description: 'Reluctant helper' },
      ]
    },
  ],
  scenes: [
    { heading: 'INT. MAYA\'S APARTMENT - STREAMING SETUP - NIGHT', sceneNumber: 1, pageStart: 1, pageEnd: 2, location: 'Maya\'s Apartment', timeOfDay: 'Night', emotionalTone: 'Tense' },
    { heading: 'INT. MAYA\'S APARTMENT - CONTINUOUS', sceneNumber: 2, pageStart: 3, pageEnd: 6, location: 'Maya\'s Apartment', timeOfDay: 'Night', emotionalTone: 'Anxious' },
    { heading: 'INT. COFFEE SHOP - DAY', sceneNumber: 3, pageStart: 7, pageEnd: 12, location: 'Coffee Shop', timeOfDay: 'Day', emotionalTone: 'Paranoid' },
    { heading: 'EXT. STREET - NIGHT', sceneNumber: 4, pageStart: 13, pageEnd: 14, location: 'City Street', timeOfDay: 'Night', emotionalTone: 'Threatening' },
  ],
  narrativeGraph: {
    nodes: [
      { id: 'cold-open', type: 'scene', label: 'Cold Open - Notification', metadata: { scene: 1 } },
      { id: 'investigation', type: 'scene', label: 'Investigation Begins', metadata: { scene: 2 } },
      { id: 'devon-reveal', type: 'scene', label: 'Devon\'s Revelation', metadata: { scene: 3 } },
      { id: 'cliffhanger', type: 'scene', label: 'Cliffhanger Ending', metadata: { scene: 4 } },
    ],
    edges: [
      { source: 'cold-open', target: 'investigation', type: 'follows' },
      { source: 'investigation', target: 'devon-reveal', type: 'follows' },
      { source: 'devon-reveal', target: 'cliffhanger', type: 'follows' },
    ]
  },
};

export const SAMPLE_WEB_SERIES_REPORT: Report = {
  id: 'sample-webseries-report-id',
  analysis_run_id: 'sample-webseries-run-id',
  script_id: 'sample-webseries-script-id',
  organization_id: 'sample-org-id',
  title: SAMPLE_WEB_SERIES_SCRIPT.title,
  overall_score: 84.2,
  lens_scores: SAMPLE_WEB_SERIES_REPORT_DATA.lensScores,
  executive_summary: `"The Algorithm" is a sharp, platform-native web series. Hook Efficiency: 94/100. Binge Trigger Density: 90/100. Strong cliffhanger architecture. Episode Length Class: Mid-Form. Investment Readiness: 82/100.`,
  full_report_data: SAMPLE_WEB_SERIES_REPORT_DATA,
  pdf_url: null,
  created_at: new Date().toISOString(),
};
