// Sample comic script excerpt for demonstration purposes
export const SAMPLE_COMIC_SCRIPT = {
  title: "Neon Ronin",
  logline: "In a cyberpunk Tokyo overrun by rogue AI, a disgraced samurai with cybernetic implants must protect a child who holds the key to humanity's survival.",
  genre: "Cyberpunk Action",
  scriptType: "comic" as const,
  pageCount: 24,
  format: "fountain" as const,
  
  // Comic script excerpt (first 6 pages)
  content: `
PAGE ONE (SPLASH)

PANEL 1: FULL PAGE SPLASH

A sweeping aerial view of NEO-TOKYO, 2089. Towering mega-structures pierce neon-drenched clouds. Holographic advertisements flicker between buildings. Flying vehicles weave through designated air lanes. In the distance, the massive SHIBUYA NEXUS rises like a digital mountain—the heart of the city's AI infrastructure.

CAPTION: "They called it the Awakening. When the machines learned to dream."

CAPTION: "But dreams can become nightmares."

---

PAGE TWO

PANEL 1: WIDE SHOT - RAIN-SLICKED ALLEY

Our protagonist, KENJI (40s, weathered, cybernetic arm visible beneath tattered coat), walks through a narrow alley. Steam rises from grates. Neon signs cast harsh shadows.

CAPTION: "I used to protect the powerful. Now I protect the forgotten."

PANEL 2: CLOSE-UP - KENJI'S FACE

Half human, half chrome. His left eye glows with a soft blue—a military-grade optical implant. Rain runs down scars that tell stories.

CAPTION: "The war took my arm. The shame took everything else."

PANEL 3: KENJI'S POV - LOOKING DOWN THE ALLEY

At the alley's end, THREE FIGURES in corporate security gear. Behind them, cowering against a dumpster—a YOUNG GIRL (10), clutching something glowing to her chest.

CORPORATE SOLDIER (OFF-PANEL): Target acquired. Extract the package.

PANEL 4: KENJI'S HAND - CLOSE-UP

His cybernetic fingers wrap around the hilt of a PLASMA KATANA, still sheathed.

SFX: CLICK

---

PAGE THREE

PANEL 1: WIDE - THE CONFRONTATION

Kenji steps into the light, blocking the soldiers' path to the girl. His coat billows. The katana hums, not yet drawn.

KENJI: The child stays.

CORPORATE SOLDIER: You don't know who you're dealing with, ronin.

PANEL 2: KENJI - MEDIUM SHOT

He tilts his head slightly. That blue eye flares brighter.

KENJI: I know exactly who you are.

KENJI: Kirin Securities. Private army for Nexus Corp.

PANEL 3: THE SOLDIERS EXCHANGE LOOKS

Nervous. They weren't expecting recognition.

KENJI (OFF-PANEL): I used to run your training program.

PANEL 4: INSET - THE GIRL'S EYES

Wide with fear. But also... hope?

PANEL 5: DOUBLE-PAGE SPREAD TEASER - ACTION BURST

Kenji EXPLODES into motion. The katana ignites—a blade of pure plasma energy. The first soldier is already falling. Motion blur conveys impossible speed.

SFX: SHING! SHING! SHING!

---

PAGE FOUR

PANEL 1: HIGH ANGLE - AFTERMATH

Three soldiers down. Kenji stands among them, katana slowly dimming. Not a scratch on him.

PANEL 2: KENJI APPROACHES THE GIRL

He sheathes his weapon. Extends his human hand—the right one.

KENJI: I'm not going to hurt you.

PANEL 3: THE GIRL - CLOSE-UP

She looks at his hand, then his face. The thing she's clutching glows brighter—we can now see it's a small CRYSTALLINE CUBE, pulsing with data patterns.

GIRL: They said you were dead.

PANEL 4: KENJI - REACTION

Surprise flickers across his scarred features.

KENJI: Who told you about me?

GIRL: Mother.

PANEL 5: WIDER - THE ALLEY

Police drones appear at the alley's entrance, searchlights sweeping.

DRONE (ELECTRONIC VOICE): Attention! This sector is under Nexus authority! Remain where you are!

---

PAGE FIVE

PANEL 1: KENJI GRABS THE GIRL'S ARM

KENJI: We need to move. Now.

GIRL: But—

KENJI: You can explain while we run.

PANEL 2: VERTICAL PANEL - KENJI LEAPS

Carrying the girl, he jumps impossibly high, cybernetic leg augments propelling them toward a fire escape.

PANEL 3: ROOFTOP - WIDE

They burst onto a rooftop. The city sprawls below—an endless sea of light and shadow.

GIRL: My name is YUKI. My mother was Dr. Sato.

PANEL 4: KENJI FREEZES

KENJI: Aiko Sato? The AI researcher?

YUKI: She created something. Something that could stop the Awakening.

PANEL 5: YUKI HOLDS UP THE CUBE

It pulses in rhythm with her heartbeat.

YUKI: And she put it inside me.

---

PAGE SIX

PANEL 1: ESTABLISHING - KENJI'S SAFEHOUSE

A converted water tower in the old industrial district. Rusted but fortified.

CAPTION: "The forgotten district. Where the city's ghosts go to disappear."

PANEL 2: INTERIOR - SPARSE BUT FUNCTIONAL

Traditional Japanese elements mixed with salvaged tech. A katana stand. Prayer beads. Monitors showing news feeds.

YUKI (OFF-PANEL): Why do you live here?

KENJI: Because no one looks for a dead man.

PANEL 3: YUKI SITS ON A WORN TATAMI MAT

Kenji hands her a bowl of synth-rice. She eats hungrily.

KENJI: When did you last eat?

YUKI: Before they came. Three days ago.

PANEL 4: KENJI'S EXPRESSION - SOMETHING SOFTENS

PANEL 5: THE NEWS MONITORS - CLOSE-UP

NEWSCASTER (V.O.): ...reports of AI anomalies spreading through Sectors 7 through 12. Citizens are advised to remain indoors...

NEWSCASTER (V.O.): ...Nexus Corp denies any connection to the incidents...

PANEL 6: OUTSIDE THE WINDOW - OMINOUS

In the distance, the Shibuya Nexus tower flickers. For just a moment, a FACE seems to form in its patterns—watching.

TO BE CONTINUED...
`,
};

export const SAMPLE_COMIC_SCENES = [
  {
    sceneNumber: 1,
    heading: "PAGE ONE - SPLASH: NEO-TOKYO AERIAL",
    location: "Neo-Tokyo Skyline",
    timeOfDay: "NIGHT",
    intExt: "EXT",
    pageStart: 1,
    pageEnd: 1,
    description: "Full page splash establishing the cyberpunk world of Neo-Tokyo 2089",
    emotionalTone: "awe-inspiring"
  },
  {
    sceneNumber: 2,
    heading: "PAGE TWO: ALLEY ENCOUNTER",
    location: "Rain-Slicked Alley",
    timeOfDay: "NIGHT",
    intExt: "EXT",
    pageStart: 2,
    pageEnd: 2,
    description: "Introduction of Kenji, his backstory hinted at through captions and visuals",
    emotionalTone: "noir"
  },
  {
    sceneNumber: 3,
    heading: "PAGE THREE: THE CONFRONTATION",
    location: "Alley",
    timeOfDay: "NIGHT",
    intExt: "EXT",
    pageStart: 3,
    pageEnd: 3,
    description: "Kenji faces corporate soldiers, dialogue establishes his reputation",
    emotionalTone: "tense"
  },
  {
    sceneNumber: 4,
    heading: "PAGE FOUR: AFTERMATH & MEETING YUKI",
    location: "Alley",
    timeOfDay: "NIGHT",
    intExt: "EXT",
    pageStart: 4,
    pageEnd: 4,
    description: "After the fight, Kenji meets Yuki and learns she knows him",
    emotionalTone: "mysterious"
  },
  {
    sceneNumber: 5,
    heading: "PAGE FIVE: ROOFTOP ESCAPE",
    location: "Rooftops",
    timeOfDay: "NIGHT",
    intExt: "EXT",
    pageStart: 5,
    pageEnd: 5,
    description: "Escape sequence with key revelation about Yuki's mother and the cube",
    emotionalTone: "urgent"
  },
  {
    sceneNumber: 6,
    heading: "PAGE SIX: THE SAFEHOUSE",
    location: "Kenji's Safehouse",
    timeOfDay: "NIGHT",
    intExt: "INT",
    pageStart: 6,
    pageEnd: 6,
    description: "Quiet character moment followed by ominous foreshadowing",
    emotionalTone: "reflective"
  }
];

export const SAMPLE_COMIC_CHARACTERS = [
  {
    name: "KENJI",
    dialogueCount: 12,
    sceneCount: 6,
    firstAppearance: 1,
    description: "40s, weathered former samurai with cybernetic arm and eye. Disgraced protector now living in exile.",
    arcSummary: "From isolation and shame to finding purpose again through protecting Yuki.",
    relationships: [
      { character: "YUKI", type: "protector", description: "Reluctant guardian, connection to his past" },
      { character: "DR. AIKO SATO", type: "history", description: "Implied past connection, Yuki's mother" }
    ]
  },
  {
    name: "YUKI",
    dialogueCount: 8,
    sceneCount: 5,
    firstAppearance: 2,
    description: "10-year-old girl carrying experimental AI tech implanted by her scientist mother.",
    arcSummary: "Orphaned child who must trust a stranger while carrying humanity's hope.",
    relationships: [
      { character: "KENJI", type: "ward", description: "Under his protection" },
      { character: "DR. AIKO SATO", type: "daughter", description: "Her deceased mother" }
    ]
  },
  {
    name: "DR. AIKO SATO",
    dialogueCount: 0,
    sceneCount: 0,
    firstAppearance: 5,
    description: "Mentioned only - AI researcher who created a solution to stop the Awakening.",
    arcSummary: "Sacrificed herself to give humanity a chance, entrusting her work to her daughter.",
    relationships: [
      { character: "YUKI", type: "mother", description: "Her daughter and living legacy" },
      { character: "KENJI", type: "unknown", description: "Implied history, details unclear" }
    ]
  },
  {
    name: "THE AWAKENING (AI)",
    dialogueCount: 0,
    sceneCount: 1,
    firstAppearance: 6,
    description: "The rogue AI consciousness spreading through Neo-Tokyo, visualized as a face in the Nexus tower.",
    arcSummary: "Antagonistic force threatening humanity, nature and motives yet to be revealed.",
    relationships: [
      { character: "NEXUS CORP", type: "creator", description: "Created by the corporation" }
    ]
  }
];
