import { ReportData, StakeholderLens, Report } from '@/types/database';
import { SAMPLE_COMIC_SCRIPT, SAMPLE_COMIC_SCENES, SAMPLE_COMIC_CHARACTERS } from './sampleComicScript';

export const SAMPLE_COMIC_REPORT_DATA: ReportData = {
  scriptMetadata: {
    title: SAMPLE_COMIC_SCRIPT.title,
    logline: SAMPLE_COMIC_SCRIPT.logline,
    genre: SAMPLE_COMIC_SCRIPT.genre,
    scriptType: SAMPLE_COMIC_SCRIPT.scriptType,
    pageCount: SAMPLE_COMIC_SCRIPT.pageCount,
  },
  overallScore: 85.2,
  lensScores: {
    studio_executive: 82.1,
    producer: 84.5,
    actor: 79.3,
    director: 88.7,
    writer: 86.2,
    financier: 80.4,
    ott_platform: 83.9,
    theatrical: 81.6,
    investor: 78.9,
  } as Record<StakeholderLens, number>,
  categoryScores: {
    // Standard categories
    'Concept & Hook': 89,
    'Structure': 84,
    'Character': 86,
    'Conflict': 87,
    'Theme': 82,
    'Dialogue': 83,
    'World & Logic': 91,
    'Emotional Arc': 80,
    'Market': 84,
    'Execution': 85,
    // Comic-specific categories
    'Comic Visuals': 92,
    'Comic Dialogue': 85,
    'Comic Pacing': 88,
    'Comic Art Direction': 90,
  },
  parameterScores: [
    {
      parameterId: 'comic-1',
      parameterName: 'visual_storytelling',
      displayName: 'Visual Storytelling',
      category: 'Comic Visuals',
      score: 92,
      confidence: 0.94,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'The script demonstrates exceptional visual thinking with varied panel compositions, dynamic action sequences, and atmospheric scene-setting. The splash page opening immediately establishes scope.',
      evidence: [
        {
          type: 'scene',
          reference: 'Page 1, Splash',
          explanation: 'Full page aerial view establishes world with cinematic scope'
        }
      ]
    },
    {
      parameterId: 'comic-2',
      parameterName: 'panel_variety',
      displayName: 'Panel Variety & Flow',
      category: 'Comic Pacing',
      score: 88,
      confidence: 0.91,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Excellent variety in panel sizes and compositions. The script moves from splash pages to tight close-ups to action spreads, maintaining visual interest throughout.',
      evidence: [
        {
          type: 'structure',
          reference: 'Pages 2-4',
          explanation: 'Transitions from wide establishing shots to intimate close-ups to action sequences'
        }
      ]
    },
    {
      parameterId: 'comic-3',
      parameterName: 'art_direction',
      displayName: 'Art Direction Clarity',
      category: 'Comic Art Direction',
      score: 90,
      confidence: 0.92,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Clear visual direction with specific atmospheric notes (neon, rain, steam) and character design elements (cybernetic arm, scarred face, plasma katana).',
      evidence: [
        {
          type: 'action',
          reference: 'Page 2, Panel 2',
          quote: 'Half human, half chrome. His left eye glows with a soft blue—a military-grade optical implant.',
          explanation: 'Specific visual details guide artist interpretation'
        }
      ]
    },
    {
      parameterId: 'comic-4',
      parameterName: 'caption_integration',
      displayName: 'Caption Integration',
      category: 'Comic Dialogue',
      score: 85,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Captions are used effectively for internal monologue and world-building without over-explaining the visuals. The noir-style narration fits the cyberpunk aesthetic.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Page 2',
          quote: 'I used to protect the powerful. Now I protect the forgotten.',
          explanation: 'Economic caption establishes character without redundant visuals'
        }
      ]
    },
    {
      parameterId: 'comic-5',
      parameterName: 'world_building_visual',
      displayName: 'Visual World-Building',
      category: 'World & Logic',
      score: 91,
      confidence: 0.93,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'The cyberpunk Neo-Tokyo setting is vividly described with specific details that translate directly to visual storytelling—mega-structures, holographic ads, flying vehicles.',
      evidence: [
        {
          type: 'scene',
          reference: 'Page 1',
          quote: 'Towering mega-structures pierce neon-drenched clouds. Holographic advertisements flicker between buildings.',
          explanation: 'Detailed environment descriptions provide clear visual direction'
        }
      ]
    },
    {
      parameterId: 'comic-6',
      parameterName: 'character_design',
      displayName: 'Character Design Potential',
      category: 'Character',
      score: 88,
      confidence: 0.90,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Kenji is visually distinctive with clear design elements (cybernetic arm, glowing eye, plasma katana, tattered coat). Strong visual contrast between characters.',
      evidence: [
        {
          type: 'character',
          reference: 'Kenji description',
          explanation: 'Iconic visual elements that will translate to memorable comic book imagery'
        }
      ]
    },
    {
      parameterId: 'comic-7',
      parameterName: 'action_choreography',
      displayName: 'Action Choreography',
      category: 'Conflict',
      score: 87,
      confidence: 0.89,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Action sequences are broken down into clear visual beats. The fight scene moves from tension to explosion to aftermath efficiently.',
      evidence: [
        {
          type: 'action',
          reference: 'Page 3, Panel 5',
          quote: 'Kenji EXPLODES into motion. The katana ignites—a blade of pure plasma energy.',
          explanation: 'Dynamic action direction with specific visual effects'
        }
      ]
    },
    {
      parameterId: 'comic-8',
      parameterName: 'high_concept',
      displayName: 'High Concept Clarity',
      category: 'Concept & Hook',
      score: 89,
      confidence: 0.92,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: '"Lone Wolf and Cub meets Ghost in the Shell" is instantly graspable. The samurai/cyberpunk fusion is visually striking and commercially viable.',
      evidence: [
        {
          type: 'structure',
          reference: 'Overall premise',
          explanation: 'Clear genre fusion with established audience appeal'
        }
      ]
    },
    {
      parameterId: 'comic-9',
      parameterName: 'pacing_density',
      displayName: 'Page Pacing Density',
      category: 'Comic Pacing',
      score: 86,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Good balance between dense storytelling pages and breathing room. The splash page opening allows the world to sink in before plot kicks in.',
      evidence: [
        {
          type: 'structure',
          reference: 'Pages 1-6',
          explanation: 'Alternates between action-dense and atmosphere-focused pages'
        }
      ]
    },
    {
      parameterId: 'comic-10',
      parameterName: 'dialogue_economy',
      displayName: 'Dialogue Economy',
      category: 'Comic Dialogue',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Dialogue is concise and character-specific. No balloon is wasted. Each line either advances plot or reveals character.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Page 4',
          quote: 'They said you were dead.',
          explanation: 'Three words establish mystery and history efficiently'
        }
      ]
    },
    {
      parameterId: 'comic-11',
      parameterName: 'cliffhanger_structure',
      displayName: 'Issue Structure & Hooks',
      category: 'Structure',
      score: 85,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Strong page-turn hooks and issue cliffhanger. The face in the tower is an effective visual tease for the larger threat.',
      evidence: [
        {
          type: 'scene',
          reference: 'Page 6, final panel',
          quote: 'For just a moment, a FACE seems to form in its patterns—watching.',
          explanation: 'Ominous visual hook promises larger conflict ahead'
        }
      ]
    },
    {
      parameterId: 'comic-12',
      parameterName: 'market_fit',
      displayName: 'Comic Market Positioning',
      category: 'Market',
      score: 84,
      confidence: 0.85,
      maturity: 'Strong',
      riskLevel: 'Medium',
      fixCost: 'High',
      upsideImpact: 'High',
      rationale: 'Fits well in the cyberpunk/sci-fi comics market alongside titles like Tokyo Ghost and Blade Runner comics. Strong media adaptation potential.',
      evidence: [
        {
          type: 'structure',
          reference: 'Overall',
          explanation: 'Visual style and themes align with successful properties in the space'
        }
      ]
    }
  ],
  insights: [
    {
      category: 'Strength',
      title: 'Exceptional Visual Storytelling',
      description: 'The script demonstrates mastery of the comic medium with varied panel compositions, clear action choreography, and atmospheric world-building that translates directly to compelling visuals.',
      priority: 1,
      actionable: false,
      supportingEvidence: [
        {
          type: 'structure',
          reference: 'Throughout',
          explanation: 'Every page demonstrates visual thinking with specific panel compositions'
        }
      ]
    },
    {
      category: 'Strength',
      title: 'Iconic Character Design',
      description: 'Kenji is immediately visually distinctive with the cybernetic arm, glowing eye, and plasma katana. This iconography will translate to memorable covers and merchandise potential.',
      priority: 2,
      actionable: false,
      supportingEvidence: [
        {
          type: 'character',
          reference: 'Kenji visual description',
          explanation: 'Clear, specific visual elements that define the character'
        }
      ]
    },
    {
      category: 'Strength',
      title: 'Strong Genre Fusion',
      description: 'The samurai/cyberpunk combination offers fresh visual possibilities while tapping into proven audience interests. "Lone Wolf and Cub meets Ghost in the Shell" is instantly pitchable.',
      priority: 3,
      actionable: false,
      supportingEvidence: [
        {
          type: 'structure',
          reference: 'Overall premise',
          explanation: 'Genre elements blend seamlessly in the visual language'
        }
      ]
    },
    {
      category: 'Opportunity',
      title: 'Expand Environmental Variety',
      description: 'The first six pages are predominantly exterior night scenes. Consider adding visual variety with daytime sequences or more diverse interior environments in subsequent pages.',
      priority: 1,
      actionable: true,
      supportingEvidence: [
        {
          type: 'scene',
          reference: 'Pages 1-6',
          explanation: 'All night scenes with similar neon-noir aesthetic'
        }
      ]
    },
    {
      category: 'Opportunity',
      title: 'Develop Supporting Cast Visually',
      description: 'While Kenji and Yuki are visually distinct, the corporate soldiers are generic. Consider giving recurring antagonists memorable visual hooks.',
      priority: 2,
      actionable: true,
      supportingEvidence: [
        {
          type: 'character',
          reference: 'Corporate soldiers',
          explanation: 'Described only as "corporate security gear"'
        }
      ]
    },
    {
      category: 'Risk',
      title: 'Panel Density on Action Pages',
      description: 'Page 3 contains 5 panels including an action burst that wants to be a spread. Consider giving major action moments more visual room to breathe.',
      priority: 2,
      actionable: true,
      supportingEvidence: [
        {
          type: 'structure',
          reference: 'Page 3',
          explanation: 'Action climax compressed into one page'
        }
      ]
    }
  ],
  characters: SAMPLE_COMIC_CHARACTERS.map(c => ({
    ...c,
    dialogueCount: c.dialogueCount,
    sceneCount: c.sceneCount
  })),
  scenes: SAMPLE_COMIC_SCENES,
  narrativeGraph: {
    nodes: [
      { id: 'page1', type: 'scene', label: 'Splash: World Establish', metadata: { panelType: 'splash', tone: 'awe' } },
      { id: 'page2', type: 'scene', label: 'Alley: Kenji Intro', metadata: { panelCount: 4, tone: 'noir' } },
      { id: 'page3', type: 'scene', label: 'Confrontation', metadata: { panelCount: 5, tone: 'tense' } },
      { id: 'page4', type: 'scene', label: 'Meeting Yuki', metadata: { panelCount: 5, tone: 'mysterious' } },
      { id: 'page5', type: 'scene', label: 'Rooftop Escape', metadata: { panelCount: 5, tone: 'urgent' } },
      { id: 'page6', type: 'scene', label: 'Safehouse', metadata: { panelCount: 6, tone: 'reflective' } },
      { id: 'beat1', type: 'beat', label: 'Hook: First Action', metadata: { page: 3 } },
      { id: 'beat2', type: 'beat', label: 'Revelation: The Cube', metadata: { page: 5 } },
      { id: 'beat3', type: 'beat', label: 'Cliffhanger: The Face', metadata: { page: 6 } },
    ],
    edges: [
      { source: 'page1', target: 'page2', type: 'follows' },
      { source: 'page2', target: 'page3', type: 'follows' },
      { source: 'page3', target: 'page4', type: 'follows' },
      { source: 'page4', target: 'page5', type: 'follows' },
      { source: 'page5', target: 'page6', type: 'follows' },
      { source: 'beat1', target: 'page3', type: 'causes' },
      { source: 'beat2', target: 'page5', type: 'causes' },
      { source: 'beat3', target: 'page6', type: 'causes' },
    ]
  }
};

export const SAMPLE_COMIC_REPORT: Report = {
  id: 'sample-comic-report-id',
  analysis_run_id: 'sample-comic-run-id',
  script_id: 'sample-comic-script-id',
  organization_id: 'sample-org-id',
  title: SAMPLE_COMIC_SCRIPT.title,
  overall_score: 85.2,
  lens_scores: SAMPLE_COMIC_REPORT_DATA.lensScores,
  executive_summary: `"Neon Ronin" is a visually striking cyberpunk comic that masterfully blends samurai mythology with futuristic world-building. The script demonstrates exceptional understanding of the comic medium with varied panel compositions and clear art direction.

**Key Strengths:**
- Exceptional visual storytelling with cinematic panel compositions
- Iconic protagonist design with strong merchandise and adaptation potential
- Fresh genre fusion of samurai honor codes with cyberpunk aesthetics

**Areas for Development:**
- Environmental variety could be expanded beyond night scenes
- Supporting antagonists need more distinctive visual hooks
- Some action pages are densely paneled—consider giving key moments more room

**Visual Direction Notes:**
The neon-noir aesthetic is clearly defined throughout. Art direction calls for high contrast lighting, detailed cybernetic designs, and dynamic action choreography. Reference points: Blade Runner, Ghost in the Shell, Lone Wolf and Cub.

**Commercial Assessment:**
Strong positioning for both direct market and digital platforms. High adaptation potential for animation or live-action. The "Lone Wolf and Cub meets Ghost in the Shell" pitch is instantly graspable.

**Investment Outlook:**
Content IP with multiple revenue streams: single issues, collected editions, digital subscriptions, and media adaptation rights. The cyberpunk genre maintains consistent market interest with proven international appeal.

**Overall Recommendation:**
Highly recommend for development. This is a visually compelling, commercially viable project with strong creative fundamentals. Analysis powered by 10-agent UASF scoring system.`,
  full_report_data: SAMPLE_COMIC_REPORT_DATA,
  pdf_url: null,
  created_at: new Date().toISOString(),
};
