/**
 * Sample scripts for demonstrating the analysis framework
 * These are representative excerpts from various genres and formats
 */

export interface SampleScriptData {
  id: string;
  title: string;
  genre: string;
  scriptType: 'feature' | 'pilot' | 'episode' | 'short' | 'documentary' | 'comic';
  logline: string;
  pageCount: number;
  content: string;
}

export const SAMPLE_SCRIPTS: SampleScriptData[] = [
  {
    id: 'noir-detective',
    title: 'The Last Confession',
    genre: 'Neo-Noir Thriller',
    scriptType: 'feature',
    logline: 'A disgraced priest turned private detective must solve a murder in his former parish, confronting the sins of his past.',
    pageCount: 112,
    content: `FADE IN:

EXT. ST. MICHAEL'S CHURCH - NIGHT

Rain hammers the Gothic spires. A lone figure, FATHER MARCUS COLE (50s), weathered face, haunted eyes, stands at the bottom of the steps. He hasn't worn the collar in five years.

MARCUS (V.O.)
They say God never gives you more than you can handle. They're wrong.

INT. ST. MICHAEL'S CHURCH - CONFESSIONAL - NIGHT

Marcus sits in the priest's booth. Old habits. Through the lattice, a woman's silhouette.

WOMAN
Forgive me, Father, for I have sinned.

MARCUS
I'm not a priest anymore.

WOMAN
Then this isn't a confession. It's a warning.

She slides something through the partition. A photograph. Marcus holds it up to the dim light - a body, posed like a Renaissance painting. The victim: FATHER THOMAS BRENNAN.

MARCUS
Tommy...

WOMAN
They'll come for you next. Unless you find them first.

The booth on the other side creaks open. Empty. She's gone.

EXT. MARCUS'S APARTMENT - ROOFTOP - LATER

Marcus stands at the edge, looking out over the city. He pulls a flask, drinks deep.

DETECTIVE SARAH VANCE (40s), sharp suit, sharper eyes, emerges from the roof access door.

VANCE
Knew I'd find you up here. Heard you got a visitor tonight.

MARCUS
Your surveillance budget at work.

VANCE
Tom Brennan was found this morning. Same pose as the others.

MARCUS
The Pieta Killer.

VANCE
Three victims. All connected to St. Michael's. All from your time there.

Marcus turns. For the first time, we see fear in his eyes.

MARCUS
What do you want, Sarah?

VANCE
Consult on the case. Off the books.

MARCUS
I left that world.

VANCE
The world didn't leave you.

She drops a file folder at his feet. Crime scene photos spill out.

VANCE (CONT'D)
Read the file. Then tell me you can walk away.

She leaves. Marcus picks up a photo. His hands shake.

INT. MARCUS'S APARTMENT - NIGHT

Spartan. A single crucifix on the wall - turned backward. Marcus spreads the photos on his desk.

MARCUS (V.O.)
Three bodies. Three friends. Three secrets we swore would die with us.

He opens his laptop. Searches: "St. Michael's Choir Scandal 2007"

The screen glows in the darkness.

MARCUS (V.O.) (CONT'D)
Someone is making us pay for our sins. Question is: who knows what we did?

He picks up his phone. Dials.

MARCUS
It's Marcus. I need to see the Bishop. Tonight.

INT. BISHOP'S RESIDENCE - STUDY - NIGHT

Opulent. Books line every wall. BISHOP PATRICK O'REILLY (70s), silver hair, politician's smile, pours whiskey.

BISHOP
Marcus Cole. The prodigal son returns.

MARCUS
Someone's killing us, Patrick.

BISHOP
Killing who, exactly?

MARCUS
Don't play games. You know what we covered up.

The Bishop's smile fades.

BISHOP
That was a long time ago.

MARCUS
Tell that to Tom Brennan.

Marcus slaps down the crime scene photo. The Bishop doesn't flinch.

BISHOP
I've seen it. The police came this morning.

MARCUS
And what did you tell them?

BISHOP
The truth. That I'm a man of God who knew nothing of Father Brennan's personal troubles.

MARCUS
That's not the truth.

BISHOP
It's the only truth that matters.

He picks up the photo, studies it with clinical detachment.

BISHOP (CONT'D)
You left the Church, Marcus. You lost the right to judge me.

MARCUS
I left because staying meant becoming you.

BISHOP
Then why are you here?

MARCUS
Because whoever's doing this... they want more than blood. They want confession.

BISHOP
Then give them one.

MARCUS
Not mine. Yours.

Marcus stands, moves to leave.

MARCUS (CONT'D)
I'm going to find them. And when I do, the truth comes out. All of it.

BISHOP
You'd destroy the Church?

MARCUS
The Church destroyed itself. I'm just turning over the stones.

He's at the door.

BISHOP
Marcus.

Marcus turns.

BISHOP (CONT'D)
Be careful what you confess. Some sins can't be forgiven.

EXT. CEMETERY - DAY

Marcus stands before three graves. Recent flowers on one - Tom Brennan's.

SARAH (O.S.)
You knew them all.

She walks up beside him.

MARCUS
Seminary. We were the "Four Horsemen." Young, idealistic, ready to save the world.

SARAH
What happened?

MARCUS
We learned the world doesn't want saving.

He kneels, touches Tom's headstone.

MARCUS (CONT'D)
Someone's making us pay for what we did in '07.

SARAH
What did you do?

Long pause. The rain starts again.

MARCUS
We protected a monster. And an innocent boy paid the price.

END OF ACT ONE`
  },
  {
    id: 'scifi-pilot',
    title: 'The Meridian Protocol',
    genre: 'Science Fiction',
    scriptType: 'pilot',
    logline: 'In 2147, a quantum physicist discovers her dead daughter is alive in a parallel timeline, launching a forbidden mission that could collapse both realities.',
    pageCount: 58,
    content: `FADE IN:

INT. QUANTUM RESEARCH LAB - NIGHT

Holographic equations float in the air. DR. ELENA VASQUEZ (45), fierce intelligence, deeper grief, works alone. On her desk, a photo: a smiling girl, MAYA (12).

ELENA (V.O.)
The universe isn't a straight line. It's a tree. Every choice, every possibility - another branch.

She manipulates the equations. They shift, revealing something new.

ELENA (V.O.) (CONT'D)
For ten years, I've been trying to prove it. Not for science. For her.

The hologram stabilizes. A reading spikes. Elena freezes.

ELENA
No. That's impossible.

She runs another calculation. Same result.

ELENA (CONT'D)
(whispering)
Maya?

SUPER: "36 HOURS EARLIER"

INT. VASQUEZ HOME - MORNING

Modern. Cold. Elena eats breakfast alone. News plays on the wall screen.

NEWS ANCHOR (V.O.)
...the Meridian Corporation celebrates the tenth anniversary of the Quantum Stability Act, which banned all inter-dimensional research following the Geneva Incident...

Elena's jaw tightens.

ELENA
(to screen)
Mute.

Her assistant, DR. JAMES CHEN (30s), appears in a hologram.

JAMES
Dr. Vasquez, the committee's waiting.

ELENA
Tell them I'll be late.

JAMES
You said that yesterday. And the day before.

ELENA
James. What did Maya always say about patience?

JAMES
(softening)
"Patience is just stubbornness with a better attitude."

ELENA
(small smile)
I'm being stubborn.

JAMES
The funding review is in three hours. Meridian has observers there.

ELENA
Let them watch. We have nothing to hide.

She ends the call. Looks at Maya's photo.

ELENA (CONT'D)
Not yet.

INT. FEDERAL SCIENCE MINISTRY - HEARING ROOM - DAY

A tribunal. Elena faces five BOARD MEMBERS. Behind them, a representative from MERIDIAN CORP watches impassively.

BOARD CHAIR
Dr. Vasquez, your research budget has tripled in five years. Yet your published findings have decreased by sixty percent.

ELENA
Theoretical physics isn't retail. We don't produce on demand.

BOARD MEMBER #2
Your colleagues have concerns. They say you're obsessed with forbidden research.

ELENA
My colleagues are afraid.

BOARD CHAIR
Of what?

ELENA
Of the truth. That the Geneva Incident wasn't an accident. It was a success.

Murmurs. The Meridian observer leans forward.

MERIDIAN OBSERVER
Dr. Vasquez, this board is well aware of your personal tragedy. Perhaps—

ELENA
Don't.

MERIDIAN OBSERVER
—it would be wise to take a leave of absence.

ELENA
I lost my daughter to a drunk driver ten years ago. I lost my husband to grief. What I have left is my work.

BOARD CHAIR
Work that skirts the boundaries of international law.

ELENA
The boundaries are wrong.

She stands, pulls up a holographic display.

ELENA (CONT'D)
I've spent a decade mapping quantum signatures across dimensional barriers. The math is clear: the multiverse isn't theoretical. It's accessible.

BOARD MEMBER #2
That research is illegal.

ELENA
Discovery isn't illegal. Application is. And I haven't applied anything. Yet.

The Meridian observer stands.

MERIDIAN OBSERVER
This hearing is concluded.

BOARD CHAIR
Meridian doesn't—

MERIDIAN OBSERVER
We fund this ministry. This hearing. Is concluded.

Tension. The Board Chair nods.

BOARD CHAIR
Dr. Vasquez, your funding is suspended pending review. You're ordered to surrender all research data within 48 hours.

Elena's face hardens.

ELENA
You can have my data. But you can't have my mind.

INT. QUANTUM RESEARCH LAB - NIGHT

Elena works frantically. Downloading files. Running calculations. James bursts in.

JAMES
They're coming. Meridian security. Ten minutes out.

ELENA
I just need five more.

JAMES
Elena, they'll arrest you.

ELENA
(not stopping)
Then I'll work faster.

She uploads something to a hidden server. The equations coalesce.

ELENA (CONT'D)
There. I found her.

JAMES
Found who?

Elena turns, tears in her eyes but smiling.

ELENA
Maya. She's alive, James. In another timeline. And I know how to get there.

JAMES
That's... that's not possible.

ELENA
Everything's possible. That's what the multiverse means.

Alarms blare. Red lights flash.

SECURITY OFFICER (O.S.)
(over intercom)
Dr. Vasquez, this is Meridian Security. Step away from your equipment.

Elena grabs a small device from her desk. Pockets it.

ELENA
(to James)
When I'm gone, leak the research. All of it. Let the world know what's possible.

JAMES
Where are you going?

ELENA
To get my daughter back.

She activates the device. The room fills with light—

CUT TO BLACK.

ELENA (V.O.)
They told me I was mad. That grief had broken me. Maybe it did. But sometimes you have to break before you can rebuild.

FADE IN:

EXT. CITY STREET - DAY - ALTERNATE TIMELINE

Elena stands in the middle of a familiar street. But everything's different. Cleaner. Brighter. A GIRL walks toward her—

MAYA, alive, healthy, twelve years old.

Elena sinks to her knees.

MAYA
(curious)
Are you okay, ma'am?

ELENA
(barely breathing)
Maya...

Maya smiles, confused but kind.

MAYA
Do I know you?

ELENA
(breaking)
You... you have no idea.

END OF PILOT`
  },
  {
    id: 'drama-short',
    title: 'Last Light',
    genre: 'Drama',
    scriptType: 'short',
    logline: 'A grandfather with dementia has one lucid hour to share a lifetime of secrets with the granddaughter he no longer remembers.',
    pageCount: 18,
    content: `FADE IN:

INT. NURSING HOME - ROOM 214 - SUNSET

Golden light filters through thin curtains. HENRY (82) sits in a wheelchair, facing the window. His face is slack, eyes distant.

MAYA (28) enters carrying flowers. She's been crying recently but hides it well.

MAYA
Hi, Grandpa. It's me.

No response. She places the flowers by his bed.

MAYA (CONT'D)
Dr. Chen said you had a good day today. That you asked about Mom.

She pulls a chair beside him. Takes his hand.

MAYA (CONT'D)
Mom's fine, by the way. She wanted to come but... you know how she gets.

Henry's hand twitches. His eyes blink. Focus.

HENRY
(slowly)
Maya?

Maya startles. He hasn't recognized her in eight months.

MAYA
Grandpa?

HENRY
(stronger)
What are you doing here? You should be at the gallery. Your show opens tonight.

MAYA
(stunned)
How did you—

HENRY
I read it in the paper. My granddaughter, the artist. Finally made it.

He smiles. A real smile. Something awakens behind his eyes.

HENRY (CONT'D)
What time is it?

MAYA
Almost seven.

HENRY
(suddenly urgent)
Listen to me. I don't have long. The doctors call it "sundowning." As night comes, I... I go away again.

MAYA
Grandpa—

HENRY
Please. Just listen.

He grips her hand with surprising strength.

HENRY (CONT'D)
There are things I need to tell you. Things I never said because I was afraid. Or stupid. Or both.

MAYA
We have time.

HENRY
(shaking head)
An hour, maybe less. And I've wasted so much time already.

He looks at her with complete clarity. Complete love.

HENRY (CONT'D)
Your paintings. I've seen them all. Every one. I know you think I never understood, but I did. You paint pain, Maya. You always have. And I know where it comes from.

Maya's eyes fill with tears.

HENRY (CONT'D)
It comes from me. From our family. From the things we never talked about.

MAYA
(whispers)
Like what?

HENRY
Like how your grandmother really died. Like why your mother is the way she is. Like why you stopped visiting me the year you turned fifteen.

Maya pulls her hand back.

MAYA
I don't want to—

HENRY
I know what he did. Your uncle Frank.

The words hang in the air. Maya can't breathe.

HENRY (CONT'D)
I knew, and I did nothing. Because he was my son, and I was a coward.

MAYA
(breaking)
Why are you telling me this now?

HENRY
Because I won't remember tomorrow. And you need to hear that it wasn't your fault. None of it. Ever.

He reaches for her. She hesitates. Then lets him take her hand.

HENRY (CONT'D)
I am so sorry, Maya. For all of it.

Long silence. Outside, the light is fading.

MAYA
I used to dream about this. You, lucid. Finally saying the things you never said.

HENRY
And now?

MAYA
Now I don't know if I can forgive you.

HENRY
(nodding)
That's fair.

MAYA
But I'm glad you said it. I'm glad you remember.

HENRY
I've always remembered. Even when I can't remember. You understand?

She doesn't. But she wants to.

HENRY (CONT'D)
The disease takes my words, my names, my moments. But it can't take what I feel. The love. The guilt. They stay. They're always there.

MAYA
(softly)
That sounds like hell.

HENRY
(small laugh)
It is. But you're here. And for one more sunset, I know who you are.

He squeezes her hand.

HENRY (CONT'D)
Tell me about your painting. The one in the show.

MAYA
It's called "Last Light."

HENRY
What's it about?

MAYA
(pause)
It's about you, Grandpa. It's always been about you.

Henry's eyes glisten. The last sunlight catches them.

HENRY
Then I'll see it. Somehow. Even if I forget tomorrow.

MAYA
How?

HENRY
Because some things the heart remembers when the mind cannot.

The light dims. His grip loosens. His eyes start to drift.

MAYA
(urgent)
Grandpa? Stay with me.

HENRY
(fading)
I'm... I'm trying...

His voice trails off. The sharpness leaves his eyes. He looks at her, but doesn't see.

HENRY (CONT'D)
(confused)
Do I... know you?

Maya squeezes his hand. Tears fall.

MAYA
Yes, Grandpa. You do.

She kisses his forehead.

MAYA (CONT'D)
And I forgive you.

He doesn't respond. But somehow, his face seems more peaceful.

EXT. NURSING HOME - NIGHT

Maya walks to her car. Pauses. Looks up at his window. The light turns off.

She gets in her car. On the seat beside her: a gallery invitation. She picks it up.

INSERT - INVITATION: "LAST LIGHT - A Solo Exhibition by Maya Chen"

Back to Maya. She wipes her tears. Starts the car.

FADE OUT.

THE END`
  },
  {
    id: 'horror-feature',
    title: 'The Hollow Hour',
    genre: 'Psychological Horror',
    scriptType: 'feature',
    logline: 'A sleep researcher discovers that the moment between waking and sleeping opens a doorway to an entity that feeds on human consciousness.',
    pageCount: 98,
    content: `FADE IN:

INT. SLEEP RESEARCH LAB - NIGHT

Banks of monitors display brain wave patterns. DR. NORA BISHOP (38), brilliant but exhausted, watches a SUBJECT (20s) sleeping in an isolation chamber.

The EEG readings spike abnormally.

NORA
(to herself)
There it is again. The gap.

She zooms in on the reading. Between awake and asleep - a momentary flatline. Then something else. A pattern that shouldn't exist.

ASSISTANT MAYA (25) enters with coffee.

MAYA
Subject 23's hour is up.

NORA
Look at this.

Maya examines the screen. Frowns.

MAYA
That's not possible. The brain doesn't just... stop.

NORA
It's not stopping. It's going somewhere else.

In the chamber, the subject's eyes snap open. They're completely black.

INT. NORA'S APARTMENT - LATER

Nora reviews footage on her laptop. The subject, now awake and normal, being interviewed.

SUBJECT (ON SCREEN)
I don't remember anything. Just... darkness. And something watching.

Nora pauses the video. Looks at her own reflection in the dark part of the screen.

Something moves behind her.

She spins. Nothing there.

Her phone buzzes: "MAYA: Subject 23 won't stop screaming. Come now."

INT. HOSPITAL - PSYCHIATRIC WARD - NIGHT

Subject 23, DAVID, is strapped to a bed. He's not screaming anymore. He's completely catatonic.

MAYA
He's been like this for an hour. Brain activity is minimal.

NORA
What did he see?

MAYA
He kept saying the same thing before he went quiet.

NORA
What?

MAYA
"It followed me back."

Nora looks at David. His eyes are open. Staring at nothing. Or something she can't see.

NORA
I want all his sleep data from the past month. Everything.

INT. SLEEP RESEARCH LAB - NIGHT

Nora works alone. Monitors surround her, displaying dozens of EEG patterns. All show the same anomaly - the gap.

NORA (V.O.)
Every subject. Same pattern. Same gap. Like a door that opens when consciousness shifts.

She pulls up historical records. The gap appears in research from the 1950s. The 1920s. Medieval writings on "the hour of the wolf."

NORA (V.O.) (CONT'D)
People have been seeing this for centuries. They just didn't know what they were looking at.

Her screen glitches. Static. Then words appear:

"CLOSE YOUR EYES, NORA"

She stares at the screen. Types back: "WHO IS THIS?"

The reply: "THE ONE WHO WAITS IN THE GAP"

The lights flicker. Her coffee cup slides across the desk on its own.

A voice, like static given form:

VOICE
You opened the door. Now I'm here.

Nora stands. The room is empty. But something is very wrong with the shadows.

VOICE (CONT'D)
Every night, you come close. Every night, you hesitate. Why do you fear sleep, Nora?

NORA
(forcing calm)
What are you?

VOICE
What lives between. What feeds on the crossing. You'll understand soon. When you sleep.

NORA
I won't.

VOICE
(almost amused)
Everyone sleeps eventually.

The monitors explode in a shower of sparks. Darkness.

When the backup lights come on, words are carved into the wall:

"I'LL BE WAITING"

INT. NORA'S OFFICE - DAY

Nora hasn't slept in 52 hours. Track marks show where she's injected herself with stimulants.

DR. JAMES CHEN (50s), department head, enters.

CHEN
Nora, you look terrible.

NORA
I need access to the old files. The 1952 Bridgeport Experiments.

CHEN
Those are classified.

NORA
James, please. Something happened in this lab. Something they covered up.

CHEN
(lowering voice)
I know about the Bridgeport files. Seven researchers died.

NORA
How?

CHEN
They wouldn't wake up. Coma, technically. But their brains showed activity - nightmares on loop for months until their bodies gave out.

NORA
What did they find?

CHEN
(pause)
They called it "the Hollow." A space between consciousness and unconsciousness. A place where something lives. Something hungry.

NORA
It's not a place. It's a doorway. And our research has been holding it open.

Chen sits heavily.

CHEN
Nora, what happened to you?

NORA
It spoke to me. Last night. It knows my name.

CHEN
That's... that's not possible.

NORA
I need the files, James. I need to know how to close the door.

He reaches into his desk. Pulls out a flash drive.

CHEN
They sent me this when I took over. Told me never to open it unless someone "woke up."

He hands it to her.

CHEN (CONT'D)
Whatever's on there... it scared the hell out of people who don't scare easy.

INT. NORA'S APARTMENT - NIGHT

Nora plugs in the drive. Files flood her screen. Black and white photographs. Audio recordings. Handwritten notes.

She opens an audio file labeled "FINAL INTERVIEW - DR. HARRIET COLE"

HARRIET (V.O.)
(old recording, scratchy)
We found the gap in 1951. Thought it was just noise in the data. But it wasn't noise. It was a window. And something was looking through.

Sound of heavy breathing.

HARRIET (V.O.) (CONT'D)
We tried to close it. We couldn't. Every time a human consciousness crosses the threshold of sleep... it opens again. Wider each time.

INTERVIEWER (V.O.)
What did you see, Dr. Cole?

HARRIET (V.O.)
Not see. Feel. It doesn't have form. It's just... hunger. Ancient, patient hunger. It feeds on consciousness. On dreams. On us.

INTERVIEWER (V.O.)
How do we stop it?

HARRIET (V.O.)
(long pause)
You don't sleep. Or you never wake up.

Recording ends. Nora stares at her coffee cup. Her hands are shaking.

Her phone buzzes. A text from an unknown number:

"72 HOURS NOW. YOUR BODY WILL FORCE SLEEP. I'LL BE THERE WHEN IT DOES."

The lights dim. Just for a moment. When they come back, her reflection in the window isn't matching her movements.

END OF ACT ONE`
  },
  {
    id: 'comedy-pilot',
    title: 'Dead End Jobs',
    genre: 'Supernatural Comedy',
    scriptType: 'pilot',
    logline: 'A failed medium inherits a temp agency for the recently deceased, helping ghosts complete their unfinished business before moving on.',
    pageCount: 32,
    content: `COLD OPEN

INT. FORTUNE TELLER'S SHOP - NIGHT

Gaudy. Tacky. A crystal ball sits on a velvet table. EVELYN SANTOS (32), wearing an obviously fake turban, holds the hands of an ELDERLY WOMAN across the table.

EVELYN
(fake mystical voice)
I see... I see... your late husband.

ELDERLY WOMAN
(excited)
Harold? Is he here?

EVELYN
(eyes closed, concentrating)
He's... he's trying to speak...

A GHOST, HAROLD (80s), transparent and annoyed, floats behind the elderly woman.

HAROLD
For the last time, tell her the money's buried under the rosebushes! NOT THE RHODODENDRONS!

Evelyn can't hear him. Or anyone. She's completely fraudulent.

EVELYN
He says... he loves you very much.

HAROLD
(throwing up translucent hands)
I've been trying to tell her about the money for THREE YEARS!

ELDERLY WOMAN
Ask him where he hid the emergency fund!

EVELYN
(improvising)
He says... look in your heart.

ELDERLY WOMAN
My heart?

EVELYN
The heart... of the home. The kitchen?

HAROLD
THE ROSEBUSHES, YOU MORON!

ELDERLY WOMAN
(disappointed)
I already checked the kitchen.

Evelyn's phone buzzes. She peeks at it.

EVELYN
(breaking character)
Oh crap, I have to go. That'll be seventy-five dollars.

HAROLD
(to no one)
I hate this dimension.

MAIN TITLES: "DEAD END JOBS"

INT. LAWYER'S OFFICE - DAY

Evelyn sits across from MARGARET CHEN (60s), elegant, no-nonsense attorney.

MARGARET
Your grandmother passed three weeks ago.

EVELYN
(not that sad)
Yeah, we weren't close.

MARGARET
She left you something.

EVELYN
Money?

MARGARET
A business.

She slides a folder across the desk. Evelyn opens it.

EVELYN
"Limbo Staffing Solutions"? She ran a temp agency?

MARGARET
Of a sort. The building is in the commercial district. There's also a... condition.

EVELYN
Condition?

MARGARET
You must operate the business for one full year, or the entire estate goes to her cats.

EVELYN
How many cats?

MARGARET
Seventeen.

EVELYN
Of course.

INT. LIMBO STAFFING SOLUTIONS - DAY

A dusty office. Old computers. Filing cabinets everywhere. Evelyn enters, coughing.

EVELYN
This place is a dump.

She finds a desk with a nameplate: "ELENA SANTOS - FOUNDER"

EVELYN (CONT'D)
Okay, grandma. What were you up to?

She opens a filing cabinet. Each folder has a name and... a death date?

EVELYN (CONT'D)
"Gerald Thompson, 1943-2019, Status: Placed"? 
"Martha Wong, 1967-2021, Status: Pending"?

She hears something. Footsteps. But when she turns—

GERALD (77), translucent, stands right behind her.

GERALD
About damn time someone showed up!

Evelyn screams. Stumbles backward. Trips over a chair.

EVELYN
WHAT THE—

GERALD
Is that any way to greet a client?

EVELYN
(hyperventilating)
You're... you're...

GERALD
Dead? Yeah, since 2019. Your grandma set me up with a nice gig haunting my ex-wife's new house. Very satisfying. Until she moved and I couldn't follow.

EVELYN
I don't... I can't...

GERALD
Oh, you're the girl she talked about! The fake psychic!

EVELYN
I'm not... how do you know about that?

GERALD
She monitored all your cons. Said you had no gift but great hustle.

Evelyn is still on the floor, processing.

EVELYN
So this is... a temp agency for ghosts?

GERALD
Bingo. We got unfinished business, you find us jobs that let us finish it. Then we move on. It's a whole system.

EVELYN
And my grandmother ran this?

GERALD
For forty years. She was the real deal. Talked to the dead like they were living.

EVELYN
(standing slowly)
But I can't actually do that.

GERALD
You're doing it right now.

Beat. Evelyn considers this.

EVELYN
Huh. I guess I am.

GERALD
The gift skipped a generation. Your mom was useless. But you—

EVELYN
I can see dead people.

GERALD
And more importantly, you can give them purpose.

The door bursts open. Three more GHOSTS pile in.

GHOST #1
Is she the new coordinator?

GHOST #2
Finally! I've been waiting six months!

GHOST #3
I need to tell my wife where I hid her birthday present!

They all start talking at once.

EVELYN
(overwhelmed)
OKAY, EVERYONE CALM DOWN!

Silence.

EVELYN (CONT'D)
I don't know what I'm doing. I just found out ghosts are real like two minutes ago. So if you could all just... form a line? And we'll figure this out?

The ghosts look at each other. Shrug. Form a line.

GERALD
(to Evelyn, aside)
Natural leadership. Your grandma would be proud.

EVELYN
Is she here? Can I talk to her?

GERALD
She moved on years ago. But she left you a manual.

He points to a massive book on the desk: "LIMBO STAFFING: A COMPREHENSIVE GUIDE TO AFTERLIFE EMPLOYMENT"

EVELYN
(picking it up)
It's like 800 pages.

GERALD
Death is complicated.

EVELYN
(sighing)
Fine. Let's do this. Who's first?

GHOST #1
(stepping forward)
I'm first! I need to be at my granddaughter's wedding tomorrow, but I can't figure out how to become visible!

EVELYN
(flipping through manual)
Um... okay, let me just...

She finds a chapter: "Visibility & Manifestation: A Practical Guide"

EVELYN (CONT'D)
(reading)
"Ghosts achieve visibility through concentrated emotional resonance..." What does that even mean?

GERALD
It means you have to really want it. And we help focus that want.

EVELYN
Okay but how do I—

A CAT meows. A very alive, very fat cat waddles out from under a desk.

EVELYN (CONT'D)
...is that one of grandmother's seventeen cats?

GERALD
That's Mr. Whiskers. He's the office manager.

The cat looks at Evelyn with disturbingly intelligent eyes. Meows again.

EVELYN
The cat is the office manager.

GERALD
He's very organized.

EVELYN
(defeated)
Of course he is.

END OF COLD OPEN`
  },
  {
    id: 'comic-superhero',
    title: 'The Weight of Stars',
    genre: 'Superhero Drama',
    scriptType: 'comic',
    logline: 'A retired superhero with the power to absorb gravity struggles with depression and chronic pain while being forced back into action.',
    pageCount: 24,
    content: `THE WEIGHT OF STARS
Issue #1: "Heavy Lies the Crown"

PAGE ONE

Panel 1: Full page splash. 
A figure floats in darkness. MARCUS COLE, 50s, formerly the hero ATLAS. He wears civilian clothes, not a costume. Around him, debris - furniture, books, a coffee mug - all floating as if in zero gravity. His eyes are closed. His expression: agony.

CAPTION (MARCUS): "They called me Atlas because I could carry anything."

CAPTION (MARCUS): "They never asked what it cost."

PAGE TWO

Panel 1: Interior - Marcus's apartment. Day. Everything has crashed back down. Marcus lies on the floor among the debris, clutching his back.

CAPTION (MARCUS): "Every day, I take the gravity. Absorb it. Hold it inside."

Panel 2: Close on Marcus's face. Sweat. Pain.

CAPTION (MARCUS): "And every day, I have to let it go."

Panel 3: Marcus slowly pushes himself up. His movements are stiff, painful.

CAPTION (MARCUS): "The doctors call it 'accumulated gravitational stress.' My bones are thirty years older than my body."

Panel 4: He reaches for a pill bottle on a cluttered nightstand. Prescription label visible.

CAPTION (MARCUS): "The world calls me a hero. I call this Tuesday."

PAGE THREE

Panel 1: Marcus in his bathroom, looking in the mirror. He's shirtless - his body is a map of old injuries. Scars. Bruises that never quite fade.

CAPTION (MARCUS): "Twenty-three years of active service. Fourteen major events. One dead wife."

Panel 2: Close on his eyes in the mirror. Haunted.

CAPTION (MARCUS): "Zero therapy sessions. Because how do you explain this to someone who doesn't bend physics?"

Panel 3: His phone rings. Caller ID: "ANGELA TORRES - COMMANDER"

CAPTION (MARCUS): "I promised myself I was done. No more."

Panel 4: His finger hovers over "decline."

CAPTION (MARCUS): "But promises were never my strong suit."

Panel 5: He answers.

MARCUS: "I'm retired, Angela."

ANGELA (PHONE): "Something's happening. Something I've never seen."

PAGE FOUR

Panel 1: Wide shot - downtown. Chaos. Buildings lean at impossible angles. Cars slide sideways on streets. People fall upward.

CAPTION (NEWS BROADCAST): "Authorities are asking citizens to stay indoors as gravitational anomalies spread across the metropolitan area—"

Panel 2: Close on a terrified child being pulled up, reaching for her mother who's anchored to a street lamp.

CHILD: "MOMMY!"

Panel 3: The mother's grip slipping.

MOTHER: "Hold on, baby! Hold on!"

Panel 4: A shadow falls over them. Someone descending from above.

Panel 5: Marcus, in civilian clothes, lands between them. His presence seems to anchor reality - gravity normalizes around him.

MARCUS: "I've got you."

PAGE FIVE

Panel 1: Marcus catches the child, sets her down. The mother rushes to embrace her.

MOTHER: "Thank you! Thank you!"

Panel 2: Marcus grimaces, hand going to his lower back.

MARCUS: "Get inside. Find a basement. It's going to get worse."

Panel 3: He looks up at the sky. Something wrong with it - colors shifting, stars visible in daylight.

CAPTION (MARCUS): "I know this feeling. Someone's doing what I do."

CAPTION (MARCUS): "But they're doing it wrong."

Panel 4: COMMANDER ANGELA TORRES, 40s, all business, appears via holographic communication device.

ANGELA: "We tracked the source. Old industrial district. But Marcus—"

Panel 5: Close on Angela's face. Genuine worry.

ANGELA: "The power signature matches yours. Exactly."

MARCUS: "That's impossible."

ANGELA: "I know what I'm seeing. There's another you out there. And they're tearing the city apart."

PAGE SIX

Panel 1: Marcus moves through the distorted streets. Gravity shifts around him - he walks normally while debris flies sideways.

CAPTION (MARCUS): "My powers came from an accident. One in a trillion chance."

Panel 2: He passes a store window. His reflection - but something's off. The reflection smiles when he doesn't.

CAPTION (MARCUS): "There shouldn't be another one like me."

Panel 3: Marcus stops. Stares at the reflection.

MARCUS: "Who are you?"

Panel 4: The reflection speaks. Its voice appears as jagged, broken text.

REFLECTION: "I̷'M̷ ̸W̶H̸A̵T̸ ̵Y̸O̴U̷ ̶L̴E̴F̵T̶ ̸B̷E̶H̴I̶N̸D̴"

Panel 5: The reflection reaches OUT of the glass.

CAPTION (MARCUS): "Twenty-three years of absorbed gravity. Twenty-three years of pain."

CAPTION (MARCUS): "I should have known it would go somewhere."

PAGE SEVEN

Panel 1: SPLASH. The reflection - now fully formed, a DARK VERSION of Marcus, made of compressed gravitational force - emerges. This is THE WEIGHT.

THE WEIGHT: "EVERY. POUND. YOU. CARRIED."

Panel 2: Close on THE WEIGHT's face. It's Marcus, but wrong. Features compressed, distorted.

THE WEIGHT: "Every life you saved, the gravity went somewhere. Every disaster you stopped, the force went somewhere. INTO ME."

Panel 3: Marcus braces himself, gravity warping around his fists.

MARCUS: "Then let's put you back where you belong."

Panel 4: They clash. The collision creates a shockwave that levels buildings.

CAPTION (MARCUS): "They called me Atlas because I could carry anything."

PAGE EIGHT

Panel 1: Marcus and THE WEIGHT locked in combat, gravity bending around them in impossible spirals.

CAPTION (MARCUS): "But some weights aren't meant to be carried."

Panel 2: THE WEIGHT grabs Marcus's throat, lifting him.

THE WEIGHT: "You gave the world your strength. You gave ME your suffering. Twenty-three years of accumulated agony."

Panel 3: Close on Marcus's face, choking but defiant.

MARCUS: "Then let me... take it back..."

Panel 4: Marcus's hands glow. Gravity begins reversing.

CAPTION (MARCUS): "They never asked what it cost to be a hero."

Panel 5: THE WEIGHT screams as its form destabilizes.

THE WEIGHT: "NO! THIS PAIN IS MINE!"

CAPTION (MARCUS): "Time to find out."

PAGE NINE

Panel 1: Full page. Marcus ABSORBS THE WEIGHT back into himself. An explosion of gravitational force. Buildings restore. Cars settle. Reality snaps back.

And Marcus stands alone, twenty-three years of suffering finally acknowledged.

CAPTION (MARCUS): "I am Atlas. I carry the world."

CAPTION (MARCUS): "And for the first time in years..."

PAGE TEN

Panel 1: Later. Marcus sits on a rooftop, city settling below him. Angela approaches.

ANGELA: "Medical team wants to see you."

MARCUS: "I'm fine."

Panel 2: Angela sits beside him.

ANGELA: "Marcus. What was that thing?"

Panel 3: Close on Marcus's face. Exhausted. But something new - acceptance.

MARCUS: "Me. The parts I never dealt with."

ANGELA: "And now?"

Panel 4: Marcus looks at his hands.

MARCUS: "Now I carry them too. All of it. The strength AND the cost."

Panel 5: He stands, stretching. Still stiff. Still in pain. But different.

MARCUS: "I think I need to talk to someone. About everything."

ANGELA: "I know a therapist. Good with... unusual cases."

Panel 6: Marcus manages a small smile.

MARCUS: "That's a start."

CAPTION (MARCUS): "...I feel like I can finally set something down."

NEXT ISSUE: "THE GRAVITY OF HEALING"

END`
  }
];

export function getSampleScriptsByType(type: string): SampleScriptData[] {
  return SAMPLE_SCRIPTS.filter(s => s.scriptType === type);
}

export function getSampleScriptById(id: string): SampleScriptData | undefined {
  return SAMPLE_SCRIPTS.find(s => s.id === id);
}

export function getScriptGenres(): string[] {
  return [...new Set(SAMPLE_SCRIPTS.map(s => s.genre))];
}
