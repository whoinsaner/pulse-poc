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
    investor: 80.2,
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
    // ============= CONCEPT AGENT (Module A) =============
    {
      parameterId: 'param-concept-1',
      parameterName: 'concept_originality',
      displayName: 'Concept Originality',
      category: 'Concept & Hook',
      score: 88,
      confidence: 0.92,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'The premise blends first contact mystery with conspiracy thriller in a fresh way. While alien signals are not new, the "they already know we\'re here" twist adds novelty.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 5, Page 7',
          quote: "Your signal? It's not first contact. It's a reply.",
          explanation: 'Subverts audience expectations of standard first contact narrative'
        }
      ]
    },
    {
      parameterId: 'param-concept-2',
      parameterName: 'familiarity_anchor',
      displayName: 'Familiarity Anchor',
      category: 'Concept & Hook',
      score: 90,
      confidence: 0.94,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Effectively anchors to known genres: Arrival-style first contact, X-Files conspiracy, Bourne-style chase. Audiences can immediately orient themselves.',
      evidence: [
        {
          type: 'structure',
          reference: 'Overall premise',
          explanation: '"Arrival meets The X-Files" positioning is immediately graspable'
        }
      ]
    },
    {
      parameterId: 'param-concept-3',
      parameterName: 'hook_clarity',
      displayName: 'Hook Clarity',
      category: 'Concept & Hook',
      score: 92,
      confidence: 0.95,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Can be pitched in 10 seconds: "An astronomer discovers humanity already sent a message to the aliens—and they\'re coming." Crystal clear hook.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 2, Page 2',
          quote: "Proxima Centauri. Four point two light years away.",
          explanation: 'Immediate establishment of extraordinary discovery'
        }
      ]
    },
    {
      parameterId: 'param-concept-4',
      parameterName: 'concept_compressibility',
      displayName: 'Concept Compressibility',
      category: 'Concept & Hook',
      score: 89,
      confidence: 0.91,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Logline encapsulates the core conflict perfectly. Marketing can lean on simple taglines: "They\'ve been waiting."',
      evidence: [
        {
          type: 'structure',
          reference: 'Overall',
          explanation: 'High-concept premise translates easily to poster, trailer, and pitch'
        }
      ]
    },
    {
      parameterId: 'param-concept-5',
      parameterName: 'concept_scalability',
      displayName: 'Concept Scalability',
      category: 'Concept & Hook',
      score: 85,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Concept supports a full narrative arc from discovery to confrontation. The "what are the blueprints for?" mystery provides strong forward momentum.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 5',
          quote: "They're coming, Elena. That's what the blueprints are for.",
          explanation: 'Opens up entire second and third act potential'
        }
      ]
    },
    {
      parameterId: 'param-concept-6',
      parameterName: 'franchise_expandability',
      displayName: 'Franchise Expandability',
      category: 'Concept & Hook',
      score: 82,
      confidence: 0.84,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'The resistance network, global conspiracy, and first contact implications create natural sequel potential. Could expand into TV series or franchise.',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 8',
          quote: 'Welcome to the resistance, Dr. Vasquez.',
          explanation: 'Establishes larger world with franchise potential'
        }
      ]
    },
    // ============= STRUCTURE AGENT (Module B) =============
    {
      parameterId: 'param-struct-1',
      parameterName: 'inciting_force_clarity',
      displayName: 'Inciting Force Clarity',
      category: 'Structure',
      score: 91,
      confidence: 0.93,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'The signal discovery is unmistakably the inciting incident. Placed early (Scene 2), with clear cause-effect chain following.',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 2, Page 1-2',
          explanation: 'Signal discovery immediately launches the narrative'
        }
      ]
    },
    {
      parameterId: 'param-struct-2',
      parameterName: 'escalation_logic',
      displayName: 'Escalation Logic',
      category: 'Structure',
      score: 85,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Strong cause-effect chain: Discovery → UN announcement → Brother\'s warning → Prison revelation → Chase → Resistance. Each scene raises stakes.',
      evidence: [
        {
          type: 'structure',
          reference: 'Scenes 1-8',
          explanation: 'Clear escalation from scientific mystery to life-threatening conspiracy'
        }
      ]
    },
    {
      parameterId: 'param-struct-3',
      parameterName: 'midpoint_transformation',
      displayName: 'Midpoint Transformation',
      category: 'Structure',
      score: 87,
      confidence: 0.89,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Prison revelation (Scene 5) serves as powerful midpoint that transforms Elena from observer to target. Genre shifts from mystery to thriller.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 5',
          quote: "Your signal? It's not first contact. It's a reply.",
          explanation: 'Fundamental shift in protagonist understanding and story direction'
        }
      ]
    },
    {
      parameterId: 'param-struct-4',
      parameterName: 'structural_symmetry',
      displayName: 'Structural Symmetry',
      category: 'Structure',
      score: 80,
      confidence: 0.82,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Act One break is clearly marked. Balance between setup and escalation is good. Full symmetry analysis requires complete script.',
      evidence: [
        {
          type: 'structure',
          reference: 'Page 6',
          explanation: 'Explicit "END ACT ONE" marker shows structural awareness'
        }
      ]
    },
    {
      parameterId: 'param-struct-5',
      parameterName: 'repetition_vs_progression',
      displayName: 'Repetition vs Progression',
      category: 'Structure',
      score: 83,
      confidence: 0.85,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'No stagnation detected in the sample pages. Each scene introduces new information and escalates stakes.',
      evidence: [
        {
          type: 'structure',
          reference: 'Throughout',
          explanation: 'No repetitive beats—each scene advances plot meaningfully'
        }
      ]
    },
    {
      parameterId: 'param-struct-6',
      parameterName: 'resolution_satisfaction',
      displayName: 'Resolution Satisfaction',
      category: 'Structure',
      score: 75,
      confidence: 0.70,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Sample pages end at Act Two opening—full resolution not evaluable. Safe house arrival provides temporary satisfaction.',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 8',
          explanation: 'Temporary resolution with discovery of resistance provides hope'
        }
      ]
    },
    {
      parameterId: 'param-struct-7',
      parameterName: 'drop_off_risk',
      displayName: 'Drop-off Risk Points',
      category: 'Structure',
      score: 78,
      confidence: 0.80,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Prison scene (Scene 5) carries heavy exposition load—potential drop-off risk. Otherwise, pacing maintains engagement.',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 5, Pages 6-8',
          explanation: 'Three pages of dialogue-heavy revelation may test patience'
        }
      ]
    },
    // ============= CHARACTER AGENT (Module C) =============
    {
      parameterId: 'param-char-1',
      parameterName: 'want_vs_need',
      displayName: 'Want vs Need',
      category: 'Character',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Elena wants to understand the signal (external goal). Her need appears to be reconciliation with her past/brother and finding purpose beyond her disgrace.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 4',
          quote: 'I told you not to call me.',
          explanation: 'Suggests unresolved emotional need around brother relationship'
        }
      ]
    },
    {
      parameterId: 'param-char-2',
      parameterName: 'psychological_flaw_depth',
      displayName: 'Psychological Flaw Depth',
      category: 'Character',
      score: 79,
      confidence: 0.81,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Elena is "disgraced" per description, but specific flaw not yet explored in sample pages. Potential for deeper psychological complexity.',
      evidence: [
        {
          type: 'character',
          reference: 'Elena description',
          quote: 'weathered but sharp, the kind of face that\'s seen too many sunrises from the wrong side',
          explanation: 'Hints at troubled past but needs development'
        }
      ]
    },
    {
      parameterId: 'param-char-3',
      parameterName: 'agency_level',
      displayName: 'Agency Level',
      category: 'Character',
      score: 88,
      confidence: 0.90,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Elena is highly proactive: discovers signal, presents at UN, visits brother, escapes pursuers, finds resistance. Never passive.',
      evidence: [
        {
          type: 'action',
          reference: 'Scene 6-7',
          explanation: 'Elena actively evades pursuit through clever tactics'
        }
      ]
    },
    {
      parameterId: 'param-char-4',
      parameterName: 'decision_density',
      displayName: 'Decision Density',
      category: 'Character',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Elena makes frequent impactful decisions: to investigate signal, to call Geneva, to visit brother, to investigate old archives, to evade pursuers.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 6',
          quote: 'Check the archives. 1947, 1952, 1977.',
          explanation: 'Active decision to investigate despite risk'
        }
      ]
    },
    {
      parameterId: 'param-char-5',
      parameterName: 'transformation_credibility',
      displayName: 'Transformation Credibility',
      category: 'Character',
      score: 76,
      confidence: 0.75,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Early in narrative—transformation not yet visible. Setup suggests credible arc potential from skeptic to believer to fighter.',
      evidence: [
        {
          type: 'character',
          reference: 'Elena throughout',
          explanation: 'Clear trajectory established but arc not yet complete'
        }
      ]
    },
    {
      parameterId: 'param-char-6',
      parameterName: 'character_balance',
      displayName: 'Character Balance',
      category: 'Character',
      score: 82,
      confidence: 0.84,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Elena dominates appropriately as protagonist. Supporting characters (Dmitri, James, Admiral Chen) are distinct and serve clear functions.',
      evidence: [
        {
          type: 'character',
          reference: 'All characters',
          explanation: 'Each supporting character has unique voice and role'
        }
      ]
    },
    {
      parameterId: 'param-char-7',
      parameterName: 'performative_range',
      displayName: 'Performative Range',
      category: 'Character',
      score: 87,
      confidence: 0.89,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Elena requires wide emotional range: scientific excitement, professional composure, familial tension, fear, determination. Strong lead role.',
      evidence: [
        {
          type: 'character',
          reference: 'Elena throughout',
          explanation: 'Multiple emotional registers required within sample pages'
        }
      ]
    },
    // ============= CONFLICT AGENT (Module D) =============
    {
      parameterId: 'param-conf-1',
      parameterName: 'conflict_type_diversity',
      displayName: 'Conflict Type Diversity',
      category: 'Conflict',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Multiple conflict types present: External (conspiracy, pursuit), Interpersonal (sibling tension), Societal (humanity\'s response), Internal (implied guilt/disgrace).',
      evidence: [
        {
          type: 'structure',
          reference: 'Throughout',
          explanation: 'Layered conflicts at personal, institutional, and existential levels'
        }
      ]
    },
    {
      parameterId: 'param-conf-2',
      parameterName: 'conflict_density',
      displayName: 'Conflict Density',
      category: 'Conflict',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Consistent conflict beats: discovery tension, UN chaos, brother warning, prison revelation, chase sequence. No dead scenes.',
      evidence: [
        {
          type: 'structure',
          reference: 'All scenes',
          explanation: 'Every scene contains active conflict or tension'
        }
      ]
    },
    {
      parameterId: 'param-conf-3',
      parameterName: 'stakes_personalization',
      displayName: 'Stakes Personalization',
      category: 'Conflict',
      score: 88,
      confidence: 0.90,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Global stakes are personalized through brother connection, Elena\'s life being threatened, and her professional redemption.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 4',
          quote: "They're going to kill you, Elena.",
          explanation: 'Global conspiracy becomes personal survival story'
        }
      ]
    },
    {
      parameterId: 'param-conf-4',
      parameterName: 'escalation_irreversibility',
      displayName: 'Escalation Irreversibility',
      category: 'Conflict',
      score: 85,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Once Elena learns the truth, there\'s no going back. She\'s been marked by the conspiracy. Stakes only escalate.',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 6-7',
          explanation: 'Being actively pursued—cannot return to normal life'
        }
      ]
    },
    {
      parameterId: 'param-conf-5',
      parameterName: 'cost_of_failure',
      displayName: 'Cost of Failure',
      category: 'Conflict',
      score: 90,
      confidence: 0.92,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Maximum stakes: Elena\'s life, humanity\'s future, truth being buried forever. Clear and present danger established.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 5',
          quote: "They're coming, Elena.",
          explanation: 'Existential threat to all humanity if truth suppressed'
        }
      ]
    },
    {
      parameterId: 'param-conf-6',
      parameterName: 'internal_external_balance',
      displayName: 'Internal vs External Balance',
      category: 'Conflict',
      score: 78,
      confidence: 0.80,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Currently weighted toward external conflict. Internal conflict (disgrace, guilt, sibling relationship) is present but less developed.',
      evidence: [
        {
          type: 'character',
          reference: 'Elena',
          explanation: 'External threats dominate; internal journey needs more development'
        }
      ]
    },
    // ============= THEME AGENT (Module E) =============
    {
      parameterId: 'param-theme-1',
      parameterName: 'thematic_spine_clarity',
      displayName: 'Thematic Spine Clarity',
      category: 'Theme',
      score: 79,
      confidence: 0.81,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Multiple thematic threads: truth vs. power, humanity\'s readiness, institutional corruption. Core spine could be clearer.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 5',
          quote: "They said we were ready.",
          explanation: 'Touches on humanity\'s hubris but doesn\'t fully commit'
        }
      ]
    },
    {
      parameterId: 'param-theme-2',
      parameterName: 'show_vs_tell_ratio',
      displayName: 'Show vs Tell Ratio',
      category: 'Theme',
      score: 75,
      confidence: 0.77,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Some themes are stated rather than demonstrated, particularly in prison scene exposition. Visual storytelling in action scenes is strong.',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 5',
          explanation: 'Heavy exposition tells rather than shows conspiracy'
        }
      ]
    },
    {
      parameterId: 'param-theme-3',
      parameterName: 'symbol_motif_consistency',
      displayName: 'Symbol/Motif Consistency',
      category: 'Theme',
      score: 80,
      confidence: 0.82,
      maturity: 'Developing',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'The signal itself is a strong recurring motif. Religious imagery (Dmitri\'s blessing) suggests faith vs. science theme. Could be developed further.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 2',
          quote: "Gospodi pomiluy.",
          explanation: 'Religious response to cosmic discovery—motif potential'
        }
      ]
    },
    {
      parameterId: 'param-theme-4',
      parameterName: 'moral_complexity',
      displayName: 'Moral Complexity',
      category: 'Theme',
      score: 82,
      confidence: 0.84,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Shadow government isn\'t purely evil—James genuinely believed he was helping humanity. Admiral Chen defected from within. Nuance present.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 5',
          quote: "I was twenty-three. They told me it was the most important thing humanity had ever done.",
          explanation: 'James is sympathetic despite his role in conspiracy'
        }
      ]
    },
    {
      parameterId: 'param-theme-5',
      parameterName: 'cultural_resonance',
      displayName: 'Cultural Resonance',
      category: 'Theme',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Themes of institutional distrust, hidden truths, and global cooperation resonate strongly with contemporary anxieties.',
      evidence: [
        {
          type: 'structure',
          reference: 'Overall',
          explanation: 'Post-2020 audiences primed for conspiracy and institutional failure themes'
        }
      ]
    },
    {
      parameterId: 'param-theme-6',
      parameterName: 'longevity_of_meaning',
      displayName: 'Longevity of Meaning',
      category: 'Theme',
      score: 81,
      confidence: 0.83,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'First contact and institutional corruption themes are evergreen. Specific conspiracy elements feel timely but may date.',
      evidence: [
        {
          type: 'theme',
          reference: 'Core premise',
          explanation: 'Are we alone? is eternal question; conspiracy elements more temporal'
        }
      ]
    },
    // ============= DIALOGUE AGENT (Module F) =============
    {
      parameterId: 'param-dial-1',
      parameterName: 'exposition_load',
      displayName: 'Exposition Load',
      category: 'Dialogue',
      score: 72,
      confidence: 0.75,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Prison scene carries heavy exposition burden. James essentially delivers a monologue of backstory. Could benefit from visual flashbacks.',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 5, Pages 6-8',
          explanation: 'Three pages of exposition-heavy dialogue'
        }
      ]
    },
    {
      parameterId: 'param-dial-2',
      parameterName: 'subtext_density',
      displayName: 'Subtext Density',
      category: 'Dialogue',
      score: 83,
      confidence: 0.85,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Strong subtext in sibling scenes—guilt, betrayal, and desperate hope beneath surface. Dmitri\'s "This will end career" packed with implication.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 4',
          quote: "I told you not to call me.",
          explanation: 'Implies complicated history in one line'
        }
      ]
    },
    {
      parameterId: 'param-dial-3',
      parameterName: 'voice_differentiation',
      displayName: 'Voice Differentiation',
      category: 'Dialogue',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Characters have distinct voices: Elena is dry and scientific, Dmitri brings Russian fatalism with humor, James is guilt-ridden and urgent.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 2',
          quote: "Gospodi pomiluy.",
          explanation: 'Dmitri\'s Russian Orthodox reaction establishes cultural distinctiveness'
        }
      ]
    },
    {
      parameterId: 'param-dial-4',
      parameterName: 'rhythm_and_silence',
      displayName: 'Rhythm & Silence',
      category: 'Dialogue',
      score: 80,
      confidence: 0.82,
      maturity: 'Developing',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Good use of pauses and silences, especially in phone call scene. Action scenes provide verbal rest. Prison scene is dense.',
      evidence: [
        {
          type: 'action',
          reference: 'Scene 4',
          quote: 'Silence.',
          explanation: 'Effective use of silence for dramatic effect'
        }
      ]
    },
    {
      parameterId: 'param-dial-5',
      parameterName: 'quotability',
      displayName: 'Quotability',
      category: 'Dialogue',
      score: 78,
      confidence: 0.80,
      maturity: 'Developing',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: '"Welcome to the resistance" is memorable but expected. "Your signal? It\'s a reply" is stronger. Room for more iconic lines.',
      evidence: [
        {
          type: 'dialogue',
          reference: 'Scene 5',
          quote: "Your signal? It's not first contact. It's a reply.",
          explanation: 'Trailer-ready line with punch'
        }
      ]
    },
    {
      parameterId: 'param-dial-6',
      parameterName: 'medium_appropriateness',
      displayName: 'Medium Appropriateness',
      category: 'Dialogue',
      score: 85,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Dialogue is well-suited for film. Balance of talky scenes with action sequences. Visual storytelling opportunities noted.',
      evidence: [
        {
          type: 'structure',
          reference: 'Overall',
          explanation: 'Dialogue-to-action ratio appropriate for theatrical feature'
        }
      ]
    },
    // ============= WORLD LOGIC AGENT (Module G) =============
    {
      parameterId: 'param-world-1',
      parameterName: 'world_rule_consistency',
      displayName: 'World Rule Consistency',
      category: 'World & Logic',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Internal logic is consistent. Roswell-based conspiracy follows established tropes. Signal technology is plausible within genre conventions.',
      evidence: [
        {
          type: 'world',
          reference: 'Scene 5',
          explanation: 'Conspiracy mythology is internally consistent with real-world references'
        }
      ]
    },
    {
      parameterId: 'param-world-2',
      parameterName: 'setting_agency',
      displayName: 'Setting Agency',
      category: 'World & Logic',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Settings actively shape story: ALMA\'s isolation enables discovery, UN chaos shows global stakes, barn chase uses environment creatively.',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 7',
          explanation: 'Elena uses barn environment to escape—setting as active element'
        }
      ]
    },
    {
      parameterId: 'param-world-3',
      parameterName: 'spatial_system_logic',
      displayName: 'Spatial/System Logic',
      category: 'World & Logic',
      score: 82,
      confidence: 0.84,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Geography is clear: Chile to Geneva to Virginia. Conspiracy network spans globally. Prison security is plausible.',
      evidence: [
        {
          type: 'structure',
          reference: 'Scenes 1-8',
          explanation: 'Clear spatial logic across international locations'
        }
      ]
    },
    {
      parameterId: 'param-world-4',
      parameterName: 'plausibility',
      displayName: 'Plausibility',
      category: 'World & Logic',
      score: 83,
      confidence: 0.85,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Grounded in real institutions (ALMA, UN) lending credibility. Conspiracy elements are genre-appropriate. Chase physics are acceptable.',
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
      parameterId: 'param-world-5',
      parameterName: 'continuity_integrity',
      displayName: 'Continuity Integrity',
      category: 'World & Logic',
      score: 88,
      confidence: 0.90,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'No continuity errors detected in sample pages. Timeline is clear (72 hours later, etc.). Character details consistent.',
      evidence: [
        {
          type: 'structure',
          reference: 'Throughout',
          explanation: 'Time markers and character details remain consistent'
        }
      ]
    },
    {
      parameterId: 'param-world-6',
      parameterName: 'suspension_of_disbelief',
      displayName: 'Suspension of Disbelief',
      category: 'World & Logic',
      score: 85,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Premise is fantastical but grounded approach aids believability. Genre-savvy audiences will accept conspiracy conventions.',
      evidence: [
        {
          type: 'world',
          reference: 'Overall',
          explanation: 'Real-world anchors (ALMA, UN) support genre conceits'
        }
      ]
    },
    // ============= EMOTIONAL ARC AGENT (Module H) =============
    {
      parameterId: 'param-emo-1',
      parameterName: 'emotional_range',
      displayName: 'Emotional Range',
      category: 'Emotional Arc',
      score: 85,
      confidence: 0.87,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Wide emotional palette: wonder, tension, chaos, paranoia, revelation, fear, hope. Variety prevents monotony.',
      evidence: [
        {
          type: 'structure',
          reference: 'Scenes 1-8',
          explanation: 'Each scene targets different emotional register'
        }
      ]
    },
    {
      parameterId: 'param-emo-2',
      parameterName: 'emotional_timing',
      displayName: 'Emotional Timing',
      category: 'Emotional Arc',
      score: 82,
      confidence: 0.84,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Emotional beats are well-placed. Safe house arrival provides relief after chase intensity. Prison revelation is properly positioned.',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 8',
          quote: "Welcome to the resistance, Dr. Vasquez.",
          explanation: 'Emotional relief after sustained tension'
        }
      ]
    },
    {
      parameterId: 'param-emo-3',
      parameterName: 'emotional_progression',
      displayName: 'Emotional Progression',
      category: 'Emotional Arc',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Clear emotional trajectory: curiosity → excitement → dread → paranoia → fear → determination → hope. Natural flow.',
      evidence: [
        {
          type: 'character',
          reference: 'Elena throughout',
          explanation: 'Protagonist\'s emotional journey mirrors audience experience'
        }
      ]
    },
    {
      parameterId: 'param-emo-4',
      parameterName: 'catharsis_strength',
      displayName: 'Catharsis Strength',
      category: 'Emotional Arc',
      score: 75,
      confidence: 0.72,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Sample pages don\'t reach catharsis—that comes later. Safe house discovery is minor relief, not full catharsis.',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 8',
          explanation: 'Temporary emotional release, not full cathartic resolution'
        }
      ]
    },
    {
      parameterId: 'param-emo-5',
      parameterName: 'fatigue_vs_variety',
      displayName: 'Fatigue vs Variety',
      category: 'Emotional Arc',
      score: 81,
      confidence: 0.83,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Good variety prevents fatigue. Quiet hotel call follows UN chaos. Chase follows prison heaviness. Pacing considered.',
      evidence: [
        {
          type: 'structure',
          reference: 'Scene sequence',
          explanation: 'Alternation between intense and reflective scenes'
        }
      ]
    },
    {
      parameterId: 'param-emo-6',
      parameterName: 'payoff_delay',
      displayName: 'Payoff Delay',
      category: 'Emotional Arc',
      score: 80,
      confidence: 0.82,
      maturity: 'Developing',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Good delayed payoff structure. Brother call teases, prison delivers. Signal meaning teased but not fully revealed. Proper pacing.',
      evidence: [
        {
          type: 'structure',
          reference: 'Scenes 4-5',
          explanation: 'Phone call teases; prison visit delivers revelation'
        }
      ]
    },
    // ============= MARKET AGENT (Module I) =============
    {
      parameterId: 'param-mkt-1',
      parameterName: 'audience_fit',
      displayName: 'Audience Fit',
      category: 'Market',
      score: 82,
      confidence: 0.84,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Clear target: sci-fi thriller fans (Arrival, Interstellar) + conspiracy audiences (X-Files). Female lead broadens appeal.',
      evidence: [
        {
          type: 'market',
          reference: 'Comparable titles',
          explanation: 'Bridges intellectual sci-fi and thriller demographics'
        }
      ]
    },
    {
      parameterId: 'param-mkt-2',
      parameterName: 'platform_fit',
      displayName: 'Platform Fit',
      category: 'Market',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Strong theatrical potential given scope. Also viable for premium streaming. Scale suggests $80-120M budget range.',
      evidence: [
        {
          type: 'market',
          reference: 'Production scope',
          explanation: 'International locations and VFX suggest theatrical scale'
        }
      ]
    },
    {
      parameterId: 'param-mkt-3',
      parameterName: 'consumption_pattern_alignment',
      displayName: 'Consumption Pattern Alignment',
      category: 'Market',
      score: 80,
      confidence: 0.82,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Medium',
      upsideImpact: 'Medium',
      rationale: 'Linear thriller structure suits theatrical viewing. Episodic expansion possible but current form is feature.',
      evidence: [
        {
          type: 'structure',
          reference: 'Overall',
          explanation: 'Self-contained narrative with clear act structure'
        }
      ]
    },
    {
      parameterId: 'param-mkt-4',
      parameterName: 'marketing_hook_density',
      displayName: 'Marketing Hook Density',
      category: 'Market',
      score: 86,
      confidence: 0.88,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'High',
      rationale: 'Multiple marketable elements: alien signal, global conspiracy, female scientist hero, chase sequences, resistance movement.',
      evidence: [
        {
          type: 'market',
          reference: 'Key imagery',
          explanation: 'ALMA dishes, UN chaos, chase, safe house—trailer moments'
        }
      ]
    },
    {
      parameterId: 'param-mkt-5',
      parameterName: 'ip_expansion_potential',
      displayName: 'IP Expansion Potential',
      category: 'Market',
      score: 77,
      confidence: 0.79,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Resistance network and 70-year conspiracy suggest expanded universe potential. Could support sequel, prequel, or TV expansion.',
      evidence: [
        {
          type: 'world',
          reference: 'Scene 5, Scene 8',
          explanation: 'Decades-long conspiracy and organized resistance = franchise seeds'
        }
      ]
    },
    {
      parameterId: 'param-mkt-6',
      parameterName: 'localization_ease',
      displayName: 'Localization Ease',
      category: 'Market',
      score: 75,
      confidence: 0.77,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'High',
      upsideImpact: 'Medium',
      rationale: 'Global stakes aid international appeal. US-centric conspiracy elements may require adaptation. Chile/Geneva settings help.',
      evidence: [
        {
          type: 'market',
          reference: 'International locations',
          explanation: 'Non-US settings expand global appeal; Roswell is US-specific'
        }
      ]
    },
    // ============= EXECUTION AGENT (Module J) =============
    {
      parameterId: 'param-exec-1',
      parameterName: 'production_complexity',
      displayName: 'Production Complexity',
      category: 'Execution',
      score: 72,
      confidence: 0.75,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'High',
      upsideImpact: 'Medium',
      rationale: 'Multiple international locations (Chile, Geneva, Virginia), crowd scenes (UN), car chase, period references (Roswell flashbacks implied).',
      evidence: [
        {
          type: 'scene',
          reference: 'Scene 3',
          explanation: 'UN scene requires significant crowd and set design investment'
        }
      ]
    },
    {
      parameterId: 'param-exec-2',
      parameterName: 'talent_dependency',
      displayName: 'Talent Dependency',
      category: 'Execution',
      score: 78,
      confidence: 0.80,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'High',
      upsideImpact: 'High',
      rationale: 'Lead role (Elena) carries entire film—requires A-list actress. Supporting roles less demanding but require gravitas.',
      evidence: [
        {
          type: 'character',
          reference: 'Elena',
          explanation: 'Protagonist appears in nearly every scene—star vehicle'
        }
      ]
    },
    {
      parameterId: 'param-exec-3',
      parameterName: 'technical_dependency',
      displayName: 'Technical Dependency',
      category: 'Execution',
      score: 76,
      confidence: 0.78,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'High',
      upsideImpact: 'Medium',
      rationale: 'Moderate VFX for signal visualization, possible flashbacks. Car chase requires stunt coordination. No heavy CGI.',
      evidence: [
        {
          type: 'scene',
          reference: 'Various',
          explanation: 'VFX primarily for signal effects—not creature or world-building heavy'
        }
      ]
    },
    {
      parameterId: 'param-exec-4',
      parameterName: 'schedule_risk',
      displayName: 'Schedule Risk',
      category: 'Execution',
      score: 74,
      confidence: 0.76,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'High',
      upsideImpact: 'Medium',
      rationale: 'International shoots add scheduling complexity. ALMA location access may be limited. UN scenes could be studio-built.',
      evidence: [
        {
          type: 'production',
          reference: 'Location requirements',
          explanation: 'Chile, Geneva, Virginia shoots require significant logistics'
        }
      ]
    },
    {
      parameterId: 'param-exec-5',
      parameterName: 'compliance_sensitivity_risk',
      displayName: 'Compliance/Sensitivity Risk',
      category: 'Execution',
      score: 88,
      confidence: 0.90,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'No major content sensitivities. Government conspiracy is fictional. No real-world religious/political figures depicted.',
      evidence: [
        {
          type: 'content',
          reference: 'Overall',
          explanation: 'Standard sci-fi thriller content—no unusual sensitivities'
        }
      ]
    },
    {
      parameterId: 'param-exec-6',
      parameterName: 'failure_modes',
      displayName: 'Failure Modes',
      category: 'Execution',
      score: 76,
      confidence: 0.78,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'High',
      upsideImpact: 'High',
      rationale: 'Key risks: Casting miss on Elena, VFX budget overrun, audience fatigue with conspiracy genre, competition from similar projects.',
      evidence: [
        {
          type: 'market',
          reference: 'Genre landscape',
          explanation: 'Needs differentiation from Arrival/Interstellar legacy'
        }
      ]
    },
    // ============= META AGENTS =============
    {
      parameterId: 'param-meta-1',
      parameterName: 'readiness_score',
      displayName: 'Investment Readiness',
      category: 'Meta Analysis',
      score: 79,
      confidence: 0.81,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'Medium',
      upsideImpact: 'High',
      rationale: 'Strong concept, clear market, but production complexity and talent dependency create execution risk. Development needed.',
      evidence: [
        {
          type: 'overall',
          reference: 'Full analysis',
          explanation: 'Creative fundamentals strong; execution risks moderate'
        }
      ]
    },
    {
      parameterId: 'param-meta-2',
      parameterName: 'market_clarity',
      displayName: 'Market Clarity',
      category: 'Meta Analysis',
      score: 84,
      confidence: 0.86,
      maturity: 'Strong',
      riskLevel: 'Low',
      fixCost: 'Low',
      upsideImpact: 'Medium',
      rationale: 'Clear positioning against Arrival/Contact/Interstellar with conspiracy differentiation. Target audience identifiable.',
      evidence: [
        {
          type: 'market',
          reference: 'Comparable analysis',
          explanation: 'Easy to position in marketing materials'
        }
      ]
    },
    {
      parameterId: 'param-meta-3',
      parameterName: 'budget_realism',
      displayName: 'Budget Realism',
      category: 'Meta Analysis',
      score: 75,
      confidence: 0.77,
      maturity: 'Developing',
      riskLevel: 'Medium',
      fixCost: 'High',
      upsideImpact: 'Medium',
      rationale: 'Implied budget ($80-120M) is appropriate for scope but at higher end of risk tolerance for original IP.',
      evidence: [
        {
          type: 'production',
          reference: 'Scope analysis',
          explanation: 'International locations and VFX push costs up'
        }
      ]
    }
  ],
  insights: [
    {
      category: 'Strength',
      title: 'Exceptional High-Concept Premise',
      description: 'The script delivers an immediately graspable hook that combines first contact with conspiracy thriller elements. This dual-genre approach expands audience appeal while maintaining intellectual credibility.',
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
      description: 'Elena Vasquez is a compelling lead—competent, flawed, and active. Her scientific credibility paired with personal vulnerability creates a character audiences will root for.',
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
      category: 'Strength',
      title: 'Clear Escalation Logic',
      description: 'The narrative follows a strong cause-effect chain from discovery through revelation to pursuit. Stakes escalate naturally and irreversibly.',
      priority: 3,
      actionable: false,
      supportingEvidence: [
        {
          type: 'structure',
          reference: 'Scenes 1-8',
          explanation: 'Each scene raises stakes logically from previous'
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
      category: 'Opportunity',
      title: 'Develop Internal Conflict',
      description: 'Elena\'s external conflicts are strong, but her internal journey (disgrace, sibling relationship, guilt) needs deeper exploration to create emotional resonance.',
      priority: 3,
      actionable: true,
      supportingEvidence: [
        {
          type: 'character',
          reference: 'Elena',
          explanation: 'Internal conflict mentioned but not fully developed'
        }
      ]
    },
    {
      category: 'Risk',
      title: 'Exposition Density in Prison Scene',
      description: 'The prison conversation carries heavy exposition load. While James\'s revelations are crucial, consider breaking this information across multiple scenes or using visual flashbacks to maintain pacing.',
      priority: 1,
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
      title: 'Production Complexity',
      description: 'Multiple international locations, crowd scenes, and chase sequences increase budget risk. Consider identifying scenes that could be consolidated or relocated.',
      priority: 2,
      actionable: true,
      supportingEvidence: [
        {
          type: 'production',
          reference: 'Locations',
          explanation: 'Chile, Geneva, Virginia shoots add significant logistics cost'
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
- Immediately graspable hook with layered genre appeal (88/100 Hook Clarity)
- Well-crafted opening sequence establishing tone and stakes
- Elena Vasquez is a protagonist worth following—competent, proactive, and complex (88/100 Agency Level)
- Strong escalation logic with irreversible stakes (85/100)

**Areas for Development:**
- Thematic exploration could be deepened beyond plot mechanics (79/100)
- Prison exposition scene carries heavy information load (72/100 Exposition Load)
- Internal conflict needs more development (78/100 Internal/External Balance)
- Secondary character development (Admiral Chen, Dmitri) needs earlier establishment

**Commercial Assessment:**
The script positions well for the $80-120M budget range with clear audience targeting (Arrival/X-Files fans). Marketing hook density is strong (86/100). International locations add production value but also complexity. Franchise potential exists through resistance network storyline.

**Investment Readiness: 79/100**
Strong creative fundamentals with moderate execution risks. Recommend development with focus on thematic deepening, exposition pacing, and production optimization.

**UASF Analysis:** 55 parameters scored across 10 core agents + meta analysis. All agents completed successfully.`,
  full_report_data: SAMPLE_REPORT_DATA,
  pdf_url: null,
  created_at: new Date().toISOString(),
};
