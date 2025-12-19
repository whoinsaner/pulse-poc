import { ReportData, StakeholderLens, Report } from '@/types/database';
import { SAMPLE_SCRIPT, SAMPLE_SCENES, SAMPLE_CHARACTERS } from './sampleScript';

export const SAMPLE_REPORT_DATA: ReportData = {
  scriptMetadata: {
    title: SAMPLE_SCRIPT.title,
    logline: SAMPLE_SCRIPT.logline,
    genre: SAMPLE_SCRIPT.genre,
    scriptType: SAMPLE_SCRIPT.scriptType,
    pageCount: SAMPLE_SCRIPT.pageCount,
  },
  overallScore: 82.5,
  lensScores: {
    studio_executive: 84.2,
    producer: 78.5,
    actor: 86.3,
    director: 88.1,
    writer: 81.7,
    financier: 75.4,
    ott_platform: 79.8,
    theatrical: 85.6,
  } as Record<StakeholderLens, number>,
  categoryScores: {
    'Concept & Hook': 88,
    'Structure': 82,
    'Character': 85,
    'Conflict': 84,
    'Theme': 79,
    'Dialogue': 81,
    'World & Logic': 86,
    'Emotional Arc': 83,
    'Market': 77,
    'Execution': 80,
  },
  parameterScores: [
    {
      parameterId: 'param-1',
      parameterName: 'high_concept_clarity',
      displayName: 'High Concept Clarity',
      category: 'Concept & Hook',
      score: 92,
      confidence: 0.95,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'The premise of a mysterious alien signal triggering a global crisis is immediately graspable and inherently cinematic. The added layer of government conspiracy elevates it from standard first-contact fare.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 2, Page 2',
          quote: "Proxima Centauri. Four point two light years away.",
          explanation: 'Clear establishment of the extraordinary nature of the discovery'
        }
      ]
    },
    {
      parameterId: 'param-2',
      parameterName: 'opening_hook',
      displayName: 'Opening Hook Strength',
      category: 'Concept & Hook',
      score: 89,
      confidence: 0.92,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Opens with striking visuals and quickly establishes stakes. The Atacama setting is atmospheric and the signal discovery creates immediate intrigue.',
      evidence: [
        {
          type: 'action',
          reference: 'Scene 1, Page 1',
          quote: 'A vast, otherworldly landscape stretches beneath a canopy of stars so dense it seems like spilled milk across black velvet.',
          explanation: 'Evocative opening that sets tone immediately'
        }
      ]
    },
    {
      parameterId: 'param-3',
      parameterName: 'three_act_structure',
      displayName: 'Three-Act Structure',
      category: 'Structure',
      score: 85,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Clear act breaks with "END ACT ONE" marker. The transition from discovery to conspiracy revelation follows classic thriller structure.',
      evidence: [
        {
          type: 'structure',
          reference: 'Page 6',
          explanation: 'Clear act break after prison reveal scene, pivoting from mystery to conspiracy thriller'
        }
      ]
    },
    {
      parameterId: 'param-4',
      parameterName: 'protagonist_goal',
      displayName: 'Protagonist Goal Clarity',
      category: 'Character',
      score: 84,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Elena\'s goal evolves naturally from understanding the signal to uncovering the truth to survival. Each goal is clearly motivated.',
      evidence: [
        {
          type: 'character',
          reference: 'Scene 5',
          quote: 'Start from the beginning.',
          explanation: 'Elena\'s goal shifts to uncovering the conspiracy'
        }
      ]
    },
    {
      parameterId: 'param-5',
      parameterName: 'character_distinctiveness',
      displayName: 'Character Voice Distinctiveness',
      category: 'Character',
      score: 86,
      confidence: 0.89,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Characters have distinct voices: Elena is dry and scientific, Dmitri brings Russian fatalism with humor, James is guilt-ridden and urgent.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 2',
          quote: 'Gospodi pomiluy.',
          explanation: 'Dmitri\'s Russian Orthodox reaction establishes cultural distinctiveness'
        }
      ]
    },
    {
      parameterId: 'param-6',
      parameterName: 'central_conflict',
      displayName: 'Central Conflict Strength',
      category: 'Conflict',
      score: 88,
      confidence: 0.91,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Multi-layered conflict: humanity vs. unknown alien intent, Elena vs. shadow government, truth vs. controlled narrative. Personal stakes through brother relationship.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 5',
          quote: 'They\'re coming, Elena. That\'s what the blueprints are for.',
          explanation: 'Stakes escalate from scientific mystery to existential threat'
        }
      ]
    },
    {
      parameterId: 'param-7',
      parameterName: 'thematic_depth',
      displayName: 'Thematic Depth',
      category: 'Theme',
      score: 79,
      confidence: 0.82,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Themes of truth vs. power, humanity\'s readiness for cosmic contact, and institutional corruption are present but could be more deeply explored.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 5',
          quote: 'They told me it was the most important thing humanity had ever done. They said we were ready.',
          explanation: 'Touches on humanity\'s hubris but doesn\'t fully develop'
        }
      ]
    },
    {
      parameterId: 'param-8',
      parameterName: 'dialogue_subtext',
      displayName: 'Dialogue Subtext',
      category: 'Dialogue',
      score: 81,
      confidence: 0.85,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Strong subtext in sibling scenes - layers of guilt, betrayal, and desperate hope beneath the surface of exposition.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 4',
          quote: 'I told you not to call me.',
          explanation: 'Implies complicated history between siblings in one line'
        }
      ]
    },
    {
      parameterId: 'param-9',
      parameterName: 'world_building',
      displayName: 'World Building Coherence',
      category: 'World & Logic',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Grounded sci-fi world with real locations (ALMA, UN) lending authenticity. The shadow government lore is introduced efficiently.',
      evidence: [
        {
          type: 'action',
          reference: 'Scene 1',
          quote: 'SUPER: "Atacama Large Millimeter Array - 16,500 feet elevation"',
          explanation: 'Real location adds verisimilitude'
        }
      ]
    },
    {
      parameterId: 'param-10',
      parameterName: 'emotional_peaks',
      displayName: 'Emotional Peak Moments',
      category: 'Emotional Arc',
      score: 83,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Strong emotional beats: the wonder of discovery, the shock of revelation, the thrill of the chase, the hope of finding allies.',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 8',
          quote: 'Welcome to the resistance, Dr. Vasquez.',
          explanation: 'Provides emotional relief and hope after intense chase sequence'
        }
      ]
    },
    {
      parameterId: 'param-11',
      parameterName: 'market_positioning',
      displayName: 'Market Positioning',
      category: 'Market',
      score: 77,
      confidence: 0.80,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'High',
      upsideImpact: 'High',
      rationale: 'Positions well against Arrival, Contact, and Interstellar audiences but adds conspiracy thriller elements for broader appeal. VFX requirements are moderate.',
      evidence: [
        {
          type: 'structure',
          reference: 'Overall',
          explanation: 'Balances intellectual sci-fi with action thriller pacing'
        }
      ]
    },
    {
      parameterId: 'param-12',
      parameterName: 'production_feasibility',
      displayName: 'Production Feasibility',
      category: 'Execution',
      score: 80,
      confidence: 0.84,
      maturity: 'Strong',
      riskLevel: 'Medium',
      fixCost: 'High',
      upsideImpact: 'Medium',
      rationale: 'Mix of contained locations (control room, prison, car) with larger set pieces (UN, observatory). VFX primarily for signal visualization. International locations add production complexity.',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 3',
          explanation: 'UN scene requires significant crowd and set design investment'
        }
      ]
    }
  ],
  insights: [
    {
      category: 'Strength',
      title: 'Exceptional High-Concept Premise',
      description: 'The script delivers a immediately graspable hook that combines first contact with conspiracy thriller elements. This dual-genre approach expands audience appeal while maintaining intellectual credibility.',
      priority: 1,
      actionable: false,
      supportingEvidence: [
        {
          type: 'structure',
          reference: 'Overall premise',
          explanation: '"Arrival meets The X-Files" positioning is highly marketable'
        }
      ]
    },
    {
      category: 'Strength',
      title: 'Strong Female Protagonist',
      description: 'Elena Vasquez is a compelling lead - competent, flawed, and active. Her scientific credibility paired with personal vulnerability creates a character audiences will root for.',
      priority: 2,
      actionable: false,
      supportingEvidence: [
        {
          type: 'character',
          reference: 'Elena throughout',
          explanation: 'Drives all major plot developments through her choices'
        }
      ]
    },
    {
      category: 'Opportunity',
      title: 'Deepen Thematic Exploration',
      description: 'The script touches on profound themes (humanity\'s cosmic readiness, institutional corruption, truth vs. power) but could benefit from more deliberate thematic development. Consider adding a scene where Elena explicitly confronts what first contact means for human identity.',
      priority: 1,
      actionable: true,
      supportingEvidence: [
        {
          type: 'dialogue',
          reference: 'Scene 5',
          explanation: 'Conspiracy revelations overshadow philosophical implications'
        }
      ]
    },
    {
      category: 'Opportunity',
      title: 'Strengthen Secondary Characters',
      description: 'Admiral Chen\'s introduction is intriguing but late. Consider establishing her earlier through news reports or Elena\'s research. Dmitri\'s fate after the phone call could raise stakes.',
      priority: 2,
      actionable: true,
      supportingEvidence: [
        {
          type: 'character',
          reference: 'Admiral Chen, Scene 8',
          explanation: 'Major ally appears only at the end of sample pages'
        }
      ]
    },
    {
      category: 'Risk',
      title: 'Exposition Density in Prison Scene',
      description: 'The prison conversation carries heavy exposition load. While James\'s revelations are crucial, consider breaking this information across multiple scenes or using visual flashbacks to maintain pacing.',
      priority: 2,
      actionable: true,
      supportingEvidence: [
        {
          type: 'scene',
          reference: 'Scene 5, Pages 6-8',
          explanation: 'Three pages of dialogue-heavy revelation'
        }
      ]
    },
    {
      category: 'Risk',
      title: 'Car Chase Tonal Shift',
      description: 'The transition from conspiracy dialogue to action chase is abrupt. While exciting, it may benefit from a brief transitional beat to establish Elena\'s emotional state before the pursuit.',
      priority: 3,
      actionable: true,
      supportingEvidence: [
        {
          type: 'structure',
          reference: 'Scenes 6-7',
          explanation: 'Immediate jump from phone call to chase'
        }
      ]
    }
  ],
  characters: SAMPLE_CHARACTERS.map(c => ({
    ...c,
    dialogueCount: c.dialogueCount,
    sceneCount: c.sceneCount
  })),
  scenes: SAMPLE_SCENES,
  narrativeGraph: {
    nodes: [
      { id: 'act1', type: 'act', label: 'Act One: Discovery', metadata: { pages: '1-6' } },
      { id: 'act2', type: 'act', label: 'Act Two: Revelation', metadata: { pages: '6-10' } },
      { id: 'scene1', type: 'scene', label: 'Observatory Night', metadata: { tone: 'mysterious' } },
      { id: 'scene2', type: 'scene', label: 'Signal Discovery', metadata: { tone: 'tense' } },
      { id: 'scene3', type: 'scene', label: 'UN Assembly', metadata: { tone: 'chaotic' } },
      { id: 'scene4', type: 'scene', label: 'Hotel Call', metadata: { tone: 'paranoid' } },
      { id: 'scene5', type: 'scene', label: 'Prison Visit', metadata: { tone: 'revelatory' } },
      { id: 'scene6', type: 'scene', label: 'Car Pursuit', metadata: { tone: 'urgent' } },
      { id: 'scene7', type: 'scene', label: 'Chase', metadata: { tone: 'thrilling' } },
      { id: 'scene8', type: 'scene', label: 'Safe House', metadata: { tone: 'hopeful' } },
      { id: 'beat1', type: 'beat', label: 'Inciting Incident', metadata: { scene: 2 } },
      { id: 'beat2', type: 'beat', label: 'First Turning Point', metadata: { scene: 4 } },
      { id: 'beat3', type: 'beat', label: 'Midpoint Revelation', metadata: { scene: 5 } },
    ],
    edges: [
      { source: 'act1', target: 'act2', type: 'follows' },
      { source: 'scene1', target: 'scene2', type: 'follows' },
      { source: 'scene2', target: 'scene3', type: 'follows' },
      { source: 'scene3', target: 'scene4', type: 'follows' },
      { source: 'scene4', target: 'scene5', type: 'follows' },
      { source: 'scene5', target: 'scene6', type: 'follows' },
      { source: 'scene6', target: 'scene7', type: 'follows' },
      { source: 'scene7', target: 'scene8', type: 'follows' },
      { source: 'beat1', target: 'scene2', type: 'causes' },
      { source: 'beat2', target: 'scene5', type: 'causes' },
      { source: 'scene4', target: 'scene5', type: 'causes' },
    ]
  }
};

export const SAMPLE_REPORT: Report = {
  id: 'sample-report-id',
  analysis_run_id: 'sample-run-id',
  script_id: 'sample-script-id',
  organization_id: 'sample-org-id',
  title: SAMPLE_SCRIPT.title,
  overall_score: 82.5,
  lens_scores: SAMPLE_REPORT_DATA.lensScores,
  executive_summary: `"The Last Signal" is a compelling sci-fi thriller that successfully blends first contact wonder with conspiracy thriller tension. The screenplay demonstrates strong commercial potential with its high-concept premise and active female protagonist.

**Key Strengths:**
- Immediately graspable hook with layered genre appeal
- Well-crafted opening sequence establishing tone and stakes
- Elena Vasquez is a protagonist worth following - competent yet vulnerable

**Areas for Development:**
- Thematic exploration could be deepened beyond plot mechanics
- Prison exposition scene carries heavy information load
- Secondary character development (Admiral Chen, Dmitri) needs earlier establishment

**Commercial Assessment:**
The script positions well for the $80-120M budget range, with moderate VFX requirements and strong casting potential for the lead role. International locations add production value but also complexity.

**Overall Recommendation:**
Recommend development with focus on thematic deepening and exposition pacing. Strong foundation for a tentpole sci-fi thriller.`,
  full_report_data: SAMPLE_REPORT_DATA,
  pdf_url: null,
  created_at: new Date().toISOString(),
};
