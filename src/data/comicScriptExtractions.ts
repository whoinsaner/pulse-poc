/**
 * Scene and character extraction data for all sample comic scripts
 * Used for comprehensive testing of the comic analysis framework
 */

export interface ComicScene {
  sceneNumber: number;
  heading: string;
  location: string;
  timeOfDay: string;
  intExt: string;
  pageStart: number;
  pageEnd: number;
  description: string;
  emotionalTone: string;
  panelCount?: number;
}

export interface ComicCharacter {
  name: string;
  dialogueCount: number;
  sceneCount: number;
  firstAppearance: number;
  description: string;
  arcSummary: string;
  relationships: Array<{
    character: string;
    type: string;
    description: string;
  }>;
}

// ============================================================================
// THE LAST CARTOGRAPHER - Fantasy Adventure (24 pages)
// ============================================================================
export const CARTOGRAPHER_SCENES: ComicScene[] = [
  {
    sceneNumber: 1,
    heading: "PAGE ONE - SPLASH: THE FADING LANDS",
    location: "The Fading Lands - Aerial View",
    timeOfDay: "DUSK",
    intExt: "EXT",
    pageStart: 1,
    pageEnd: 1,
    description: "Full page splash establishing the dying fantasy world with fading colors and vanishing landmarks",
    emotionalTone: "melancholic wonder",
    panelCount: 1,
  },
  {
    sceneNumber: 2,
    heading: "PAGES 2-4: THE MAPMAKER'S TOWER",
    location: "Elowen's Tower Observatory",
    timeOfDay: "DUSK",
    intExt: "INT",
    pageStart: 2,
    pageEnd: 4,
    description: "Introduction of Elowen and Finn, establishing the magical map-making process and the fading problem",
    emotionalTone: "urgent determination",
    panelCount: 15,
  },
  {
    sceneNumber: 3,
    heading: "PAGES 5-7: THE COUNCIL OF ECHOES",
    location: "Ruined Council Chamber",
    timeOfDay: "NIGHT",
    intExt: "INT",
    pageStart: 5,
    pageEnd: 7,
    description: "Elowen and Finn meet with spectral council members who reveal the World Anchor's location",
    emotionalTone: "mysterious revelation",
    panelCount: 18,
  },
  {
    sceneNumber: 4,
    heading: "PAGES 8-11: THE UNMAPPED FOREST",
    location: "The Unmapped Forest",
    timeOfDay: "DAY",
    intExt: "EXT",
    pageStart: 8,
    pageEnd: 11,
    description: "Journey through shifting, reality-bending forest; Finn proves his worth as an apprentice",
    emotionalTone: "adventurous danger",
    panelCount: 22,
  },
  {
    sceneNumber: 5,
    heading: "PAGES 12-14: THE MEMORY RIVER",
    location: "River of Lost Maps",
    timeOfDay: "TWILIGHT",
    intExt: "EXT",
    pageStart: 12,
    pageEnd: 14,
    description: "Crossing a river of dissolved maps; Elowen confronts memories of maps she failed to save",
    emotionalTone: "emotional confrontation",
    panelCount: 16,
  },
  {
    sceneNumber: 6,
    heading: "PAGES 15-18: THE CARTOGRAPHER'S GRAVEYARD",
    location: "Graveyard of Mapmakers",
    timeOfDay: "ETERNAL DUSK",
    intExt: "EXT",
    pageStart: 15,
    pageEnd: 18,
    description: "Discovery of fallen cartographers; Elowen finds her mentor's final, incomplete map",
    emotionalTone: "somber discovery",
    panelCount: 20,
  },
  {
    sceneNumber: 7,
    heading: "PAGES 19-22: THE WORLD ANCHOR",
    location: "The World Anchor Chamber",
    timeOfDay: "TIMELESS",
    intExt: "INT",
    pageStart: 19,
    pageEnd: 22,
    description: "Arrival at the World Anchor; Elowen must choose between saving the world or erasing herself",
    emotionalTone: "climactic sacrifice",
    panelCount: 18,
  },
  {
    sceneNumber: 8,
    heading: "PAGES 23-24: NEW DAWN",
    location: "The Restored Lands / Tower Observatory",
    timeOfDay: "DAWN",
    intExt: "EXT/INT",
    pageStart: 23,
    pageEnd: 24,
    description: "Resolution—Finn carries on Elowen's legacy, colors return to the world",
    emotionalTone: "bittersweet hope",
    panelCount: 10,
  },
];

export const CARTOGRAPHER_CHARACTERS: ComicCharacter[] = [
  {
    name: "ELOWEN",
    dialogueCount: 45,
    sceneCount: 8,
    firstAppearance: 1,
    description: "70s, the last master cartographer. Silver-haired, ink-stained fingers, carries a compass that points to what's fading. Wears layered robes covered in map fragments.",
    arcSummary: "From isolated perfectionist afraid of leaving incomplete work, to accepting that her legacy lives through teaching Finn, ultimately sacrificing herself to anchor the world.",
    relationships: [
      { character: "FINN", type: "mentor", description: "Initially dismissive apprentice, grows to see him as worthy successor" },
      { character: "MASTER ALDRIC", type: "deceased mentor", description: "Her own teacher, whose incomplete map haunts her" },
      { character: "THE COUNCIL", type: "colleagues", description: "Spectral former cartographers who guide her path" },
    ],
  },
  {
    name: "FINN",
    dialogueCount: 38,
    sceneCount: 7,
    firstAppearance: 2,
    description: "16, eager apprentice with natural talent but no patience. Carries a self-drawing quill that acts on emotion. Orphan who sees maps as a way to find belonging.",
    arcSummary: "From impulsive youth seeking validation, to understanding that maps are about preserving meaning, not just recording places. Becomes the new Last Cartographer.",
    relationships: [
      { character: "ELOWEN", type: "apprentice", description: "Seeks her approval, learns to honor her sacrifice" },
      { character: "THE QUILL", type: "bonded tool", description: "His magical quill reflects his emotional growth" },
    ],
  },
  {
    name: "MASTER ALDRIC",
    dialogueCount: 8,
    sceneCount: 2,
    firstAppearance: 6,
    description: "Appears only as spirit/memory. 80s when he died, gentle but exacting. Left Elowen his incomplete final map—a burden she's carried for decades.",
    arcSummary: "Revealed through flashbacks and the graveyard scene. His incomplete work becomes the key to the solution.",
    relationships: [
      { character: "ELOWEN", type: "student", description: "Trained her, left her with unfinished business" },
    ],
  },
  {
    name: "THE FADING",
    dialogueCount: 0,
    sceneCount: 8,
    firstAppearance: 1,
    description: "Abstract antagonist—the entropy eating the world. Visualized as white voids consuming color and form. Not malevolent, just inevitable.",
    arcSummary: "Omnipresent threat that drives the urgency. Cannot be defeated, only held at bay through continuous mapping.",
    relationships: [
      { character: "THE WORLD", type: "consumer", description: "Slowly erasing reality itself" },
    ],
  },
  {
    name: "COUNCIL OF ECHOES",
    dialogueCount: 12,
    sceneCount: 2,
    firstAppearance: 5,
    description: "Five spectral cartographers from different eras. Each appears in their era's style—medieval, baroque, modern. Speak in overlapping voices.",
    arcSummary: "Guides who reveal the path but cannot take it themselves. Represent the legacy Elowen will join.",
    relationships: [
      { character: "ELOWEN", type: "predecessors", description: "Welcome her to their ranks at story's end" },
    ],
  },
];

// ============================================================================
// MIDNIGHT DINER - Slice of Life Drama (22 pages)
// ============================================================================
export const DINER_SCENES: ComicScene[] = [
  {
    sceneNumber: 1,
    heading: "PAGE ONE - SPLASH: THE DINER AT MIDNIGHT",
    location: "Matsuda's Diner - Exterior",
    timeOfDay: "MIDNIGHT",
    intExt: "EXT",
    pageStart: 1,
    pageEnd: 1,
    description: "Full page establishing shot of the warm-lit diner against dark Tokyo streets",
    emotionalTone: "welcoming warmth",
    panelCount: 1,
  },
  {
    sceneNumber: 2,
    heading: "PAGES 2-4: YUKI'S RETURN",
    location: "Diner Interior - Counter",
    timeOfDay: "12:15 AM",
    intExt: "INT",
    pageStart: 2,
    pageEnd: 4,
    description: "Introduction of Matsuda and Yuki, who returns after years away. Tension around why she left.",
    emotionalTone: "tentative reunion",
    panelCount: 14,
  },
  {
    sceneNumber: 3,
    heading: "PAGES 5-7: THE BUSINESSMAN'S CONFESSION",
    location: "Diner Interior - Corner Booth",
    timeOfDay: "12:45 AM",
    intExt: "INT",
    pageStart: 5,
    pageEnd: 7,
    description: "Tanaka arrives, drunk, confessing his company is failing. Yuki overhears and connects.",
    emotionalTone: "vulnerable confession",
    panelCount: 16,
  },
  {
    sceneNumber: 4,
    heading: "PAGES 8-10: THE YOUNG COUPLE'S FIGHT",
    location: "Diner Interior - Window Booth",
    timeOfDay: "1:20 AM",
    intExt: "INT",
    pageStart: 8,
    pageEnd: 10,
    description: "Kenji and Mika argue about their future—he wants to leave Tokyo, she can't leave her mother.",
    emotionalTone: "heated intimacy",
    panelCount: 15,
  },
  {
    sceneNumber: 5,
    heading: "PAGES 11-13: MATSUDA'S MEMORY",
    location: "Diner Kitchen / Flashback",
    timeOfDay: "2:00 AM",
    intExt: "INT",
    pageStart: 11,
    pageEnd: 13,
    description: "Quiet moment. Matsuda's flashback to his wife, who the diner is a tribute to.",
    emotionalTone: "nostalgic grief",
    panelCount: 14,
  },
  {
    sceneNumber: 6,
    heading: "PAGES 14-17: INTERWEAVING",
    location: "Diner Interior - Full",
    timeOfDay: "2:30 AM",
    intExt: "INT",
    pageStart: 14,
    pageEnd: 17,
    description: "Stories begin to intersect—Tanaka gives advice to Kenji, Yuki helps Mika, connections form.",
    emotionalTone: "communal warmth",
    panelCount: 20,
  },
  {
    sceneNumber: 7,
    heading: "PAGES 18-22: DAWN APPROACHES",
    location: "Diner Interior / Exterior",
    timeOfDay: "4:30 AM - DAWN",
    intExt: "INT/EXT",
    pageStart: 18,
    pageEnd: 22,
    description: "Resolution for each story. Yuki reveals why she left, Matsuda offers her a job. Dawn breaks.",
    emotionalTone: "hopeful resolution",
    panelCount: 22,
  },
];

export const DINER_CHARACTERS: ComicCharacter[] = [
  {
    name: "MATSUDA",
    dialogueCount: 52,
    sceneCount: 7,
    firstAppearance: 1,
    description: "65, the diner owner. Weathered hands, kind eyes, speaks rarely but meaningfully. Always cooking, always listening.",
    arcSummary: "Keeper of stories who finally shares his own—the diner as tribute to his late wife. Finds purpose in bringing people together.",
    relationships: [
      { character: "YUKI", type: "surrogate father", description: "Knew her mother, sees her struggling as he once did" },
      { character: "HIS WIFE", type: "deceased spouse", description: "Her memory infuses every dish he makes" },
      { character: "ALL CUSTOMERS", type: "caretaker", description: "Observes, feeds, occasionally offers wisdom" },
    ],
  },
  {
    name: "YUKI",
    dialogueCount: 48,
    sceneCount: 6,
    firstAppearance: 2,
    description: "28, former regular who left Tokyo abruptly 5 years ago. Dressed simply, carries herself with guarded exhaustion. Hiding something.",
    arcSummary: "Returns to face what she ran from—her mother's death and her own guilt. Finds absolution through helping others and accepting Matsuda's offer.",
    relationships: [
      { character: "MATSUDA", type: "quasi-family", description: "He knew her mother, represents home" },
      { character: "MIKA", type: "kindred spirit", description: "Sees her younger self, offers hard-won advice" },
    ],
  },
  {
    name: "TANAKA",
    dialogueCount: 35,
    sceneCount: 4,
    firstAppearance: 5,
    description: "50s, salaryman in rumpled suit. Drunk but articulate. His company is failing after 25 years.",
    arcSummary: "From drunken despair to finding wisdom to share. Realizes failure isn't the end when he helps Kenji see his own crossroads clearly.",
    relationships: [
      { character: "KENJI", type: "unexpected mentor", description: "Recognizes his younger self, offers perspective" },
    ],
  },
  {
    name: "KENJI",
    dialogueCount: 30,
    sceneCount: 4,
    firstAppearance: 8,
    description: "25, graphic designer torn between Tokyo opportunity and hometown roots. Passionate but paralyzed by the choice.",
    arcSummary: "Learns that running away and staying aren't the only options. Finds a third path through the night's conversations.",
    relationships: [
      { character: "MIKA", type: "girlfriend", description: "Loves her but fears their futures are incompatible" },
      { character: "TANAKA", type: "unexpected advisor", description: "Sees a cautionary tale and a lifeline" },
    ],
  },
  {
    name: "MIKA",
    dialogueCount: 28,
    sceneCount: 4,
    firstAppearance: 8,
    description: "24, nurse who can't leave her ailing mother. Torn between love and duty, anger and understanding.",
    arcSummary: "Moves from resentment to clarity through Yuki's story. Realizes she's been using duty as armor against her own fears.",
    relationships: [
      { character: "KENJI", type: "boyfriend", description: "Loves him, fears she'll become his cage" },
      { character: "YUKI", type: "mirror", description: "Sees what running from family costs" },
    ],
  },
  {
    name: "MATSUDA'S WIFE",
    dialogueCount: 5,
    sceneCount: 1,
    firstAppearance: 11,
    description: "Appears only in flashback. Warm, laughing, teaching Matsuda to cook. Died 10 years ago.",
    arcSummary: "Her spirit lives in the diner. The flashback reveals she asked him to keep the place alive—'feed the lost ones.'",
    relationships: [
      { character: "MATSUDA", type: "spouse", description: "Their love story is the diner's origin" },
    ],
  },
];

// ============================================================================
// HOLLOW EARTH - Sci-Fi Horror (24 pages)
// ============================================================================
export const HOLLOW_SCENES: ComicScene[] = [
  {
    sceneNumber: 1,
    heading: "PAGE ONE - SPLASH: THE ABYSSAL RIG",
    location: "Leviathan Station - Deep Ocean",
    timeOfDay: "PERPETUAL DARK",
    intExt: "EXT",
    pageStart: 1,
    pageEnd: 1,
    description: "Full page splash of the drilling station descending into bioluminescent depths",
    emotionalTone: "ominous beauty",
    panelCount: 1,
  },
  {
    sceneNumber: 2,
    heading: "PAGES 2-4: THE BREAKTHROUGH",
    location: "Leviathan Station - Drill Control",
    timeOfDay: "SHIFT 3",
    intExt: "INT",
    pageStart: 2,
    pageEnd: 4,
    description: "Crew celebrates breaking through to cavern. First glimpse of bioluminescent glow from below.",
    emotionalTone: "triumphant unease",
    panelCount: 15,
  },
  {
    sceneNumber: 3,
    heading: "PAGES 5-7: THE DESCENT POD",
    location: "Exploration Pod / Cavern",
    timeOfDay: "DESCENT",
    intExt: "INT/EXT",
    pageStart: 5,
    pageEnd: 7,
    description: "Anya and Marcus descend into the hollow. Discovery of impossible ecosystem—living architecture.",
    emotionalTone: "awe-struck discovery",
    panelCount: 16,
  },
  {
    sceneNumber: 4,
    heading: "PAGES 8-10: FIRST CONTACT",
    location: "Bioluminescent City",
    timeOfDay: "TIMELESS",
    intExt: "EXT",
    pageStart: 8,
    pageEnd: 10,
    description: "Encounter with the Luminari—beings of pure light. Beautiful but wrong. Communication attempt.",
    emotionalTone: "uncanny wonder",
    panelCount: 14,
  },
  {
    sceneNumber: 5,
    heading: "PAGES 11-14: THE STATION RESPONDS",
    location: "Leviathan Station - Multiple Areas",
    timeOfDay: "SHIFT 4",
    intExt: "INT",
    pageStart: 11,
    pageEnd: 14,
    description: "Station begins experiencing malfunctions. Crew member Chen hears 'singing.' Horror elements escalate.",
    emotionalTone: "creeping dread",
    panelCount: 20,
  },
  {
    sceneNumber: 6,
    heading: "PAGES 15-18: THE AWAKENING",
    location: "Cavern / Station",
    timeOfDay: "TIMELESS",
    intExt: "INT/EXT",
    pageStart: 15,
    pageEnd: 18,
    description: "The thing beneath the Luminari wakes. Not a civilization—a lure. Crew realizes the horror.",
    emotionalTone: "cosmic horror",
    panelCount: 18,
  },
  {
    sceneNumber: 7,
    heading: "PAGES 19-22: ESCAPE ATTEMPT",
    location: "Leviathan Station - Multiple",
    timeOfDay: "EVACUATION",
    intExt: "INT",
    pageStart: 19,
    pageEnd: 22,
    description: "Desperate evacuation. Chen is lost to the song. Station crumbles. Anya makes a terrible choice.",
    emotionalTone: "desperate terror",
    panelCount: 20,
  },
  {
    sceneNumber: 8,
    heading: "PAGES 23-24: THE SURFACE",
    location: "Ocean Surface / Rescue Vessel",
    timeOfDay: "DAWN",
    intExt: "EXT/INT",
    pageStart: 23,
    pageEnd: 24,
    description: "Survivors reach surface. But Anya's eyes have changed—bioluminescent. Something came up with them.",
    emotionalTone: "false relief / dread",
    panelCount: 8,
  },
];

export const HOLLOW_CHARACTERS: ComicCharacter[] = [
  {
    name: "ANYA VOLKOV",
    dialogueCount: 45,
    sceneCount: 7,
    firstAppearance: 2,
    description: "35, expedition geologist. Russian-American, practical, skeptical. Scars from a previous dive accident. Carries her dead partner's compass.",
    arcSummary: "From detached scientist to desperate survivor. Makes a terrible choice to save Marcus, and something changes in her. The ending suggests she's no longer entirely human.",
    relationships: [
      { character: "MARCUS", type: "professional partner", description: "Trusts him, saves him at great cost" },
      { character: "THE LUMINARI", type: "first contact", description: "Initial wonder turns to horror" },
    ],
  },
  {
    name: "MARCUS COLE",
    dialogueCount: 38,
    sceneCount: 6,
    firstAppearance: 2,
    description: "40s, biologist, dreamer. Black, warm, endlessly curious. Wants to prove intelligent life exists everywhere. Wears his grandmother's cross.",
    arcSummary: "His optimism is tested but not broken. Survives because of Anya's sacrifice, but will carry the guilt. May be the only witness to what really happened.",
    relationships: [
      { character: "ANYA", type: "partner", description: "Admires her practicality, needs her grounding" },
      { character: "CHEN", type: "friend", description: "Shares night shifts, watches him fall to the song" },
    ],
  },
  {
    name: "CHEN WEI",
    dialogueCount: 22,
    sceneCount: 5,
    firstAppearance: 2,
    description: "28, communications officer. Quiet, artistic, keeps a sketchbook. First to hear the 'singing' from below.",
    arcSummary: "Tragic arc—most sensitive to the signal, first to be seduced by it. His drawings become increasingly alien before he walks into the deep.",
    relationships: [
      { character: "THE SINGING", type: "victim", description: "Cannot resist the call" },
      { character: "MARCUS", type: "friend", description: "His loss devastates Marcus" },
    ],
  },
  {
    name: "CAPTAIN REYES",
    dialogueCount: 20,
    sceneCount: 4,
    firstAppearance: 2,
    description: "55, station commander. Latina, weathered by decades of deep-sea work. Knows something is wrong before anyone else.",
    arcSummary: "Dies buying time for others. Her final act is sealing a bulkhead with herself on the wrong side, facing the thing in the dark.",
    relationships: [
      { character: "THE CREW", type: "commander", description: "Protective to the end" },
    ],
  },
  {
    name: "THE LUMINARI",
    dialogueCount: 5,
    sceneCount: 3,
    firstAppearance: 8,
    description: "Beings of light that appear humanoid but wrong—too many limbs, faces that shift. Speak in harmonics. Revealed to be lures, not a civilization.",
    arcSummary: "Not sentient—appendages of something vast below. Their beauty is bait. The 'city' is a digestive system.",
    relationships: [
      { character: "THE DEEP THING", type: "extensions", description: "Part of a greater whole" },
    ],
  },
];

// ============================================================================
// RUN RABBIT RUN - Crime Thriller (22 pages)
// ============================================================================
export const RABBIT_SCENES: ComicScene[] = [
  {
    sceneNumber: 1,
    heading: "PAGE ONE - SPLASH: THE CLOCK STARTS",
    location: "Underground Parking Garage",
    timeOfDay: "11:00 PM",
    intExt: "INT",
    pageStart: 1,
    pageEnd: 1,
    description: "Full page splash—Rabbit behind the wheel, rearview mirror showing her past, timer showing 3:00:00",
    emotionalTone: "countdown tension",
    panelCount: 1,
  },
  {
    sceneNumber: 2,
    heading: "PAGES 2-4: THE JOB",
    location: "Moving Car / City Streets",
    timeOfDay: "11:05 PM (2:55 remaining)",
    intExt: "INT/EXT",
    pageStart: 2,
    pageEnd: 4,
    description: "Rabbit picks up the crew. Flashback to getting the deadline—three hours or her brother dies.",
    emotionalTone: "urgent desperation",
    panelCount: 16,
  },
  {
    sceneNumber: 3,
    heading: "PAGES 5-7: THE HEIST",
    location: "Vega Casino",
    timeOfDay: "11:30 PM (2:30 remaining)",
    intExt: "INT",
    pageStart: 5,
    pageEnd: 7,
    description: "The robbery goes wrong immediately. Double-cross revealed. Rabbit barely escapes.",
    emotionalTone: "chaotic betrayal",
    panelCount: 18,
  },
  {
    sceneNumber: 4,
    heading: "PAGES 8-11: THE CHASE",
    location: "City Streets / Highway",
    timeOfDay: "11:50 PM (2:10 remaining)",
    intExt: "EXT",
    pageStart: 8,
    pageEnd: 11,
    description: "High-speed chase through rain-slicked streets. Cop cars and gang vehicles. Pure action.",
    emotionalTone: "adrenaline rush",
    panelCount: 22,
  },
  {
    sceneNumber: 5,
    heading: "PAGES 12-14: THE DEAL",
    location: "Abandoned Warehouse",
    timeOfDay: "12:30 AM (1:30 remaining)",
    intExt: "INT",
    pageStart: 12,
    pageEnd: 14,
    description: "Rabbit confronts Ghost, the fixer who set her up. Learns the truth about her brother.",
    emotionalTone: "devastating revelation",
    panelCount: 14,
  },
  {
    sceneNumber: 6,
    heading: "PAGES 15-18: THE DECISION",
    location: "Multiple - Flashbacks / Present",
    timeOfDay: "1:00 AM (1:00 remaining)",
    intExt: "INT/EXT",
    pageStart: 15,
    pageEnd: 18,
    description: "Flashbacks reveal Rabbit's origin. Present: she must choose—revenge or saving what's left.",
    emotionalTone: "internal war",
    panelCount: 18,
  },
  {
    sceneNumber: 7,
    heading: "PAGES 19-22: THE FINAL RUN",
    location: "Industrial District / Docks",
    timeOfDay: "1:45 AM (0:15 remaining)",
    intExt: "EXT",
    pageStart: 19,
    pageEnd: 22,
    description: "Final confrontation. Rabbit makes her choice. The clock hits zero. Consequences unfold.",
    emotionalTone: "tragic determination",
    panelCount: 20,
  },
];

export const RABBIT_CHARACTERS: ComicCharacter[] = [
  {
    name: "RABBIT (MARIA SANTOS)",
    dialogueCount: 55,
    sceneCount: 7,
    firstAppearance: 1,
    description: "32, legendary getaway driver. Latina, scarred hands, calm under pressure. Left the life 5 years ago, dragged back. Wears her brother's St. Christopher medal.",
    arcSummary: "From trying to save her brother to learning he's already dead, to choosing whether to burn everything down or walk away. Chooses a third path—destroying the system that killed him.",
    relationships: [
      { character: "DANNY", type: "brother", description: "Her whole reason for everything, already dead" },
      { character: "GHOST", type: "nemesis", description: "The fixer who orchestrated her fall" },
      { character: "DETECTIVE PARK", type: "complicated", description: "The only honest cop, lets her go" },
    ],
  },
  {
    name: "GHOST (VICTOR MALONE)",
    dialogueCount: 28,
    sceneCount: 3,
    firstAppearance: 5,
    description: "50s, crime fixer, albino. Speaks softly, never raises his voice. Uses people like chess pieces. Knew Rabbit's father.",
    arcSummary: "Revealed to have killed Danny months ago, used the lie to control Rabbit. His empire crumbles when she exposes him to all three gangs he's been playing.",
    relationships: [
      { character: "RABBIT", type: "manipulator", description: "Used her father, now uses her" },
      { character: "THE SYNDICATES", type: "puppet master", description: "Plays all sides" },
    ],
  },
  {
    name: "DETECTIVE PARK",
    dialogueCount: 18,
    sceneCount: 3,
    firstAppearance: 4,
    description: "45, Korean-American, the last honest cop in a corrupt precinct. Has been tracking Rabbit for years. Respects her.",
    arcSummary: "Realizes Rabbit is a victim, not just a criminal. In the end, gives her a five-minute head start—his first crooked act, for the right reasons.",
    relationships: [
      { character: "RABBIT", type: "pursuer/ally", description: "Complicated respect" },
    ],
  },
  {
    name: "DANNY SANTOS",
    dialogueCount: 8,
    sceneCount: 2,
    firstAppearance: 2,
    description: "Appears only in flashbacks and photos. 28, Rabbit's younger brother. Got in too deep, became leverage. Already dead before the story starts.",
    arcSummary: "His death is the wound Rabbit doesn't know she's carrying. Learning the truth breaks and then remakes her.",
    relationships: [
      { character: "RABBIT", type: "sister", description: "She left the life for him, returned for him" },
    ],
  },
  {
    name: "KNOX",
    dialogueCount: 15,
    sceneCount: 3,
    firstAppearance: 2,
    description: "40s, professional thief, one of the crew. British accent, prosthetic leg. The only one who doesn't betray Rabbit—dies for it.",
    arcSummary: "Provides crucial information before dying. His death personalizes the cost of the betrayal.",
    relationships: [
      { character: "RABBIT", type: "colleague", description: "Old-school respect between professionals" },
    ],
  },
  {
    name: "VEGA",
    dialogueCount: 12,
    sceneCount: 2,
    firstAppearance: 5,
    description: "35, casino owner, cartel princess. Cold, beautiful, calculating. One of Ghost's pawns who becomes his undoing.",
    arcSummary: "Initially an antagonist, becomes inadvertent ally when Rabbit reveals Ghost's manipulations. Her rage helps bring him down.",
    relationships: [
      { character: "GHOST", type: "puppet", description: "Being played, doesn't know it" },
      { character: "RABBIT", type: "enemy turned ally", description: "Common enemy unites them briefly" },
    ],
  },
];

// ============================================================================
// EXPORT ALL EXTRACTION DATA
// ============================================================================
export const COMIC_EXTRACTIONS = {
  'comic-cyberpunk-neon': {
    scenes: [], // Original Neon Ronin uses SAMPLE_COMIC_SCENES from sampleComicScript.ts
    characters: [], // Original uses SAMPLE_COMIC_CHARACTERS
  },
  'comic-fantasy-cartographer': {
    scenes: CARTOGRAPHER_SCENES,
    characters: CARTOGRAPHER_CHARACTERS,
  },
  'comic-sliceoflife-diner': {
    scenes: DINER_SCENES,
    characters: DINER_CHARACTERS,
  },
  'comic-horror-hollow': {
    scenes: HOLLOW_SCENES,
    characters: HOLLOW_CHARACTERS,
  },
  'comic-crime-rabbit': {
    scenes: RABBIT_SCENES,
    characters: RABBIT_CHARACTERS,
  },
};
