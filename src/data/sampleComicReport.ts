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
    // Comic-specific categories (New Framework)
    'Comic Visuals': 90,
    'Comic Dialogue': 86,
    'Comic Pacing': 86,
    'Comic Collaboration': 88,
    'Comic Characters': 89,
    'Comic Production': 86,
    'Comic Market': 84,
    'Comic Structure': 86,
  },
  parameterScores: [
    // ============= CONCEPT AGENT (6 parameters) =============
    {
      parameterId: 'concept-1',
      parameterName: 'concept_originality',
      displayName: 'Concept Originality',
      category: 'Concept & Hook',
      score: 88,
      confidence: 0.91,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'High',
      upsideImpact: 'High',
      rationale: 'The samurai/cyberpunk fusion with a child protector angle offers fresh territory. While cyberpunk is well-trodden, the ronin code applied to corporate dystopia feels distinctive.',
      evidence: [{ type: 'structure', reference: 'Overall premise', explanation: 'Unique blend of genres with fresh thematic angle' }]
    },
    {
      parameterId: 'concept-2',
      parameterName: 'familiarity_anchor',
      displayName: 'Familiarity Anchor',
      category: 'Concept & Hook',
      score: 91,
      confidence: 0.93,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: '"Lone Wolf and Cub meets Ghost in the Shell" provides instant recognition. Audiences know what they are getting while the execution feels fresh.',
      evidence: [{ type: 'structure', reference: 'Pitch comparison', explanation: 'Strong comparable positioning anchors audience expectations' }]
    },
    {
      parameterId: 'concept-3',
      parameterName: 'hook_clarity',
      displayName: 'Hook Clarity',
      category: 'Concept & Hook',
      score: 90,
      confidence: 0.92,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'The hook is immediate: disgraced samurai protects mysterious child in neon dystopia. Every visual element reinforces this core concept.',
      evidence: [{ type: 'scene', reference: 'Page 1-4', explanation: 'Setup efficiently communicates premise through visuals' }]
    },
    {
      parameterId: 'concept-4',
      parameterName: 'concept_compressibility',
      displayName: 'Concept Compressibility',
      category: 'Concept & Hook',
      score: 89,
      confidence: 0.90,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'One-sentence pitch works perfectly: "A disgraced cyber-samurai protects a child who holds the key to a corporate conspiracy." Easy to convey in marketing materials.',
      evidence: [{ type: 'structure', reference: 'Logline', explanation: 'Compresses to single sentence without losing essence' }]
    },
    {
      parameterId: 'concept-5',
      parameterName: 'concept_scalability',
      displayName: 'Concept Scalability',
      category: 'Concept & Hook',
      score: 87,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'The world allows for expansion: other ronin, corporate factions, historical flashbacks. Strong ongoing series potential.',
      evidence: [{ type: 'structure', reference: 'World elements', explanation: 'Multiple threads available for series expansion' }]
    },
    {
      parameterId: 'concept-6',
      parameterName: 'franchise_expandability',
      displayName: 'Franchise Expandability',
      category: 'Concept & Hook',
      score: 88,
      confidence: 0.89,
      maturity: 'Strong',
      riskLevel: 'Medium',
      fixCost: 'High',
      upsideImpact: 'High',
      rationale: 'Strong IP potential: animation, games, merchandise. The visual iconography translates across media. Character designs are toyetic.',
      evidence: [{ type: 'structure', reference: 'Overall', explanation: 'Multiple exploitation windows for IP development' }]
    },

    // ============= STRUCTURE AGENT (6 parameters) =============
    {
      parameterId: 'structure-1',
      parameterName: 'inciting_force_clarity',
      displayName: 'Inciting Force Clarity',
      category: 'Structure',
      score: 85,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'The inciting incident—Yuki appearing with the cube—is visually clear and immediately raises stakes. Kenji\'s choice to protect her launches the narrative.',
      evidence: [{ type: 'scene', reference: 'Pages 3-4', explanation: 'Clear break from Kenji\'s status quo' }]
    },
    {
      parameterId: 'structure-2',
      parameterName: 'escalation_logic',
      displayName: 'Escalation Logic',
      category: 'Structure',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Stakes escalate from street-level violence to corporate conspiracy to the mysterious face in the tower. Each page raises questions.',
      evidence: [{ type: 'structure', reference: 'Pages 1-6', explanation: 'Progressive revelation of larger threat' }]
    },
    {
      parameterId: 'structure-3',
      parameterName: 'climax_positioning',
      displayName: 'Climax Positioning',
      category: 'Structure',
      score: 83,
      confidence: 0.85,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'For issue #1, the action climax on page 3 and the revelation climax on page 6 are well-positioned. Sets up larger arc climax.',
      evidence: [{ type: 'structure', reference: 'Issue structure', explanation: 'Dual climax structure serves single-issue format' }]
    },
    {
      parameterId: 'structure-4',
      parameterName: 'setup_payoff_density',
      displayName: 'Setup/Payoff Density',
      category: 'Structure',
      score: 82,
      confidence: 0.84,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Issue #1 is mostly setup, which is appropriate. The cube and the face in the tower promise significant payoffs in future issues.',
      evidence: [{ type: 'structure', reference: 'Pages 5-6', explanation: 'Multiple setups planted for future resolution' }]
    },
    {
      parameterId: 'structure-5',
      parameterName: 'scene_necessity',
      displayName: 'Scene Necessity',
      category: 'Structure',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Every page serves multiple purposes: world-building, character, and plot. No page could be removed without losing something essential.',
      evidence: [{ type: 'structure', reference: 'All pages', explanation: 'Each page carries narrative weight' }]
    },
    {
      parameterId: 'structure-6',
      parameterName: 'pacing_rhythm',
      displayName: 'Pacing Rhythm',
      category: 'Structure',
      score: 85,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Strong ebb and flow: splash establishes calm, then tension builds to action burst, quiets for mystery, ends on ominous note.',
      evidence: [{ type: 'structure', reference: 'Issue flow', explanation: 'Intentional rhythm variation maintains engagement' }]
    },

    // ============= CHARACTER AGENT (6 parameters) =============
    {
      parameterId: 'character-1',
      parameterName: 'agency_level',
      displayName: 'Agency Level',
      category: 'Character',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Kenji makes active choices throughout: choosing to protect Yuki, choosing to fight, choosing the safehouse. He drives the action.',
      evidence: [{ type: 'character', reference: 'Kenji actions', explanation: 'Protagonist initiates rather than reacts' }]
    },
    {
      parameterId: 'character-2',
      parameterName: 'want_vs_need',
      displayName: 'Want vs Need',
      category: 'Character',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Kenji wants anonymity and peace; he needs purpose and redemption. Protecting Yuki forces him to confront his past.',
      evidence: [{ type: 'character', reference: 'Kenji arc', explanation: 'Clear internal conflict between desire and growth' }]
    },
    {
      parameterId: 'character-3',
      parameterName: 'flaw_centrality',
      displayName: 'Flaw Centrality',
      category: 'Character',
      score: 85,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Kenji\'s disillusionment and survivor\'s guilt are central to his character. His arc will require confronting these flaws.',
      evidence: [{ type: 'character', reference: 'Kenji backstory', explanation: 'Flaw connects to thematic concerns' }]
    },
    {
      parameterId: 'character-4',
      parameterName: 'arc_transformation',
      displayName: 'Arc Transformation Potential',
      category: 'Character',
      score: 87,
      confidence: 0.89,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Clear arc potential: from isolated ronin to committed protector. The series structure allows for gradual, earned transformation.',
      evidence: [{ type: 'character', reference: 'Kenji setup', explanation: 'Issue #1 establishes starting point for transformation' }]
    },
    {
      parameterId: 'character-5',
      parameterName: 'voice_distinction',
      displayName: 'Voice Distinction',
      category: 'Character',
      score: 88,
      confidence: 0.90,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Kenji\'s terse, weary voice contrasts sharply with Yuki\'s hopeful innocence. Corporate thugs speak differently from our leads.',
      evidence: [{ type: 'dialogue', reference: 'Character voices', explanation: 'Each character has distinctive speech patterns' }]
    },
    {
      parameterId: 'character-6',
      parameterName: 'empathy_calibration',
      displayName: 'Empathy Calibration',
      category: 'Character',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Kenji\'s protection of Yuki immediately generates sympathy. His weariness is relatable; his skills are admirable.',
      evidence: [{ type: 'character', reference: 'Kenji introduction', explanation: 'Save the cat moment with deeper resonance' }]
    },

    // ============= CONFLICT AGENT (5 parameters) =============
    {
      parameterId: 'conflict-1',
      parameterName: 'central_conflict_clarity',
      displayName: 'Central Conflict Clarity',
      category: 'Conflict',
      score: 88,
      confidence: 0.90,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Clear central conflict: protect Yuki and her secret from powerful corporate forces. The face in the tower promises even larger antagonist.',
      evidence: [{ type: 'structure', reference: 'Plot setup', explanation: 'Conflict is visually and narratively clear' }]
    },
    {
      parameterId: 'conflict-2',
      parameterName: 'stakes_escalation',
      displayName: 'Stakes Escalation',
      category: 'Conflict',
      score: 87,
      confidence: 0.89,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Stakes escalate from personal survival to corporate conspiracy to something potentially supernatural. Strong escalation trajectory.',
      evidence: [{ type: 'structure', reference: 'Pages 4-6', explanation: 'Each revelation raises stakes' }]
    },
    {
      parameterId: 'conflict-3',
      parameterName: 'opposition_quality',
      displayName: 'Opposition Quality',
      category: 'Conflict',
      score: 85,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Issue #1 opposition is generic corporate soldiers, but the face in the tower promises a more formidable antagonist.',
      evidence: [{ type: 'character', reference: 'Antagonists', explanation: 'Street-level opposition sets up greater threat' }]
    },
    {
      parameterId: 'conflict-4',
      parameterName: 'conflict_variety',
      displayName: 'Conflict Variety',
      category: 'Conflict',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Multiple conflict types: physical (fight), interpersonal (trust with Yuki), internal (Kenji\'s past), mystery (the cube).',
      evidence: [{ type: 'structure', reference: 'Issue #1', explanation: 'Layered conflicts across different dimensions' }]
    },
    {
      parameterId: 'conflict-5',
      parameterName: 'resolution_satisfaction',
      displayName: 'Resolution Satisfaction',
      category: 'Conflict',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Issue #1 appropriately resolves immediate threat while opening larger questions. Satisfying for single issue while driving series.',
      evidence: [{ type: 'structure', reference: 'Issue ending', explanation: 'Balanced resolution and continuation' }]
    },

    // ============= THEME AGENT (4 parameters) =============
    {
      parameterId: 'theme-1',
      parameterName: 'thematic_clarity',
      displayName: 'Thematic Clarity',
      category: 'Theme',
      score: 83,
      confidence: 0.85,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Core themes emerge clearly: redemption through protection of innocence, honor in a dishonorable world, humanity vs. technology.',
      evidence: [{ type: 'structure', reference: 'Overall', explanation: 'Thematic concerns woven through visuals and action' }]
    },
    {
      parameterId: 'theme-2',
      parameterName: 'moral_complexity',
      displayName: 'Moral Complexity',
      category: 'Theme',
      score: 81,
      confidence: 0.83,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Issue #1 presents fairly clear moral lines. Kenji\'s past suggests moral ambiguity that can deepen over the series.',
      evidence: [{ type: 'character', reference: 'Kenji backstory', explanation: 'Hints at morally complex history' }]
    },
    {
      parameterId: 'theme-3',
      parameterName: 'subtext_density',
      displayName: 'Subtext Density',
      category: 'Theme',
      score: 82,
      confidence: 0.84,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Visual storytelling carries subtext: the contrast between human Kenji and his chrome parts, the child\'s light in the dark city.',
      evidence: [{ type: 'scene', reference: 'Visual contrasts', explanation: 'Imagery conveys meaning beyond literal content' }]
    },
    {
      parameterId: 'theme-4',
      parameterName: 'thematic_integration',
      displayName: 'Thematic Integration',
      category: 'Theme',
      score: 82,
      confidence: 0.84,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Theme emerges organically from character choices and world design rather than being stated explicitly.',
      evidence: [{ type: 'structure', reference: 'Throughout', explanation: 'Show-don\'t-tell approach to thematic content' }]
    },

    // ============= DIALOGUE AGENT (5 parameters) =============
    {
      parameterId: 'dialogue-1',
      parameterName: 'voice_authenticity',
      displayName: 'Voice Authenticity',
      category: 'Dialogue',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Kenji\'s terse noir voice feels authentic to the genre and character. The weary wisdom comes through in few words.',
      evidence: [{ type: 'dialogue', reference: 'Kenji lines', explanation: 'Consistent voice that fits character and world' }]
    },
    {
      parameterId: 'dialogue-2',
      parameterName: 'subtext_ratio',
      displayName: 'Subtext Ratio',
      category: 'Dialogue',
      score: 83,
      confidence: 0.85,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Dialogue carries subtext effectively: "They said you were dead" implies rich history. Characters speak around topics.',
      evidence: [{ type: 'dialogue', reference: 'Page 4', explanation: 'Lines convey more than literal meaning' }]
    },
    {
      parameterId: 'dialogue-3',
      parameterName: 'exposition_economy',
      displayName: 'Exposition Economy',
      category: 'Dialogue',
      score: 85,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'The comic format demands visual exposition. Dialogue provides only what visuals cannot, maintaining economy.',
      evidence: [{ type: 'structure', reference: 'Caption usage', explanation: 'Minimal dialogue lets art carry weight' }]
    },
    {
      parameterId: 'dialogue-4',
      parameterName: 'conflict_in_dialogue',
      displayName: 'Conflict in Dialogue',
      category: 'Dialogue',
      score: 82,
      confidence: 0.84,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Exchanges carry tension even in quiet moments. The trust negotiation between Kenji and Yuki has underlying conflict.',
      evidence: [{ type: 'dialogue', reference: 'Pages 4-5', explanation: 'Dialogue drives interpersonal conflict' }]
    },
    {
      parameterId: 'dialogue-5',
      parameterName: 'quotability',
      displayName: 'Quotability',
      category: 'Dialogue',
      score: 83,
      confidence: 0.85,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: '"I used to protect the powerful. Now I protect the forgotten." This line encapsulates character and theme memorably.',
      evidence: [{ type: 'dialogue', reference: 'Page 2 caption', explanation: 'Memorable line suitable for marketing' }]
    },

    // ============= WORLD & LOGIC AGENT (4 parameters) =============
    {
      parameterId: 'world-1',
      parameterName: 'world_coherence',
      displayName: 'World Coherence',
      category: 'World & Logic',
      score: 92,
      confidence: 0.94,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'The cyberpunk Neo-Tokyo is fully realized with consistent visual language: neon, rain, mega-structures, cybernetics, corporate domination.',
      evidence: [{ type: 'scene', reference: 'World elements', explanation: 'All details reinforce coherent world' }]
    },
    {
      parameterId: 'world-2',
      parameterName: 'rule_consistency',
      displayName: 'Rule Consistency',
      category: 'World & Logic',
      score: 90,
      confidence: 0.92,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Technology follows consistent logic: cybernetics are established, plasma weapons fit the aesthetic, the cube\'s mystery is intentional.',
      evidence: [{ type: 'structure', reference: 'Tech elements', explanation: 'Technology feels grounded in world logic' }]
    },
    {
      parameterId: 'world-3',
      parameterName: 'world_depth',
      displayName: 'World Depth',
      category: 'World & Logic',
      score: 91,
      confidence: 0.93,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Details suggest deeper world: corporate factions, military implants, the tower with a face. Rich expansion potential.',
      evidence: [{ type: 'scene', reference: 'Background details', explanation: 'World hints at layers beyond immediate story' }]
    },
    {
      parameterId: 'world-4',
      parameterName: 'logic_integrity',
      displayName: 'Logic Integrity',
      category: 'World & Logic',
      score: 89,
      confidence: 0.91,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'No logical inconsistencies in Issue #1. Character motivations, technology, and world rules all align.',
      evidence: [{ type: 'structure', reference: 'Plot logic', explanation: 'All elements pass logic check' }]
    },

    // ============= EMOTIONAL ARC AGENT (4 parameters) =============
    {
      parameterId: 'emotion-1',
      parameterName: 'emotional_variety',
      displayName: 'Emotional Variety',
      category: 'Emotional Arc',
      score: 81,
      confidence: 0.83,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Issue #1 is tonally consistent (noir, tense) which serves the atmosphere but limits emotional range. Future issues should vary.',
      evidence: [{ type: 'structure', reference: 'Tonal consistency', explanation: 'Strong atmosphere, limited variety' }]
    },
    {
      parameterId: 'emotion-2',
      parameterName: 'catharsis_quality',
      displayName: 'Catharsis Quality',
      category: 'Emotional Arc',
      score: 79,
      confidence: 0.81,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Issue #1 is setup-focused, so catharsis is appropriately deferred. The action beat provides partial release.',
      evidence: [{ type: 'structure', reference: 'Issue structure', explanation: 'Catharsis promised for future payoff' }]
    },
    {
      parameterId: 'emotion-3',
      parameterName: 'tonal_control',
      displayName: 'Tonal Control',
      category: 'Emotional Arc',
      score: 82,
      confidence: 0.84,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Tonal control is excellent. The noir-cyberpunk-samurai tone is maintained consistently without jarring shifts.',
      evidence: [{ type: 'structure', reference: 'Throughout', explanation: 'Unified tonal vision across all pages' }]
    },
    {
      parameterId: 'emotion-4',
      parameterName: 'audience_emotion_targeting',
      displayName: 'Audience Emotion Targeting',
      category: 'Emotional Arc',
      score: 80,
      confidence: 0.82,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'The script aims for awe, tension, and curiosity—and delivers on these. Could benefit from more intimate emotional moments.',
      evidence: [{ type: 'structure', reference: 'Emotional beats', explanation: 'Hits target emotions for the genre' }]
    },

    // ============= MARKET AGENT (5 parameters) =============
    {
      parameterId: 'market-1',
      parameterName: 'target_audience_clarity',
      displayName: 'Target Audience Clarity',
      category: 'Market',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Clear target: fans of cyberpunk comics, anime-influenced sci-fi, samurai action. Teen+ readership with crossover appeal.',
      evidence: [{ type: 'structure', reference: 'Genre positioning', explanation: 'Audience is well-defined and reachable' }]
    },
    {
      parameterId: 'market-2',
      parameterName: 'comparables_positioning',
      displayName: 'Comparables Positioning',
      category: 'Market',
      score: 85,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Strong comps: Tokyo Ghost, Blade Runner comics, Ronin. Differentiated enough to stand alone while riding audience overlap.',
      evidence: [{ type: 'structure', reference: 'Market position', explanation: 'Clear comp titles for positioning' }]
    },
    {
      parameterId: 'market-3',
      parameterName: 'marketing_hook_density',
      displayName: 'Marketing Hook Density',
      category: 'Market',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Multiple marketing angles: samurai action, cyberpunk visuals, child protector drama, corporate conspiracy, anime influence.',
      evidence: [{ type: 'structure', reference: 'Marketable elements', explanation: 'Rich material for marketing campaigns' }]
    },
    {
      parameterId: 'market-4',
      parameterName: 'platform_fit',
      displayName: 'Platform Fit',
      category: 'Market',
      score: 83,
      confidence: 0.85,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Fits multiple platforms: direct market, digital platforms, collected editions. Animation adaptation is obvious path.',
      evidence: [{ type: 'structure', reference: 'Platform options', explanation: 'Viable across multiple distribution channels' }]
    },
    {
      parameterId: 'market-5',
      parameterName: 'budget_range_alignment',
      displayName: 'Budget Range Alignment',
      category: 'Market',
      score: 82,
      confidence: 0.84,
      maturity: 'Strong',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Art-heavy cyberpunk requires skilled artist, pushing production costs higher. Worth the investment for quality execution.',
      evidence: [{ type: 'structure', reference: 'Production needs', explanation: 'Budget matches creative ambition' }]
    },

    // ============= EXECUTION & META AGENT (5 parameters) =============
    {
      parameterId: 'execution-1',
      parameterName: 'page_efficiency',
      displayName: 'Page Efficiency',
      category: 'Execution',
      score: 87,
      confidence: 0.89,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Every page earns its place. The 22-page format is used efficiently with no wasted pages.',
      evidence: [{ type: 'structure', reference: 'Page count', explanation: 'Optimal page usage throughout' }]
    },
    {
      parameterId: 'execution-2',
      parameterName: 'format_mastery',
      displayName: 'Format Mastery',
      category: 'Execution',
      score: 88,
      confidence: 0.90,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Strong understanding of comic format: page turns, panel variety, visual storytelling, dialogue economy. Professional-grade craft.',
      evidence: [{ type: 'structure', reference: 'Comic craft', explanation: 'Demonstrates mastery of medium' }]
    },
    {
      parameterId: 'execution-3',
      parameterName: 'production_feasibility',
      displayName: 'Production Feasibility',
      category: 'Execution',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Detailed cyberpunk art is demanding but achievable. Requires skilled artist comfortable with technology and action.',
      evidence: [{ type: 'structure', reference: 'Art demands', explanation: 'High quality execution is achievable' }]
    },
    {
      parameterId: 'execution-4',
      parameterName: 'investment_readiness',
      displayName: 'Investment Readiness',
      category: 'Execution',
      score: 83,
      confidence: 0.85,
      maturity: 'Strong',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Strong IP potential with clear exploitation windows. Ready for development with right creative team.',
      evidence: [{ type: 'structure', reference: 'IP value', explanation: 'Multiple revenue streams available' }]
    },
    {
      parameterId: 'execution-5',
      parameterName: 'recommendation_clarity',
      displayName: 'Recommendation Clarity',
      category: 'Execution',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Clear recommendation: proceed to development. Creative fundamentals are strong, market positioning is clear.',
      evidence: [{ type: 'structure', reference: 'Overall assessment', explanation: 'Unambiguous positive recommendation' }]
    },

    // ============= COMIC-SPECIFIC PARAMETERS (New Framework - 14 parameters) =============
    // Panel Flow Agent Parameters
    {
      parameterId: 'comic-flow-1',
      parameterName: 'sequential_storytelling_integrity',
      displayName: 'Sequential Storytelling Integrity',
      category: 'Comic Visuals',
      score: 92,
      confidence: 0.94,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Crystal-clear panel transitions with perfect cause-effect chain. Each panel logically follows from the previous, creating seamless narrative flow.',
      evidence: [{ type: 'structure', reference: 'Pages 1-6', explanation: 'Reader never confused about sequence of events' }]
    },
    {
      parameterId: 'comic-flow-2',
      parameterName: 'panel_economy',
      displayName: 'Panel Economy & Page Architecture',
      category: 'Comic Visuals',
      score: 88,
      confidence: 0.91,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Excellent panel economy with intentional rhythm variation. More panels for action, fewer for dramatic moments.',
      evidence: [{ type: 'structure', reference: 'Pages 2-4', explanation: 'Page architecture serves story perfectly' }]
    },
    {
      parameterId: 'comic-flow-3',
      parameterName: 'page_architecture',
      displayName: 'Page Architecture',
      category: 'Comic Visuals',
      score: 90,
      confidence: 0.92,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Innovative layouts that serve story—splash opening, grid for tension, dynamic angled panels for action.',
      evidence: [{ type: 'structure', reference: 'Page 1, Splash', explanation: 'Full page aerial view establishes world with cinematic scope' }]
    },
    
    // Art-Script Synergy Agent Parameters
    {
      parameterId: 'comic-synergy-1',
      parameterName: 'art_writing_synergy',
      displayName: 'Art–Writing Synergy',
      category: 'Comic Collaboration',
      score: 91,
      confidence: 0.93,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Perfect harmony—art and text complement without overlap. Dialogue never describes what visuals already show.',
      evidence: [{ type: 'action', reference: 'Page 2, Panel 2', quote: 'Half human, half chrome. His left eye glows with a soft blue—a military-grade optical implant.', explanation: 'Specific visual details guide artist interpretation' }]
    },
    {
      parameterId: 'comic-synergy-2',
      parameterName: 'character_visual_identity',
      displayName: 'Character Visual Identity',
      category: 'Comic Characters',
      score: 89,
      confidence: 0.91,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Kenji has iconic silhouette with cybernetic arm, glowing eye, and plasma katana. Instantly recognizable from design alone.',
      evidence: [{ type: 'character', reference: 'Kenji description', explanation: 'Clear visual elements that define the character' }]
    },
    {
      parameterId: 'comic-synergy-3',
      parameterName: 'collaboration_readiness',
      displayName: 'Collaboration Readiness Index',
      category: 'Comic Production',
      score: 87,
      confidence: 0.89,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Production-ready script with clear direction for artists, letterers, and colorists. Minimal clarification needed.',
      evidence: [{ type: 'structure', reference: 'Script formatting', explanation: 'Panel descriptions are clear and actionable' }]
    },
    {
      parameterId: 'comic-synergy-4',
      parameterName: 'production_pipeline_awareness',
      displayName: 'Production Pipeline Awareness',
      category: 'Comic Production',
      score: 85,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Detailed cyberpunk art is demanding but achievable. Script shows awareness of production realities.',
      evidence: [{ type: 'structure', reference: 'Art demands', explanation: 'Balanced ambition with feasibility' }]
    },
    {
      parameterId: 'comic-synergy-5',
      parameterName: 'market_publishing_alignment',
      displayName: 'Market & Publishing Alignment',
      category: 'Comic Market',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Clear audience (cyberpunk/sci-fi fans), strong format fit (single issues + collected edition), multiple publisher options.',
      evidence: [{ type: 'structure', reference: 'Overall', explanation: 'Visual style and themes align with successful properties' }]
    },
    
    // Lettering & Balloon Agent Parameters
    {
      parameterId: 'comic-lettering-1',
      parameterName: 'dialogue_load',
      displayName: 'Dialogue Load & Balloon Engineering',
      category: 'Comic Dialogue',
      score: 85,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Dialogue is concise and character-specific. No balloon crowding—each line either advances plot or reveals character.',
      evidence: [{ type: 'dialogue', reference: 'Page 4', quote: 'They said you were dead.', explanation: 'Three words establish mystery and history efficiently' }]
    },
    {
      parameterId: 'comic-lettering-2',
      parameterName: 'balloon_engineering',
      displayName: 'Balloon Engineering',
      category: 'Comic Dialogue',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Clear reading order throughout. Tail placement and balloon positioning would be straightforward for letterers.',
      evidence: [{ type: 'structure', reference: 'Dialogue placement', explanation: 'Reading order is never ambiguous' }]
    },
    {
      parameterId: 'comic-lettering-3',
      parameterName: 'reading_flow',
      displayName: 'Reading Flow',
      category: 'Comic Dialogue',
      score: 87,
      confidence: 0.89,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Natural eye movement from balloon to balloon and panel to panel. Never requires backtracking.',
      evidence: [{ type: 'structure', reference: 'Pages 1-6', explanation: 'Effortless reading experience' }]
    },
    
    // Page-Turn Impact Agent Parameters
    {
      parameterId: 'comic-impact-1',
      parameterName: 'emotional_payload_per_page',
      displayName: 'Emotional Payload per Page',
      category: 'Comic Pacing',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Every page carries clear emotional intention—awe (splash), tension (alley), action (fight), mystery (tower).',
      evidence: [{ type: 'structure', reference: 'Pages 1-6', explanation: 'Alternates between action-dense and atmosphere-focused pages' }]
    },
    {
      parameterId: 'comic-impact-2',
      parameterName: 'structural_modularity',
      displayName: 'Structural Modularity',
      category: 'Comic Structure',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Issue #1 works as standalone introduction while setting up larger arc. Effective cliffhanger with the face in the tower.',
      evidence: [{ type: 'scene', reference: 'Page 6, final panel', quote: 'For just a moment, a FACE seems to form in its patterns—watching.', explanation: 'Ominous visual hook promises larger conflict ahead' }]
    },
    {
      parameterId: 'comic-impact-3',
      parameterName: 'page_turn_reveals',
      displayName: 'Page-Turn Reveals',
      category: 'Comic Pacing',
      score: 88,
      confidence: 0.90,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Masterful use of page turns for maximum impact—action reveals, mystery moments, cliffhanger positioned perfectly.',
      evidence: [{ type: 'structure', reference: 'Page turn moments', explanation: 'Strategic placement of key reveals' }]
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
Highly recommend for development. This is a visually compelling, commercially viable project with strong creative fundamentals. Analysis powered by 10-agent USAF scoring system.`,
  full_report_data: SAMPLE_COMIC_REPORT_DATA,
  pdf_url: null,
  created_at: new Date().toISOString(),
};
