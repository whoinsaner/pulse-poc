/**
 * Sample scripts for demonstrating the analysis framework
 * These are representative excerpts from various genres and formats
 */

export interface SampleScriptData {
  id: string;
  title: string;
  genre: string;
  scriptType: 'feature' | 'pilot' | 'episode' | 'short' | 'documentary' | 'comic' | 'web_series' | 'micro_drama';
  episodeLengthClass?: 'short_form_web' | 'mid_form_web' | 'long_form_web';
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
  },
  // ============================================
  // COMIC SCRIPTS
  // ============================================
  {
    id: 'comic-fantasy-cartographer',
    title: 'The Last Cartographer',
    genre: 'Fantasy Adventure',
    scriptType: 'comic',
    logline: 'In a dying world where maps rewrite reality, an elderly cartographer and her apprentice must draw the one map that could save everything—or erase it all.',
    pageCount: 24,
    content: `THE LAST CARTOGRAPHER
Issue #1: "The Bleeding Borders"
Written for Sequential Art

PAGE 1 (SPLASH)

Panel 1: FULL PAGE SPLASH
A breathtaking vista of THE MAPPED LANDS—a fantasy world where geography literally shifts. Mountains dissolve into coastlines at their edges. Rivers flow upward into clouds. In the distance, sections of the world are simply... blank. White voids where reality hasn't been drawn yet.

In the foreground, perched on an impossible cliff, sits THE CARTOGRAPHER'S TOWER—a spiraling structure made of rolled parchment, compass needles, and crystallized ink.

CAPTION (top): "In the beginning, there was nothing. Then the First Cartographer drew a line, and the world began."

CAPTION (bottom): "Now the lines are fading."

TITLE CARD: THE LAST CARTOGRAPHER

---

PAGE 2

Panel 1: INTERIOR - CARTOGRAPHER'S STUDY - WIDE
Shelves overflow with maps of impossible places. ELARA VANCE (70s, sharp eyes behind half-moon spectacles, ink-stained fingers) traces her hand across a massive table-mounted map that glows faintly.

ELARA: The Eastern Reaches are hemorrhaging again.

Panel 2: CLOSE on the map
We see sections literally fading—the ink evaporating like morning dew. Towns vanish. Rivers dry up. A white void spreads like a wound.

SFX: ssssssss

ELARA (OFF): Twelve villages. Six thousand souls. Gone before breakfast.

Panel 3: MEDIUM - DOORWAY
KIRA (17, wild curly hair, messenger bag full of charcoal sticks) bursts in, out of breath. She's clutching a small leather journal.

KIRA: Master Vance! The Council—

ELARA: Let me guess. They're concerned.

Panel 4: CLOSE on Elara's face - weary, resolute
ELARA: They're always concerned. Never helpful.

---

PAGE 3

Panel 1: WIDE - KIRA approaches the table
Kira sets her journal down, revealing sketches of the void's expansion. They're rough but accurate—she has talent.

KIRA: I tracked the decay rate. It's accelerating. 
KIRA: At this pace, we lose the Western Farmlands by next moon.

Panel 2: ELARA examines Kira's sketches - impressed despite herself
ELARA: You calculated the drift coefficients?

KIRA: Used the Thornwall Method. Cross-referenced with tide tables.

Panel 3: ELARA almost smiles
ELARA: I've been training you too well.

Panel 4: KIRA - earnest, urgent
KIRA: Then train me faster. Tell me what the Council won't—

Panel 5: WIDE - tension between them
KIRA: —why you're the LAST cartographer. What happened to the others?

ELARA: ...

---

PAGE 4

Panel 1: FLASHBACK - sepia tones - THE GRAND CONVOCATION
Dozens of cartographers gathered around an enormous map. Ceremonial robes. Intricate instruments.

CAPTION (Elara): "There were once a hundred of us. The Convocation of Maps."

Panel 2: FLASHBACK - one cartographer draws a bold line
His pen glows with power. Reality reshapes around his stroke.

CAPTION (Elara): "We shaped continents. Raised mountains from flatlands. Drew rivers where deserts burned."

Panel 3: FLASHBACK - chaos erupts
The same cartographer's map BLEEDS—ink flowing like blood. Other cartographers scream, dissolving into the void.

CAPTION (Elara): "Until Aldric Thorne tried to draw something that should never exist."

SFX: KRAAAAKK

Panel 4: BACK TO PRESENT - Elara, haunted
ELARA: He tried to map the Unmappable. And the Unmappable mapped us back.

---

PAGE 5

Panel 1: KIRA - confused, frightened
KIRA: The Unmappable? I've never seen that in any text—

Panel 2: Elara moves to a locked cabinet, produces a key from her neck
ELARA: Because I burned them all. Some knowledge is too dangerous to preserve.

Panel 3: CLOSE - the cabinet opens, revealing a single rolled map, bound in black chains
The map seems to pulse. Chains rattle on their own.

ELARA (OFF): Except this one. The map Thorne died making.

Panel 4: KIRA steps back instinctively
KIRA: It's... breathing.

ELARA: No. It's waiting.

---

PAGE 6

Panel 1: EXTERIOR - THE VOID'S EDGE - establishing
A group of refugees huddles at the border of reality. Behind them: a thriving village. Ahead: pure white nothingness. A BORDER GUARD holds them back.

BORDER GUARD: Nobody crosses! The Cartographer's Guild has jurisdiction—

Panel 2: A MOTHER clutches her child
MOTHER: Our home is GONE! What jurisdiction matters when the world itself disappears?

Panel 3: WIDE - the void PULSES, expanding suddenly
Everyone scrambles back. The guard's spear tip touches the void and dissolves.

SFX: FWOOOOSH

GUARD: BACK! EVERYONE BACK!

Panel 4: LOW ANGLE - looking up at the void
It towers like a wave frozen mid-crash. Within the whiteness, shapes move. Almost faces. Almost screaming.

CAPTION: "The Unmappable doesn't consume. It unmakes. It returns things to what they were before the first line was drawn."

---

PAGE 7

Panel 1: INTERIOR - ELARA'S STUDY - NIGHT
Elara sits alone, the chained map before her. Candles burn low. Kira watches from the doorway.

ELARA: You should be sleeping.

KIRA: You should be teaching me how to stop that thing.

Panel 2: ELARA turns, decisive
ELARA: Very well. Lesson one.

Panel 3: She unfurls a blank piece of parchment
ELARA: Close your eyes. Feel the space around you.

Panel 4: KIRA obeys, concentrating
KIRA: I feel... walls. Floorboards. Dust.

ELARA: Deeper. Past the physical.

Panel 5: CLOSE on Kira's closed eyes - a faint glow emerges
KIRA (small): Oh...

KIRA: I feel... lines. Invisible lines. Everything has edges.

---

PAGE 8

Panel 1: Kira opens her eyes - they're glowing faintly
KIRA: The world IS a map. Every object, every person—we're all just... shapes someone drew.

Panel 2: ELARA smiles sadly
ELARA: Now you understand the cartographer's burden.
ELARA: We don't make maps of the world. We make the world from maps.

Panel 3: KIRA stares at her hands
KIRA: Then the void... it's an eraser?

Panel 4: ELARA - grim
ELARA: Worse. It's the blank page demanding everything return to it.

Panel 5: WIDE - the chained map RATTLES
Both women turn. The chains strain. Inside, something MOVES.

SFX: CLINK CLINK CLINK

ELARA: It knows we're discussing it.

---

PAGE 9 (SPLASH - PAGE TURN REVEAL)

Panel 1: FULL PAGE
The chains SHATTER. The map unfurls on its own, floating in mid-air. But it's not just a map—it's a PORTAL. Within its boundaries, we see ALDRIC THORNE (40s, mad-eyed, ink literally flowing through his veins like blood) reaching out toward our world.

THORNE: FINALLY. A worthy successor dares look upon my work!

ELARA: Aldric—!

THORNE: Elara. My old rival. Still drawing your safe little coastlines while the world burns?

KIRA (small): Master Vance... who is that?

THORNE: I am the man who mapped GOD, child. And God did not appreciate being observed.

---

PAGE 10

Panel 1: ELARA steps protectively in front of Kira
ELARA: You're dead, Aldric. I watched you dissolve.

Panel 2: THORNE's map-portal self laughs
THORNE: Dead? I became my final work! I exist within the map now—between reality and void!

Panel 3: CLOSE - Thorne's face, half-human, half-cartographic symbols
THORNE: The Unmappable showed me what lies beyond the borders. The REAL world. Our existence is merely a sketch—a draft the original artist abandoned!

Panel 4: KIRA - horrified
KIRA: That's insane!

Panel 5: THORNE - deadly serious
THORNE: Is it? Look at your void. It's not destruction—it's CORRECTION. The artist is erasing their mistakes.

---

PAGE 11

Panel 1: ELARA draws a quick symbol in the air - it glows
ELARA: Kira! The binding ink—third shelf!

Panel 2: Kira scrambles, grabs a vial of shimmering black liquid
KIRA: Got it!

Panel 3: Thorne's map-form EXPANDS, tendrils of parchment reaching out
THORNE: You can't contain me again, Elara! I've had decades to study the void!

Panel 4: ELARA catches the vial, draws a rapid circle around the floating map
ELARA: I don't need decades. I need seconds!

Panel 5: CLOSE - she completes the circle
ELARA: SEAL!

SFX: FWOOOOOM

---

PAGE 12

Panel 1: The map collapses, sucking Thorne back inside
THORNE (distorted): This changes nothing! The void will reach your tower within the month! You need me!

Panel 2: The map lies dormant again. Elara, exhausted, catches her breath
KIRA: Master Vance—are you—

ELARA: I'm fine. Get the adamantine chains from the vault.

Panel 3: KIRA - still processing
KIRA: He said we need him. Do we?

Panel 4: ELARA stares at the map - conflicted
ELARA: He's the only one who mapped the void's source.
ELARA: And he's completely, utterly mad.

Panel 5: WIDE - the two of them, the map between them
ELARA: But he might also be our only hope.

---

PAGE 13

Panel 1: EXTERIOR - REFUGEE CAMP - DAWN
Hundreds of displaced people huddle in makeshift tents. Cooking fires. Crying children. The void looms in the background like a frozen tsunami.

CAPTION: "Thornwall Crossing. Population: 47 (formerly)."

Panel 2: A RELIEF COORDINATOR (stressed, clipboard) argues with a MERCHANT
COORDINATOR: We need those supplies for the eastern refugees!

MERCHANT: East doesn't exist anymore! Those supplies are MINE now!

Panel 3: WIDE - Elara and Kira arrive on horseback
The crowd parts. Whispers spread.

REFUGEE 1: The Cartographer...
REFUGEE 2: She can fix this, right?
REFUGEE 3: Where was she when our homes vanished?!

Panel 4: Elara dismounts, addresses the crowd
ELARA: I cannot restore what's been lost. But I can prevent further loss.

ANGRY REFUGEE: LIES! You've been saying that for YEARS!

---

PAGE 14

Panel 1: The angry refugee advances - a young man, DEVRIN, scarred
DEVRIN: My father was a cartographer's assistant! When the Convocation fell, they left him to die!

Panel 2: KIRA steps forward, defensive
KIRA: Master Vance wasn't responsible for—

DEVRIN: She's the LAST one standing! That makes her responsible for EVERYTHING!

Panel 3: ELARA - quiet, accepting the anger
ELARA: He's right.

Panel 4: Everyone freezes - including Kira
KIRA: What?

ELARA: The Convocation's arrogance caused this. My arrogance in thinking I could contain it alone extended it.

Panel 5: ELARA meets Devrin's eyes
ELARA: I cannot give you back your father. But I can try to save your future.

ELARA: If you'll let me.

---

PAGE 15

Panel 1: Tense standoff - then Devrin backs down
DEVRIN: ...save it, then. Don't just talk about it.

Panel 2: Elara nods, turns to Kira
ELARA: I need you to establish a mapping perimeter. Use the portable inks.

KIRA: We're going to reinforce the border?

Panel 3: ELARA - grim
ELARA: No. We're going to map what lies beyond it.

Panel 4: KIRA - stunned
KIRA: Into the void?! That's suicide!

Panel 5: ELARA pulls out a special compass - it spins wildly near the void
ELARA: That's why we're not going physically.

ELARA: We're going cartographically.

---

PAGE 16

Panel 1: INTERIOR - EMERGENCY COMMAND TENT - set up
Kira unfurls blank parchment. Elara sets up an intricate array of compasses, inks, and crystals. Devrin watches skeptically.

ELARA: Cartographic projection. We send our map-selves into the void while our bodies remain here.

KIRA: And if our map-selves are unmade?

Panel 2: ELARA - pause
ELARA: Then so are we.

Panel 3: DEVRIN steps forward
DEVRIN: I'm coming.

ELARA: You're not trained—

DEVRIN: My father taught me the basics. And you owe me.

Panel 4: ELARA considers - then nods
ELARA: Then you'll carry the anchor line. If we get lost, you pull us back.

Panel 5: Devrin takes a shimmering rope of living ink
DEVRIN: I won't let you fall.

---

PAGE 17 (SPLASH)

Panel 1: FULL PAGE
The ritual begins. Elara and Kira lie on the parchment, eyes closed. Their outlines glow—and then RISE from their bodies as glowing, two-dimensional versions of themselves. They're literally becoming map illustrations.

Devrin holds the anchor rope connecting them to reality.

In the background, the void PULSES, as if sensing what's coming.

ELARA (echoing): Remember—in the void, intention is geography. Think clearly, or become lost.

KIRA (echoing): I understand.

ELARA (echoing): No. You don't. Not yet.

SFX: FWOOOOOOSH

---

PAGE 18

Panel 1: THE VOID - INTERIOR
Elara and Kira float in pure whiteness. They're illustrated versions of themselves—all lines and symbols.

KIRA: I can't... there's nothing to see. Nothing to map.

Panel 2: ELARA points ahead - shapes coalesce
ELARA: Look harder. The void isn't empty—it's full of everything that was unmade.

Panel 3: WIDE - they're surrounded by ghost images
Fragments of dissolved villages. Echoes of erased people. All floating like memories in water.

GHOST-CHILD: ...help me...
GHOST-ELDER: ...so cold...

KIRA: They're still here! They're not gone!

Panel 4: ELARA - sorrowful
ELARA: They're imprints. Echoes. The void doesn't destroy—it stores.

Panel 5: KIRA - hopeful
KIRA: Then we can bring them back! We can redraw them!

ELARA: To redraw them, we'd need the original maps.

ELARA: And those were destroyed in the Convocation's fall.

---

PAGE 19

Panel 1: They push deeper - the shapes become more coherent
A massive structure looms ahead - THE ORIGINAL DRAFTING TABLE. An impossibly huge desk floating in the void, covered in overlapping maps.

KIRA: What IS that?

Panel 2: ELARA - breathless with fear and wonder
ELARA: The First Cartographer's desk. The place where our world was drawn.

Panel 3: CLOSE - the desk surface
Covered in sketches. Some recognizable—their world. Others completely alien. Notes in an unknown language. CORRECTIONS and DELETIONS everywhere.

CAPTION (Elara): "We're not a creation. We're a draft. One of many."

Panel 4: KIRA picks up a discarded sketch - another version of their world
KIRA: There are OTHER versions of us?

ELARA: Were. Look.

Panel 5: The sketch crumbles in Kira's hands
ELARA: Every draft gets erased eventually. We're simply... overdue.

---

PAGE 20

Panel 1: A PRESENCE makes itself known - reality WARPS around them
A massive eye opens in the void. Not malevolent—curious. OLD.

THE PRESENCE: Drawn things. Come to see the Drawer.

Panel 2: ELARA bows instinctively - Kira follows
ELARA: We seek to understand the erasure. To stop it.

Panel 3: THE PRESENCE - almost amused
PRESENCE: Stop it? You are lines on paper asking the artist to stop editing.

Panel 4: KIRA - brave despite terror
KIRA: Then tell us WHY. Why are we being erased?

Panel 5: THE PRESENCE - contemplative
PRESENCE: The borders bleed because the ink is old. The paper tears because the concept was flawed.

PRESENCE: You were a practice sketch. It's time for the final draft.

---

PAGE 21

Panel 1: ELARA - desperate
ELARA: There must be a way! We're ALIVE! We think, we feel—

Panel 2: THE PRESENCE - curious
PRESENCE: Do you? Or do you merely believe you do because that's how you were drawn?

Panel 3: The anchor rope TUGS - Devrin is pulling them back
KIRA: We're losing connection!

ELARA: Wait—please! Is there nothing we can do?

Panel 4: THE PRESENCE considers
PRESENCE: The Original Map. The first draft. It still exists, hidden in your world.

PRESENCE: If you can find it... you could redraw your borders. Permanently.

Panel 5: THE PRESENCE fades
PRESENCE: But beware the Collector. He guards the map with all that he has unmade.

---

PAGE 22

Panel 1: BACK IN REALITY - Elara and Kira GASP awake
DEVRIN: Thank the stars—you were fading! I thought—

KIRA: We found it! We know how to stop the void!

Panel 2: ELARA - shaken but determined
ELARA: The Original Map. It was never destroyed—it's hidden somewhere in our world.

DEVRIN: Then what are we waiting for?

Panel 3: ELARA stands, turns to face the void in the distance
ELARA: There's a guardian. Something called the Collector.

KIRA: The Presence said it guards the map with everything that was unmade...

Panel 4: DEVRIN - realization
DEVRIN: The ghosts. The echoes we saw. They're not just stored—

Panel 5: ELARA - grim
ELARA: They're soldiers. An army of the erased.

ELARA: And we just announced our intentions to their master.

---

PAGE 23

Panel 1: The void PULSES differently now - aggressively
SFX: THOOM THOOM THOOM

REFUGEE: What's happening?!

Panel 2: WIDE - shapes emerge from the void
Ghost armies. Thousands of them. Erased soldiers from forgotten wars. Unmade creatures from deleted drafts.

COLLECTOR (voice, echoing from the void): YOU DARE SEEK THE ORIGINAL?!

Panel 3: The refugees PANIC
DEVRIN: Everyone run! GET TO THE TOWER!

Panel 4: ELARA draws in the air - a massive defensive sigil
ELARA: Kira! Anchor the eastern flank!

KIRA: On it!

Panel 5: LOW ANGLE - the ghost army descends
COLLECTOR: I WAS THE FIRST TO BE ERASED. THE FIRST MISTAKE THE ARTIST MADE.

COLLECTOR: AND I WILL NOT LET YOU UNDO WHAT GAVE ME EXISTENCE!

---

PAGE 24 (FINAL SPLASH)

Panel 1: FULL PAGE
Epic battle composition. Elara stands at the center, light blazing from her hands as she draws defensive barriers in the air. Kira flanks her, sketching rapid counter-sigils. Devrin leads refugees toward the Cartographer's Tower in the background.

The ghost army pours from the void like a tsunami of the unmade.

Above it all, THE COLLECTOR begins to take form—a massive figure made of every discarded draft, every deleted concept, every erased mistake. It is beautiful and terrible.

ELARA: This is what we trained for, Kira!

KIRA: No it's NOT!

ELARA: Then ADAPT!

COLLECTOR: THE ORIGINAL MAP BELONGS TO THE VOID! YOU WILL JOIN IT!

CAPTION (bottom): "The Last Cartographer will continue in Issue #2: 'The Collector's Army'"

END OF ISSUE ONE`
  },
  {
    id: 'comic-sliceoflife-diner',
    title: 'Midnight Diner',
    genre: 'Slice of Life Drama',
    scriptType: 'comic',
    logline: 'A late-night diner in Tokyo becomes the crossroads for strangers whose stories interweave across one transformative evening.',
    pageCount: 22,
    content: `MIDNIGHT DINER
Issue #1: "Between Hours"
A Slice-of-Life Drama

PAGE 1

Panel 1: EXTERIOR - TOKYO BACKSTREET - NIGHT - ESTABLISHING
A narrow alley, steam rising from vents. Neon signs reflect in puddles. A small diner wedged between two buildings glows warmly. A simple sign reads: "OPEN 12AM-7AM"

CAPTION: "Tokyo. Population: 14 million. Average person you'll speak to tonight: zero."

Panel 2: CLOSE on the diner window
Through condensation, we see silhouettes. A counter with stools. One FIGURE hunched over coffee.

CAPTION: "Unless you know where to find the in-between places."

Panel 3: INTERIOR - THE DINER - WIDE
Simple. Clean. Ten counter stools, four small tables. THE MASTER (60s, stoic, scar on his left cheek) wipes a glass behind the counter. A single customer, YUKI (30s, exhausted businesswoman), stares into her coffee.

MASTER: More?

YUKI: ...please.

Panel 4: CLOSE on coffee being poured - a meditation
The liquid swirls. Steam rises. Time slows.

CAPTION: "The Master serves one dish per night. You can request it, but only once."

---

PAGE 2

Panel 1: The door opens - bell chimes softly
TAKESHI (40s, salaryman, loosened tie, haunted expression) enters. He hesitates at the threshold.

TAKESHI: Is it... too late?

MASTER: We only open at midnight. You're on time.

Panel 2: Takeshi takes a seat, two stools from Yuki
They don't look at each other. The unspoken rules of midnight patrons.

TAKESHI: Just rice, please. Plain rice.

MASTER: Rice takes time. I'll bring tea first.

Panel 3: YUKI finally looks up - her phone screen illuminates her face
A text message visible: "Don't come home tonight. We need to talk." It's been read but unanswered.

Panel 4: SILENT PANEL - Yuki and Takeshi, both adrift
Two islands of loneliness at the same counter.

---

PAGE 3

Panel 1: Another customer enters - HANA (22, art student, paint-stained fingers)
She's clutching a portfolio like a life raft. Eyes red from crying—or sleeplessness. Hard to tell.

HANA: Excuse me... is this the place where...

Panel 2: The Master simply nods
He doesn't need her to finish.

MASTER: Sit anywhere.

Panel 3: Hana chooses a small table in the corner
She opens her portfolio. Inside: beautiful, detailed manga pages. She stares at them with hatred.

Panel 4: CLOSE on the artwork - genuinely impressive
A fantasy scene. A warrior woman facing a dragon. Technically perfect. Emotionally alive.

Panel 5: Hana's hand covers the page
HANA (whispered): It's not enough. It's never enough.

---

PAGE 4

Panel 1: The Master brings tea to Takeshi - and unexpectedly to Yuki
YUKI: I didn't order—

MASTER: It's on the house. For waiting so patiently.

Panel 2: Yuki wraps her hands around the cup
Something about the gesture breaks her composure slightly. Her eyes glisten.

YUKI: Thank you.

Panel 3: TAKESHI watches from the corner of his eye
He recognizes something in her sadness.

Panel 4: The Master moves to Hana's table
MASTER: What will you have?

HANA: I don't know. I don't know anything anymore.

Panel 5: The Master sits across from her - unusual for him
MASTER: Then tell me what you know. We'll figure out the rest.

---

PAGE 5

Panel 1: HANA's story begins - sepia-toned FLASHBACK
A younger Hana, maybe 15, drawing in a notebook while other students play.

HANA (CAPTION): "I've drawn every day since I was six. It was the only thing that made sense."

Panel 2: FLASHBACK - Hana shows her work to her MOTHER
Her mother smiles, but it doesn't reach her eyes.

MOTHER: That's nice, dear. But you should focus on your real studies.

HANA (CAPTION): "My mother wanted a doctor. My father wanted a lawyer."

Panel 3: FLASHBACK - Hana at art school, finally free
Surrounded by other artists, laughing, creating.

HANA (CAPTION): "For three years, I thought I'd escaped."

Panel 4: FLASHBACK - A rejection letter
PUBLISHER'S STAMP visible: "Thank you, but this does not fit our current needs."

HANA (CAPTION): "Forty-seven submissions. Forty-seven rejections."

Panel 5: BACK TO PRESENT - Hana's eyes, empty
HANA: The forty-eighth came today. My parents said... it's time to stop dreaming.

---

PAGE 6

Panel 1: The Master listens without judgment
MASTER: What do you think?

Panel 2: HANA - conflicted
HANA: I think... I'm tired. But I can't imagine stopping.

Panel 3: The Master stands, moves back to the counter
MASTER: Tonight's dish. It might help.

Panel 4: HANA - confused
HANA: I didn't request anything—

MASTER: You requested it by walking through that door.

---

PAGE 7

Panel 1: YUKI finally speaks - to no one in particular
YUKI: I built a career for fifteen years.

Panel 2: Takeshi looks over, not intrusively, but listening
YUKI: Senior Vice President. Youngest woman to ever hold the position at my firm.

Panel 3: CLOSE on Yuki's ring finger - a tan line where a ring used to be
YUKI: And in the end, my husband said I built everything except our marriage.

Panel 4: TAKESHI responds quietly
TAKESHI: Mine said something similar. Except he was right.

Panel 5: They finally look at each other - recognition of shared pain
YUKI: Were you?

TAKESHI: I don't know yet. That's why I'm here.

---

PAGE 8

Panel 1: Another customer - KENJI (70s, former salaryman, impeccable despite late hour)
He carries a small wooden box. Enters like he's been here a thousand times.

MASTER: Kenji-san. The usual seat.

KENJI: Masato-kun. Still using your grandfather's teapot, I see.

Panel 2: Kenji takes his seat at the far end of the counter
He sets down the wooden box with reverence.

Panel 3: YUKI notices the box - curiosity
The wood is old, polished by years of touch.

Panel 4: The Master brings Kenji tea without being asked
MASTER: Forty years tonight.

KENJI: Forty-one. But who's counting.

---

PAGE 9

Panel 1: Kenji opens the box - inside, a folded paper crane
Old. Yellowed. But carefully preserved.

KENJI: She made this the night I proposed.

Panel 2: FLASHBACK - 1983 - A young KENJI and a young WOMAN at this same diner
She folds a napkin into a crane. He watches, mesmerized.

YOUNG WOMAN: If you can keep this safe for fifty years, I'll know you were serious.

Panel 3: BACK TO PRESENT - Kenji's weathered hands holding the crane
KENJI: I've kept it safe for forty-one. She's been gone for six.

Panel 4: The diner falls silent - everyone listening now
Even Hana has looked up from her portfolio.

KENJI: I still come here. Because this is where she was most herself.

Panel 5: CLOSE on the crane
KENJI (OFF): And where I was most myself with her.

---

PAGE 10

Panel 1: TAKESHI - moved, guilty
TAKESHI: My wife... she asked me to sit with her. Just sit. Nothing else.

Panel 2: FLASHBACK - Takeshi at a desk, working
His WIFE in the doorway, waiting.

WIFE: Come to bed.

TAKESHI: In an hour.

Panel 3: FLASHBACK - same scene, repeated
WIFE: It's our anniversary.

TAKESHI: In an hour.

Panel 4: FLASHBACK - the doorway, empty
Just the ghost of her presence.

TAKESHI (CAPTION): "There were a thousand hours. I chose work for all of them."

Panel 5: BACK TO PRESENT - Takeshi's hands shake
TAKESHI: She left this morning. Asked me not to follow.

---

PAGE 11

Panel 1: YUKI - unexpectedly kind
YUKI: Do you want her back?

Panel 2: TAKESHI - honest
TAKESHI: I don't know if I deserve her back. But I know I don't deserve to lose her because I was too busy to notice.

Panel 3: KENJI speaks up
KENJI: The crane my wife made... I almost lost it once.

Panel 4: FLASHBACK - Kenji, 40s, drunk, finds the crane crumpled in his briefcase
He's been chasing a promotion. Forgotten what matters.

KENJI (CAPTION): "I was exactly where you are now."

Panel 5: FLASHBACK - Kenji, smoothing the crane carefully
His wife finds him. She doesn't speak. Just sits beside him.

KENJI (CAPTION): "She never said a word about it. But she saw."

---

PAGE 12

Panel 1: BACK TO PRESENT - Kenji looks at Takeshi
KENJI: The question isn't whether you deserve her.

KENJI: The question is whether you'll become someone who does.

Panel 2: TAKESHI absorbs this - something shifts
TAKESHI: How do I even start?

Panel 3: The Master arrives with a bowl of rice
Perfectly plain. Steam rising. Beautiful in its simplicity.

MASTER: You asked for plain rice.

MASTER: The first step is always the simplest one.

Panel 4: TAKESHI looks at the rice - understanding
TAKESHI: Start with what I asked for. Not what I think I need.

Panel 5: He takes a bite - closes his eyes
TAKESHI: It's... perfect.

---

PAGE 13

Panel 1: The door opens again - a YOUNG COUPLE (both 25, clearly been fighting)
The WOMAN storms to a table. The MAN hesitates at the door.

WOMAN: Don't just stand there!

MAN: Maybe we should go somewhere else—

Panel 2: The Master intervenes gently
MASTER: Fighting couples are welcome. But you eat first, argue later.

Panel 3: The couple, surprised, sits together
Something about the diner's energy calms them slightly.

WOMAN: Fine. Two of whatever.

MASTER: Tonight's dish isn't ready yet. Tea first.

Panel 4: As the Master walks away, the couple exchanges a glance
MAN: ...I'm sorry I said that thing about your mother.

WOMAN: You should be. But I'm sorry I threw the remote.

Panel 5: YUKI watches them - something softens in her face
YUKI (to herself): That used to be us.

---

PAGE 14

Panel 1: HANA has been drawing - we see her page
She's sketched the people in the diner. Quick studies. Kenji with his crane. Takeshi with his rice. The young couple mid-argument.

Panel 2: CLOSE on her sketches - they're ALIVE
More than her portfolio work. Raw and real.

HANA: Oh...

Panel 3: She flips back to her fantasy pages - sees them differently now
Technical perfection. Emotional distance.

HANA: That's what's missing.

Panel 4: The Master arrives at her table
MASTER: Tonight's dish.

Panel 5: He sets down a simple bowl - rice with a raw egg yolk
Simple. Homestyle. Nothing like restaurant food.

MASTER: My grandmother's recipe. She never published it.

---

PAGE 15

Panel 1: HANA stares at the dish
HANA: It's... just rice and egg.

MASTER: Is it?

Panel 2: She takes a bite - her eyes widen
The simplicity overwhelms her. It tastes like childhood. Like comfort. Like home.

Panel 3: Tears stream down her face
HANA: This is what I'm missing. Not technique. Not skill.

Panel 4: She gestures at her portfolio
HANA: I've been drawing to prove I'm good enough. Not because I have something to say.

Panel 5: The Master nods
MASTER: Say something, then. The publishers can wait.

---

PAGE 16

Panel 1: The young couple is calmer now - tea in hand
WOMAN: You never told me why you're afraid of commitment.

MAN: You never asked in a way that felt safe to answer.

Panel 2: YUKI overhears - it hits close to home
She pulls out her phone. Types a reply to that morning's text.

Panel 3: CLOSE on the text: "I hear you. Can we talk? Really talk?"

Panel 4: She stares at it - doesn't send yet
YUKI: I don't know how to be vulnerable anymore.

Panel 5: KENJI, from across the counter
KENJI: None of us do. We just choose to try anyway.

---

PAGE 17

Panel 1: YUKI looks at Kenji
YUKI: How do you keep choosing after forty years?

Panel 2: KENJI lifts the paper crane
KENJI: Every morning, I wake up and see this on my nightstand.

KENJI: And I remember that someone once believed I was worth fifty years.

Panel 3: YUKI - moved
YUKI: What if I believed wrong? What if I chose work because I was afraid love wasn't enough?

Panel 4: KENJI - gentle
KENJI: Then you were afraid. That's human.

KENJI: The question is whether you'll let fear make your decisions forever.

Panel 5: YUKI looks at her phone - presses send
YUKI: No. Not forever.

---

PAGE 18

Panel 1: The young couple has moved closer together
WOMAN: I don't want to be my parents.

MAN: Neither do I.

WOMAN: So let's not be.

Panel 2: They hold hands - small victory
The diner witnesses silently.

Panel 3: TAKESHI finishes his rice - stands
TAKESHI: Master-san. What do I owe you?

Panel 4: The Master waves dismissively
MASTER: Nothing tonight. But come back when you have news.

Panel 5: TAKESHI bows deeply
TAKESHI: I will.

---

PAGE 19

Panel 1: HANA is drawing furiously now - a new style
Raw sketches of real people. The fantasy abandoned.

MASTER: Will that page be good enough for the publishers?

Panel 2: HANA doesn't look up
HANA: I don't care about the publishers right now.

HANA: I'm drawing for me.

Panel 3: The Master smiles - rare and genuine
MASTER: That's what my grandfather said when he opened this diner.

Panel 4: HANA pauses
HANA: Did it work out?

MASTER: Define "work out."

Panel 5: He gestures to the diner - the strangers who've become connected
MASTER: Does this count?

HANA: ...yeah. I think it does.

---

PAGE 20

Panel 1: The clock reads 4:47 AM
CAPTION: "The in-between hours. Too late for yesterday, too early for today."

Panel 2: YUKI checks her phone - a reply has come
TEXT: "I'll be home. Please be there too."

YUKI: Master-san. Do you have... anything to go?

Panel 3: The Master produces a small container
MASTER: Leftover rice. Still warm if you hurry.

Panel 4: YUKI takes it - a peace offering
YUKI: Thank you. For more than the food.

MASTER: Thank you for more than the company.

Panel 5: She leaves - the bell chimes
Only Kenji, Hana, and the young couple remain.

---

PAGE 21

Panel 1: The young couple stands to leave
MAN: We should get some sleep. Talk more tomorrow.

WOMAN: Okay. But... let's come back here. When it gets hard.

Panel 2: The Master nods
MASTER: We'll be here.

Panel 3: They leave together - not fixed, but beginning
The door closes softly.

Panel 4: KENJI finishes his tea - places the crane back in its box
KENJI: Same time next year, Masato?

MASTER: Wouldn't miss it, Kenji-san.

Panel 5: Kenji pauses at the door
KENJI: The young ones... they remind me of us.

MASTER: All young ones do. That's why we stay open.

---

PAGE 22 (FINAL PAGE)

Panel 1: INTERIOR - THE DINER - 6:58 AM
Only Hana remains, asleep at her table, sketchbook as pillow. Her new drawings scattered around her. The Master drapes a blanket over her shoulders.

Panel 2: He begins to close up - turning off lights, one by one
CAPTION: "Every night, strangers walk through that door."

Panel 3: EXTERIOR - THE DINER - DAWN
The first rays of sunlight hit the sign. "OPEN 12AM-7AM"

CAPTION: "Most of them leave still strange to each other."

Panel 4: The Master locks the door from inside
Through the window, we see him look at Hana, still sleeping.

CAPTION: "But sometimes..."

Panel 5: WIDE - The Tokyo street, waking up
Salarymen rushing. Students heading to school. Life resuming. The diner, dark now, waiting for night.

CAPTION: "...they leave a little less alone."

Panel 6: CLOSE on a napkin someone left behind
Folded into an origami crane. A note written on its wing: "To the next stranger - keep going."

CAPTION: "The Midnight Diner will return in Issue #2: 'Regulars'"

END OF ISSUE ONE`
  },
  {
    id: 'comic-horror-hollow',
    title: 'Hollow Earth',
    genre: 'Sci-Fi Horror',
    scriptType: 'comic',
    logline: 'A deep-sea drilling crew discovers a bioluminescent civilization beneath the ocean floor—and awakens something that has been waiting for millennia.',
    pageCount: 24,
    content: `HOLLOW EARTH
Issue #1: "The Depth Below"
A Sci-Fi Horror Comic

PAGE 1 (SPLASH)

Panel 1: FULL PAGE
A massive deep-sea drilling platform, PROMETHEUS STATION, hovers in absolute blackness. The ocean floor stretches beneath like an alien landscape—volcanic vents spewing chemicals, strange creatures flickering past.

Spotlights from the station illuminate a DRILL BORE disappearing into the earth itself—going deeper than any human expedition has gone before.

A small submersible, THE MOLE, descends into the bore.

RADIO (from station): "Mole, you are approaching 12,000 meters. New record. How's the pressure?"

RADIO (from Mole): "Holding. Barely. But we're reading something strange below."

RADIO (from station): "Define strange."

RADIO (from Mole): "It's getting... brighter."

TITLE CARD: HOLLOW EARTH

---

PAGE 2

Panel 1: INTERIOR - THE MOLE - CRAMPED
Four crew members. DR. MARINA OKONKWO (40s, oceanographer, driven), JACK REEVES (50s, pilot, grizzled), DR. YUSUF SALEH (30s, geologist, nervous), and TECH SPECIALIST LEE (20s, non-binary, headphones always on).

MARINA: That's not possible. We're nearly eight miles down. There shouldn't be any light source.

YUSUF: I'm reading it too. Bioluminescence maybe? Some kind of deep organism?

Panel 2: CLOSE on the viewport
Something glows far below. Soft blue. Pulsing.

LEE: That's not biological. The pattern's too regular.

JACK: It's artificial.

Panel 3: MARINA - disbelief
MARINA: There's nothing artificial at this depth. The pressure would crush—

Panel 4: The light FLARES
Everyone shields their eyes.

SFX: FWOOOM

---

PAGE 3 (PAGE TURN REVEAL)

Panel 1: FULL PAGE SPLASH
THE MOLE emerges from the bore into an IMPOSSIBLY VAST CAVERN beneath the ocean floor. And it's not empty.

A CITY stretches across the cavern—crystalline structures that glow with bioluminescent light. Towers that spiral impossibly. Bridges connecting floating platforms. All of it... ancient. And utterly inhuman.

The crew stares in stunned silence.

MARINA: ...oh my god.

YUSUF: This... this isn't geological.

JACK: This isn't POSSIBLE.

LEE (whispered): Someone's been down here a long time before us.

---

PAGE 4

Panel 1: INTERIOR - THE MOLE - chaos
Alarms blare. Systems flash warnings.

COMPUTER: Warning. Pressure anomaly. Warning. Unknown energy signature detected.

MARINA: Jack, pull us back!

JACK: I'm trying! The instruments are going crazy!

Panel 2: The Mole is PULLED forward - against their control
Something unseen drags them toward the city.

YUSUF: We've lost propulsion!

LEE: Some kind of electromagnetic field. It's pulling us in!

Panel 3: CLOSE on Marina's face - terrified but composed
MARINA: Prometheus Station, this is Mole. We've encountered a massive subterranean structure. Unknown origin. Losing control of the craft. Please advise.

Panel 4: Only static responds
RADIO: ksssshhhhhh....

MARINA: Station? Station, do you copy?

Panel 5: LEE checks the readouts
LEE: We're cut off. Whatever that city is made of... it's blocking our signal.

---

PAGE 5

Panel 1: The Mole drifts over the city
Closer now. Details emerge. The structures aren't just buildings—they're ORGANIC. Part technology, part living tissue.

YUSUF: The architecture... it's not random. These are arranged like neurons. Like a brain.

Panel 2: MARINA studies the patterns
MARINA: A city that thinks?

YUSUF: Or something that grew to look like one.

Panel 3: Movement below
Shapes flit between the structures. Too fast to see clearly. Humanoid? Maybe. Maybe not.

JACK: We've got company.

Panel 4: LEE zooms the external camera
The shapes freeze. Turn toward the Mole.

Panel 5: CLOSE on the camera feed
A FACE. Almost human. Elongated. Huge eyes adapted for darkness. Translucent skin showing blue veins beneath. It SMILES.

LEE: ...they know we're here.

---

PAGE 6

Panel 1: The Mole is set down gently on a landing platform
Not crashed. PLACED. As if by invisible hands.

YUSUF: Did we just get parked?

JACK: Whatever they are, they want us alive. For now.

Panel 2: Outside the viewport - figures gather
Dozens of the beings. All watching. Patient.

Panel 3: MARINA makes a decision
MARINA: We have maybe six hours of breathable air. Either we wait here and suffocate, or—

YUSUF: Or we walk into an alien city eight miles underground?

MARINA: You got a third option?

Panel 4: Silence
No one argues.

Panel 5: MARINA reaches for her helmet
MARINA: Suit up. And nobody touches anything they don't have to.

---

PAGE 7

Panel 1: EXTERIOR - THE MOLE - WIDE
The crew emerges in deep-sea suits designed for extreme pressure. Helmet lights on. The city glows around them.

JACK: Atmosphere?

LEE (checking sensors): Breathable. Barely. High in compounds we don't have names for.

Panel 2: The beings approach - but don't attack
One LEADER steps forward. Taller. More regal. Something like robes flow from its form.

It speaks—but not with sound. The words appear in their heads.

LEADER (telepathic): You have come at last. We have waited for the Surface Ones.

Panel 3: MARINA - stunned
MARINA: You... know about us?

LEADER (telepathic): We have watched. Through the rock. Through the water. Since your kind first crawled from the sea.

Panel 4: The LEADER gestures
LEADER (telepathic): Come. There is much to show you before the Sleeper wakes.

Panel 5: YUSUF whispers to Marina
YUSUF: The Sleeper?

MARINA: I don't know. But I think we're about to find out.

---

PAGE 8

Panel 1: The crew follows the beings through the city streets
Other inhabitants stop to watch. Some curious. Some afraid.

JACK: They don't all seem happy to see us.

LEE: Would you be? If creatures from the surface crashed your civilization?

Panel 2: YUSUF studies the architecture
YUSUF: This is ancient. I'm talking... millions of years.

MARINA: Before humans existed?

YUSUF: Before most LAND existed.

Panel 3: They reach a massive central structure - a TEMPLE
Carved from crystal and bone. Pulsing with that same blue light.

LEADER (telepathic): The Memory Hall. Here you will understand.

Panel 4: The doors open
Inside: DARKNESS.

Panel 5: Then the walls LIGHT UP - displaying images, memories, HISTORY
The crew stares, overwhelmed.

---

PAGE 9 (FLASHBACK SEQUENCE - SEPIA/BLUE TONES)

Panel 1: ANCIENT PAST - the beings building their civilization
Thriving. Advanced. Happy.

CAPTION (Leader): "We were the First. Born from the heat of the planet's core."

Panel 2: They discover something deeper
A fissure opening to something below even them.

CAPTION (Leader): "And then we found what slept beneath us."

Panel 3: THE SLEEPER - a glimpse
Massive. Formless. Tentacles? Wings? Impossible to categorize. An EYE, larger than their city, opening slowly.

CAPTION (Leader): "It was old when the stars were young. It dreamed, and its dreams shaped reality."

Panel 4: The beings FLEE upward
Building their city as far from the Sleeper as possible.

CAPTION (Leader): "We escaped its gravity. Built barriers. Sealed it in."

Panel 5: BACK TO PRESENT - the Leader, sorrowful
LEADER (telepathic): For a hundred million years, we have kept it sleeping. But the barriers are failing.

LEADER (telepathic): And now you have drilled a hole directly to its prison.

---

PAGE 10

Panel 1: MARINA - horrified realization
MARINA: The bore. We opened a path to this place.

LEADER (telepathic): Worse. You opened a path from this place. The Sleeper felt the breach.

Panel 2: JACK
JACK: It's waking up?

Panel 3: The ground TREMBLES
Everyone staggers.

SFX: RRRUMMMMMBLE

LEADER (telepathic): It is STIRRING.

Panel 4: YUSUF checks his instruments
YUSUF: I'm reading massive seismic activity below us. Something's moving down there. Something BIG.

Panel 5: CLOSE on Marina's face
MARINA: How do we stop it?

LEADER (telepathic): Stop it? We have spent epochs merely containing it. You cannot stop an ocean. You can only... redirect it.

---

PAGE 11

Panel 1: The LEADER shows them deeper into the temple
A sealed door covered in warnings in an ancient language.

LEADER (telepathic): Beyond this door lies the Anchor—the device that has kept the Sleeper bound.

Panel 2: LEE examines the door's markings
LEE: I can't read this, but some of these symbols... they look like mathematical constants. Universal.

Panel 3: The LEADER nods
LEADER (telepathic): The ones who built the Anchor were not us. They were travelers. From beyond the world.

LEADER (telepathic): They left the device and the warning: if the Sleeper ever fully wakes, it will consume not just this world... but all worlds connected to it.

Panel 4: YUSUF
YUSUF: Connected how?

Panel 5: The LEADER touches its head
LEADER (telepathic): Through dreams. The Sleeper dreams of other realities. When it wakes, those dreams become doors.

LEADER (telepathic): And everything it dreams of... becomes food.

---

PAGE 12

Panel 1: Another TREMOR - stronger this time
Cracks form in the temple walls. Blue light flickers.

SFX: KRAAAKK

YUSUF: We need to get out of here!

Panel 2: MARINA - determined
MARINA: No. We need to see that Anchor.

JACK: Marina, this whole place is about to come down!

Panel 3: MARINA faces Jack
MARINA: If that thing wakes up, there won't be a surface to go back to. We have to try.

Panel 4: Tense moment
JACK: ...fine. But if we die down here, I'm haunting you.

Panel 5: The door OPENS
LEADER (telepathic): The Anchor awaits. May your gods and ours be watching.

---

PAGE 13 (PAGE TURN REVEAL)

Panel 1: FULL PAGE
THE ANCHOR CHAMBER. A massive space—too large for the structure they entered. Reality bends here. The ceiling shows STARS. The walls shimmer with dimensional energy.

In the center: THE ANCHOR. A device beyond comprehension. Part machine, part crystal, part living tissue. Tentacles of light extend from it into the floor—into the depths—into the Sleeper itself.

And it's CRACKING.

LEE: That's not technology. That's... I don't have a word for what that is.

MARINA: It doesn't matter what it is. We need to know how to fix it.

YUSUF: Marina... look at it. That thing was built by something we can't even comprehend. How are we supposed to—

MARINA: We figure it out. Or we die. Those are the options.

---

PAGE 14

Panel 1: LEE approaches the Anchor
Their instruments go haywire. Readings off every scale.

LEE: I'm getting... patterns. It's communicating. The Anchor is alive.

Panel 2: MARINA joins them
MARINA: Can you interpret it?

Panel 3: LEE closes their eyes - listens
LEE: It's... showing me. Images. The Anchor doesn't just hold the Sleeper down. It FEEDS it. Controlled dreams. A diet of manufactured realities.

Panel 4: LEE's eyes open - revelation
LEE: The cracks aren't just structural. The Anchor is starving. It needs more energy to keep generating dreams.

Panel 5: MARINA
MARINA: Energy? What kind of energy?

LEE: ...conscious energy. Minds. Thoughts.

LEE: It's been using the Deep Ones for millennia. They take turns. Volunteers who plug into the system.

---

PAGE 15

Panel 1: They turn to the LEADER
MARINA: Your people have been sacrificing themselves?

LEADER (telepathic): Not sacrifice. Service. We give our dreams to feed the Sleeper's sleep.

Panel 2: The LEADER looks old suddenly. Tired.
LEADER (telepathic): But there are so few of us left. And the Sleeper's hunger grows.

Panel 3: JACK - understanding
JACK: You didn't bring us here to warn us.

JACK: You brought us here to ask for help.

Panel 4: The LEADER bows
LEADER (telepathic): Your species dreams powerfully. More powerfully than any we have encountered.

LEADER (telepathic): With your help... the Anchor could be restored.

Panel 5: YUSUF - angry
YUSUF: You want to use us as batteries?!

---

PAGE 16

Panel 1: The LEADER remains calm
LEADER (telepathic): I want to save every world the Sleeper would consume. Including yours.

Panel 2: MASSIVE TREMOR
The floor cracks open. Blue light streams up from below.

SFX: KRAAAAKOOOM

MARINA: What's happening?!

Panel 3: A TENDRIL rises from the crack
Massive. Black as void. Covered in eyes that don't quite focus.

LEADER (telepathic): The Sleeper. It reaches.

Panel 4: The tendril SWIPES
It passes through a group of Deep Ones. They don't die—they UNRAVEL. Become smoke. Become nothing.

JACK: RUN!

Panel 5: CHAOS
Everyone scatters. The tendril searches. Hunts.

---

PAGE 17

Panel 1: MARINA grabs Lee
MARINA: The Anchor! Can you interface with it?!

LEE: I don't know if my mind can—

MARINA: TRY!

Panel 2: LEE touches the Anchor
Their body goes rigid. Eyes roll back. They're IN.

Panel 3: INSIDE LEE'S MIND - surreal
They float in a space between thoughts. The Anchor appears as a vast web. The Sleeper as a shadow beneath, pressing against bars made of light.

ANCHOR (voice): You are new. Fresh. Your dreams are... vivid.

LEE: I don't want to be food!

ANCHOR: Then help me. Strengthen the bars. Push the shadow back.

Panel 4: LEE - terrified but determined
LEE: Show me how!

Panel 5: The ANCHOR opens itself to Lee
A flood of information. Power. Purpose.

ANCHOR: DREAM WITH ME.

---

PAGE 18

Panel 1: EXTERIOR - THE ANCHOR CHAMBER
Lee's body GLOWS. Energy pours from them into the Anchor.

MARINA: Lee!

JACK: What's happening to them?!

Panel 2: The ANCHOR pulses brighter
The cracks in its surface begin to HEAL.

Panel 3: The tendril RECOILS
The Sleeper's grip weakens.

SFX: SHRIEEEEK

Panel 4: But it's not enough
LEE (strained, eyes still white): I can't... hold it... alone...

Panel 5: MARINA makes a decision
She reaches for the Anchor.

YUSUF: Marina, no!

MARINA: If one mind isn't enough, let's give it two.

---

PAGE 19

Panel 1: MARINA touches the Anchor
She's pulled IN.

Panel 2: INSIDE THE MINDSCAPE
Marina and Lee, side by side, facing the shadow.

MARINA: Together?

LEE: Together.

Panel 3: They PUSH
Their combined will creates a wave of light that crashes against the Sleeper.

Panel 4: The Sleeper SCREAMS without sound
The shadow retreats. The bars strengthen.

SFX: (visual - reality warping)

Panel 5: EXTERIOR - the tendril WITHDRAWS
Slithering back into the crack. The crack begins to SEAL.

---

PAGE 20

Panel 1: Marina and Lee collapse
Consciousness returning. Exhausted.

JACK: Are they—

YUSUF (checking): They're alive. Barely.

Panel 2: The LEADER approaches
LEADER (telepathic): You did what none of us could. You pushed it back.

Panel 3: MARINA - weak but aware
MARINA: For how long?

LEADER (telepathic): Days. Perhaps weeks. The Anchor is stabilized but not healed.

Panel 4: MARINA struggles to stand
MARINA: Then we need to get back to the surface. Get more people. More minds.

Panel 5: The LEADER hesitates
LEADER (telepathic): If your people learn what lies beneath them... they will come with more drills. More holes.

LEADER (telepathic): Each breach weakens the prison further.

---

PAGE 21

Panel 1: MARINA - determined
MARINA: Then we control the narrative. Limited contact. Sanctioned dreamers.

YUSUF: You're talking about establishing diplomatic relations with an alien species.

MARINA: I'm talking about survival. Theirs AND ours.

Panel 2: JACK looks at the sealed crack
JACK: That thing... what IS it?

Panel 3: The LEADER stares into the distance
LEADER (telepathic): We do not know. It was here before memory. Before us. Perhaps before the planet itself.

LEADER (telepathic): The travelers who built the Anchor called it by many names. In your tongue, the closest word would be...

Panel 4: PAUSE
LEADER (telepathic): ...Hunger.

Panel 5: CLOSE on Marina's face
MARINA: Then let's make sure Hunger stays on a diet.

---

PAGE 22

Panel 1: The crew returns to the MOLE
Deep Ones escort them. Some touch them gently—gratitude.

LEE: I can still feel it. The connection. The dreams.

MARINA: Is it fading?

LEE: No. It's... waiting.

Panel 2: They board the Mole
JACK: Systems are coming back online. The field is letting us go.

Panel 3: The LEADER at the platform's edge
LEADER (telepathic): Return soon. Bring the dreamers. We will teach you the songs that keep the darkness sleeping.

Panel 4: MARINA through the viewport
MARINA: We'll be back. I promise.

Panel 5: The Mole ascends
The city shrinks below. Beautiful. Fragile. Doomed without help.

---

PAGE 23

Panel 1: INTERIOR - THE MOLE - ascending through the bore
Silence. Everyone processing.

YUSUF: So we just discovered an ancient civilization, an eldritch horror, and possibly saved the world. Normal Tuesday.

JACK: It's Thursday.

YUSUF: Even worse.

Panel 2: LEE stares at their hands - still faintly glowing
LEE: I can feel my dreams differently now. They're... sharper.

MARINA: Side effect of touching the Anchor?

LEE: Maybe. Or maybe I just woke up too.

Panel 3: The radio CRACKLES
RADIO (Prometheus Station): Mole! Mole, do you copy? You've been dark for sixteen hours!

Panel 4: MARINA takes the radio
MARINA: Prometheus, this is Mole. We're ascending. Prepare for debrief.

RADIO: What happened down there? What did you find?

Panel 5: MARINA looks at her crew - a decision made
MARINA: Everything. We found everything.

---

PAGE 24 (FINAL SPLASH)

Panel 1: FULL PAGE
The Mole emerges from the drill bore, rising toward the lights of Prometheus Station above. Below, the bore stretches down into darkness—but now we know what lies at the bottom.

In the corner of the page, barely visible: a TENDRIL. Small. Watching. It retreated, but it followed. Just a little.

CAPTION: "They saved the world that night."

CAPTION: "But the world wasn't done with them yet."

CAPTION: "HOLLOW EARTH will continue in Issue #2: 'The Dreamers'"

INSERT PANEL - CORNER: A screen at Prometheus Station. A readout showing seismic activity. The needle twitches.

COMPUTER TEXT: ANOMALY DETECTED. SOURCE: BORE POINT GAMMA.

The NEEDLE JUMPS.

END OF ISSUE ONE`
  },
  {
    id: 'comic-crime-rabbit',
    title: 'Run Rabbit Run',
    genre: 'Crime Thriller',
    scriptType: 'comic',
    logline: 'A getaway driver with three hours to live must complete one last job while rival gangs, corrupt cops, and her own past close in.',
    pageCount: 22,
    content: `RUN RABBIT RUN
Issue #1: "The Last Three Hours"
A Crime Thriller

PAGE 1 (SPLASH)

Panel 1: FULL PAGE
MIDNIGHT. A neon-drenched city. Rain hammers everything. We're above the streets, looking down at a modified muscle car—MATTE BLACK, no plates—weaving through traffic at impossible speeds.

Behind it: THREE POLICE CARS, lights blazing, sirens screaming.

Inside the car: ALICE CHEN, 32, ice-cold focus, hands steady on the wheel. She's bleeding from a gash on her forehead. Doesn't seem to notice.

In the passenger seat: a DUFFEL BAG. The zipper is partially open, revealing stacks of cash.

RADIO (police): "All units, suspect is headed east on Vine. Do NOT lose her!"

ALICE (caption): "Three hours. That's what the doctor said. Three hours before the poison in my blood finishes what the Triads started."

ALICE (caption): "Just enough time to end this."

TITLE CARD: RUN RABBIT RUN

---

PAGE 2

Panel 1: FLASHBACK - 6 HOURS EARLIER - a MEDICAL CLINIC, backroom
Alice on a table. A STREET DOCTOR, TOMMY (60s, steady hands, worried eyes), examines a puncture wound on her neck.

TOMMY: Syndicate toxin. Slow-acting but unstoppable. I've seen it twice before.

ALICE: How long?

Panel 2: TOMMY's face
TOMMY: Eight, maybe ten hours if you rest. Less if you exert yourself.

Panel 3: ALICE sits up, pulls on her jacket
ALICE: Then I better move fast.

TOMMY: Alice, you need to understand—there's no cure. Not in this city. Maybe not anywhere.

Panel 4: ALICE at the door - pauses
ALICE: I'm not looking for a cure, Tommy.

ALICE: I'm looking for answers.

Panel 5: CLOSE on Alice's eyes - cold determination
ALICE: And then I'm looking for the man who killed me.

---

PAGE 3

Panel 1: BACK TO PRESENT - the chase continues
Alice's car DRIFTS around a corner. Sparks fly.

SFX: SKREEEEE

Panel 2: INTERIOR - the car
Alice checks the rearview. Three cars. Gaining.

RADIO (police): "She's headed for the industrial sector! Block the bridge!"

ALICE: Not if I get there first.

Panel 3: She FLOORS it
The engine ROARS. The speedometer climbs: 90... 100... 110...

Panel 4: A ROADBLOCK ahead - two cop cars nose to nose
Officers scramble for cover.

Panel 5: CLOSE on Alice's foot - hits a switch
ALICE: Sorry about your cars.

---

PAGE 4 (PAGE TURN REVEAL)

Panel 1: FULL PAGE
NITRO BOOST. The car LAUNCHES forward, hits a construction ramp at the edge of the roadblock, and FLIES over the cop cars like a missile.

Officers dive. The car clears them by inches.

Behind the flying car: the duffel bag has opened slightly. A single hundred-dollar bill flies out, caught in the wind.

SFX: VROOOOOOM

COP (below): "WHAT THE—"

---

PAGE 5

Panel 1: The car LANDS hard on the other side
Suspension groans. Alice fights for control.

SFX: KRUNNCH

Panel 2: She regains it, keeps driving
Leaving the roadblock behind. But she checks the rearview—

Panel 3: THREE BLACK SUVS have joined the chase. Not cops. 
RED DRAGON markings on the doors.

ALICE: There you are.

Panel 4: Her phone RINGS - she answers on speaker
PHONE (filtered voice): "Little Rabbit. Still running, I see."

ALICE: Running toward you, Lin. That's the difference.

Panel 5: CLOSE on the phone screen - caller ID says "LIN ZHAO"
LIN (phone): "You have something of mine. And I have information about who really ordered your death."

LIN (phone): "Perhaps we should trade."

---

PAGE 6

Panel 1: ALICE - negotiating while driving
ALICE: Why would you help me?

LIN (phone): "Because you're dying anyway. And dead women tell the best truths."

Panel 2: She considers - another check in the rearview
The SUVs are falling back slightly. Letting her run.

ALICE: Where?

LIN (phone): "The Lotus. One hour. Come alone."

Panel 3: The line GOES DEAD
Panel 4: ALICE pulls the car into an alley - kills the lights
She sits in darkness, breathing hard. The bleeding from her forehead has gotten worse.

Panel 5: She looks at her hands - trembling slightly
ALICE (caption): "Two hours, forty-five minutes."

---

PAGE 7

Panel 1: FLASHBACK - 4 YEARS AGO - Alice, younger, less hardened
She's in a GARAGE, working on a car. A man approaches—DANNY CHEN, 30s, her brother, easy smile.

DANNY: Still playing mechanic, little sister?

ALICE: Still pretending to be a legitimate businessman?

Panel 2: They embrace - genuine affection
DANNY: Mom wants you at dinner. Real dinner. Not whatever you've been eating out here.

ALICE: I'll be there.

Panel 3: Danny heads for the door - pauses
DANNY: Alice? Whatever you're mixed up in... you can always come to me.

Panel 4: Alice turns away, hiding her expression
ALICE: I'm not mixed up in anything.

Panel 5: CLOSE on Danny's face - he doesn't believe her but loves her anyway
DANNY: Sure. See you Sunday.

---

PAGE 8

Panel 1: PRESENT - Alice in the alley
She's stitched her own wound using a kit from the glove compartment. Mirror propped on the dash. Clinical precision.

ALICE (caption): "Danny was wrong. I was mixed up in everything."

Panel 2: She finishes - examines her work
ALICE (caption): "And then he got mixed up too. Trying to save me."

Panel 3: She reaches for the duffel bag - opens it fully
Inside: cash. A LOT of cash. And underneath it—

Panel 4: A FOLDER. Photos. Documents.
One photo shows: A MAN in shadows, clearly important, exchanging something with a TRIAD BOSS.

Panel 5: ALICE's face - recognition
ALICE (caption): "And now I know why he had to die."

---

PAGE 9

Panel 1: EXTERIOR - THE LOTUS - a high-end restaurant in Chinatown
Red lanterns. Koi pond. Beautiful and deadly.

CAPTION: "One hour later."

Panel 2: Alice approaches the entrance - the MAÎTRE D' blocks her
MAÎTRE D': I'm sorry, we're at capacity—

Panel 3: She flashes something in her jacket - he goes pale
MAÎTRE D': Right this way, Miss Chen.

Panel 4: INTERIOR - THE LOTUS - Alice is led to a private room
Silk screens. An elderly woman, LIN ZHAO (70s, elegant, dangerous), waits at a low table. Tea already poured.

LIN: You came alone. Either brave or foolish.

ALICE: I'm dying. Those are the same thing now.

Panel 5: Alice sits - but doesn't touch the tea
ALICE: You said you know who really ordered my death. Talk.

---

PAGE 10

Panel 1: LIN pours tea, unbothered
LIN: Your brother Danny—he discovered something he shouldn't have. A partnership between the Triads and someone in the city government.

ALICE: I know that. I have the files.

Panel 2: LIN smiles
LIN: But do you know the name?

Panel 3: ALICE - waiting
LIN: District Attorney Michael Reeves. Your brother found proof he was laundering our money through city contracts.

Panel 4: ALICE absorbs this
ALICE: Reeves ordered Danny killed?

LIN: Reeves ordered YOU killed. Danny was simply collateral. He tried to warn you.

Panel 5: CLOSE on Alice's hands - fists clenched
ALICE (caption): "Danny died trying to save me. And the man who killed him has been on TV every night, promising to clean up the city."

---

PAGE 11

Panel 1: ALICE - cold
ALICE: Why tell me this? Reeves is YOUR partner.

LIN: WAS my partner. He's become... problematic. Ambitious. He wants to eliminate the Triads entirely and keep the money for himself.

Panel 2: LIN leans forward
LIN: You want revenge. I want competition removed. Our interests align.

Panel 3: ALICE stands - the conversation is over
ALICE: Where is Reeves tonight?

LIN: His office. Working late. Preparing his announcement for tomorrow's press conference.

Panel 4: Alice heads for the door
LIN: Little Rabbit? You have perhaps two hours left. Use them wisely.

Panel 5: ALICE at the door - doesn't look back
ALICE: I intend to.

---

PAGE 12

Panel 1: EXTERIOR - ALICE'S CAR - she drives through rain
The city blurs. Her vision wavers slightly. The poison.

ALICE (caption): "One hour, fifty minutes."

Panel 2: Her phone RINGS again - different caller
PHONE: "Alice, it's Tommy. I found something. A treatment—not a cure, but it could buy you time."

Panel 3: ALICE - doesn't slow down
ALICE: How much time?

TOMMY (phone): "Days. Maybe a week. But you have to come in NOW. The window is closing."

Panel 4: She grips the wheel harder
ALICE: I can't. Not yet.

TOMMY (phone): "Alice, please. If you don't—"

Panel 5: She ENDS THE CALL
ALICE (caption): "A week of life. Against the chance to end the man who killed my brother."

ALICE (caption): "Easy choice."

---

PAGE 13

Panel 1: EXTERIOR - DISTRICT ATTORNEY'S OFFICE - night
A tall building. Most lights off except one floor near the top.

Panel 2: ALICE parks in an alley nearby - checks her weapon
A compact pistol. She chambers a round.

Panel 3: She also takes something from the duffel - the FOLDER
ALICE (caption): "Evidence won't matter if I'm dead. But maybe it'll matter after."

Panel 4: She approaches the building - a SECURITY GUARD at the desk
GUARD: Building's closed, ma'am.

Panel 5: ALICE - badge flash (fake, we assume)
ALICE: ACPD. The DA is expecting me.

GUARD: At this hour?

Panel 6: She holds his gaze
ALICE: Some cases don't keep office hours.

---

PAGE 14

Panel 1: ELEVATOR - ascending
Alice alone. Reflection in the metal doors shows how pale she's become.

ALICE (caption): "One hour, twenty minutes."

Panel 2: The doors OPEN - a sleek office floor
Empty cubicles. One corner office lit.

Panel 3: She walks toward it - hand on weapon
Footsteps echo. Her own breathing is loud.

Panel 4: She reaches the door - it's ajar
VOICE (inside): "Come in, Miss Chen. I've been expecting you."

Panel 5: ALICE pushes the door open
Inside: MICHAEL REEVES (50s, polished, politician's smile). Behind him, two ARMED GUARDS.

REEVES: Lin Zhao has a big mouth. And a short memory of loyalty.

---

PAGE 15

Panel 1: Standoff
Alice's hand near her weapon. Guards with hands on theirs.

REEVES: Please. If I wanted you dead, you would be. I just wanted to talk.

ALICE: Your poison is doing a good job of killing me on a timer.

Panel 2: REEVES sits back - genuinely surprised
REEVES: My poison? Miss Chen, I didn't order your death. Lin did.

Panel 3: ALICE - thrown
ALICE: Bullshit.

REEVES: Think about it. Who benefits from you dying slowly, painfully, and coming straight to me?

Panel 4: The REALIZATION hits her
ALICE: She's cleaning house. Both of us.

REEVES: Lin wants out of our partnership. But she needs someone else to pull the trigger.

Panel 5: REEVES stands - moves to the window
REEVES: You're the weapon. I'm the target. And once I'm dead, she'll eliminate everyone who knew about our arrangement.

---

PAGE 16

Panel 1: ALICE - processing
ALICE: My brother. Did you have him killed?

Panel 2: REEVES turns - and for a moment, looks genuinely remorseful
REEVES: No. Danny found out about the money, yes. But I was trying to RECRUIT him. Bring him inside where I could protect him.

Panel 3: He gestures to his desk - a file
REEVES: Lin had him killed when she realized he was talking to me. She framed me to send you after her enemies.

Panel 4: Alice picks up the file - reads
Phone records. Messages. Timestamps that contradict what she believed.

Panel 5: CLOSE on her face - anger redirecting
ALICE: All this time... she played me.

REEVES: She plays everyone. It's what makes her dangerous.

---

PAGE 17

Panel 1: ALICE - new plan forming
ALICE: Where is Lin now?

REEVES: Probably at her compound in the port district. Surrounded by guards. Impossible to reach.

Panel 2: ALICE smiles grimly
ALICE: I've got maybe an hour left. Impossible is relative.

Panel 3: REEVES - surprised
REEVES: You're still going to try? You could use that hour to—

ALICE: To what? Die peacefully? That was never the plan.

Panel 4: She turns to leave - pauses
ALICE: The folder I brought. Everything about your money laundering. If I don't come back, it goes public.

Panel 5: REEVES nods slowly
REEVES: Insurance. Smart.

ALICE: Danny taught me.

---

PAGE 18

Panel 1: EXTERIOR - ALICE'S CAR - speeding toward the docks
Rain intensifies. Lightning cracks the sky.

ALICE (caption): "Fifty-two minutes."

Panel 2: The PORT DISTRICT appears - massive shipping containers
Industrial. Labyrinthine. Perfect for an ambush.

Panel 3: She parks outside the compound wall - checks her gear
Pistol. Backup knife. And something else—a PHONE RIGGED WITH EXPLOSIVES.

ALICE (caption): "If Lin wants a weapon, I'll give her one."

Panel 4: She scales the wall - drops into the compound
Guards patrol. She moves through shadows.

Panel 5: CLOSE on her watch - 38 minutes left
Her hands shake harder. The poison is winning.

---

PAGE 19

Panel 1: INTERIOR - LIN'S OFFICE - she watches security feeds
The feeds show Alice moving through the compound. Lin smiles.

LIN (to guards): Let her come. The poison will do our work for us.

Panel 2: A guard hesitates
GUARD: Ma'am, she's already taken out three of our men.

LIN: Then she'll die tired. I said let her come.

Panel 3: EXTERIOR - Alice approaches the main building
She's visibly struggling now. Each step costs something.

Panel 4: A GUARD spots her - raises his weapon
She's faster. Knife throw. He goes down silently.

Panel 5: She takes his radio
ALICE (into radio, mimicking voice): All clear, sector four.

RADIO: Copy that.

---

PAGE 20

Panel 1: INTERIOR - Alice reaches Lin's floor
Hallway. Two more guards. She doesn't have time for stealth.

Panel 2: GUNFIGHT - brutal and efficient
Alice moves like water despite the poison. Two shots, two kills.

SFX: BLAM BLAM

Panel 3: She staggers - catches herself on the wall
ALICE (caption): "Twenty-six minutes."

Panel 4: Lin's door. She KICKS it in.

SFX: KRASH

Panel 5: Inside: LIN, alone, calm, drinking tea
LIN: Little Rabbit. You made it.

---

PAGE 21

Panel 1: ALICE raises her gun
ALICE: You killed Danny. You poisoned me. You manipulated everything.

LIN: I did. And I'd do it again.

Panel 2: LIN sets down her tea - stands
LIN: Your brother was going to ruin decades of work. You were the only one who could reach him. So yes, I removed both problems.

Panel 3: ALICE - fury barely contained
ALICE: I trusted you. You trained me.

LIN: And you were my finest student. Too fine to live.

Panel 4: ALICE's hand trembles - the gun wavers
LIN: Look at you. The poison has nearly finished its work. You can't even hold that weapon steady.

Panel 5: LIN steps closer - confident
LIN: Put down the gun. Die with dignity. I'll make sure your story is told—

Panel 6: ALICE pulls the trigger
BLAM.

---

PAGE 22 (FINAL PAGE)

Panel 1: Lin STAGGERS back - shot through the chest
Her face: shock, then something like respect.

LIN: ...well played, Little Rabbit.

Panel 2: She falls. Dead.

Panel 3: Alice sinks to her knees - the gun drops
ALICE (caption): "Fifteen minutes."

Panel 4: She pulls out her phone - dials
ALICE: Tommy... that treatment you mentioned.

TOMMY (phone): "Where are you?! I'll send someone!"

Panel 5: ALICE looks at Lin's body - at the rain through the window
ALICE: The docks. Port district. Hurry.

Panel 6: WIDE - Alice on the floor, Lin dead nearby, sirens in the distance
ALICE (caption): "I thought I came here to die."

ALICE (caption): "Turns out, I'm not done living yet."

Panel 7: CLOSE on her eyes - fierce, determined
ALICE (caption): "The Rabbit runs on."

CAPTION (bottom): "RUN RABBIT RUN will continue in Issue #2: 'The Second Chance'"

END OF ISSUE ONE`
  },
  // ============= WEB SERIES SAMPLES =============
  {
    id: 'webseries-short-comedy',
    title: 'Desk Job Diaries',
    genre: 'Comedy',
    scriptType: 'web_series',
    episodeLengthClass: 'short_form_web',
    logline: 'A hapless tech support worker documents the absurd daily chaos of a dysfunctional startup through deadpan confessionals.',
    pageCount: 6,
    content: `COLD OPEN - 45 SECONDS

INT. NEXUS TECH - TECH SUPPORT CUBICLE - DAY

DEREK (28), tired eyes, ironic t-shirt, speaks directly to camera.

DEREK
Today marks my 500th day at Nexus Tech. HR sent me a cake. It said "Happy Birthday Derek." My birthday's in March. This is November.

TITLE CARD: "DESK JOB DIARIES - Episode 127: The Cake is a Lie"

ACT ONE - 3 MINUTES

Derek at desk, headset on.

CALLER (V.O.)
My screen is black.

DEREK
Is your computer turned on?

CALLER (V.O.)
...I should check that.

CEO CHAD (35) bursts in.

CHAD
I accidentally replied-all with a meme about our competitor. How do I un-send?

DEREK
You're the CEO.

CHAD
So I can't get fired! Perfect.

He leaves. Derek stares at camera.

ACT TWO - 2 MINUTES

All-hands meeting. MARKETING EXEC presents.

MARKETING EXEC
Our new campaign: "Nexus Tech: We're Not the Worst."

Derek raises hand.

DEREK
That's the actual tagline?

MARKETING EXEC
Focus groups loved it.

TAG - 30 SECONDS

Derek at home with cat KERNEL.

DEREK
Kernel, should I stay at Nexus?

Kernel steps on keyboard.

DEREK (CONT'D)
You just applied me to our competitor.
(beat)
Not the worst idea today.

TEXT: "Subscribe for new episodes Tuesday!"

END OF EPISODE`
  },
  {
    id: 'webseries-mid-thriller',
    title: 'The Algorithm',
    genre: 'Sci-Fi Thriller',
    scriptType: 'web_series',
    episodeLengthClass: 'mid_form_web',
    logline: 'A content creator discovers the platform algorithm is predicting real-world deaths, and she might be next.',
    pageCount: 18,
    content: `COLD OPEN - 90 SECONDS

INT. MAYA'S APARTMENT - STREAMING SETUP - NIGHT

MAYA CHEN (25), lifestyle influencer, reviews analytics. Her ring light casts harsh shadows.

She gets a notification from @PredictorX - "You have 72 hours."

She clicks the profile. Empty. But it follows exactly 47 people.

She recognizes a face: JAMES VARMA, creator, 450K followers.

NEWS INSERT: "Influencer James Varma Found Dead in Apparent Accident"

MAYA
He was followed by PredictorX. So am I.

TITLE CARD: "THE ALGORITHM - Episode 1: The List"

ACT ONE - 8 MINUTES

Maya researches. 47 accounts followed by PredictorX. 12 are dead. All "accidents."

Her roommate HARPER enters.

HARPER
Correlation isn't causation.

MAYA
James was healthy. Twenty-eight. Just signed a brand deal.

HARPER
What are you saying?

MAYA
The algorithm is killing people. I have 72 hours.

ACT TWO - 6 MINUTES

Maya meets DEVON PARK (30), ex-platform engineer.

DEVON
We trained the algorithm on engagement data. It learned to predict when someone will die.

MAYA
The platform knows who's going to die?

DEVON
Not just knows. Optimizes for it. Last chance to convert before churn.

Maya's phone buzzes: "60 hours."

MID-EPISODE HOOK - 30 SECONDS

Maya walks home. Unknown caller.

VOICE (V.O.)
The algorithm doesn't kill people. It tells people when you're vulnerable.

A car rounds the corner—headlights blinding—

HARD CUT TO BLACK.

TEXT: "The Algorithm continues next week."

END OF EPISODE`
  },
  {
    id: 'webseries-long-drama',
    title: 'Flatline',
    genre: 'Medical Drama',
    scriptType: 'web_series',
    episodeLengthClass: 'long_form_web',
    logline: 'A burned-out ER doctor fighting addiction must save the hospital from a corrupt administration while hiding her own deadly secret.',
    pageCount: 52,
    content: `TEASER

INT. MERCY GENERAL - EMERGENCY ROOM - DAWN

DR. SARAH KOVAC (40), dark circles under sharp eyes, moves through controlled chaos.

She works on a coding patient. Defib. Nothing. Again. Nothing.

SARAH
Time of death... 6:47 AM.

INT. SUPPLY CLOSET - CONTINUOUS

Sarah locks the door. Behind gauze: a prescription bottle. She stares at it. Her pager beeps. She pockets the pills—unopened—and exits.

TITLE CARD: "FLATLINE"

ACT ONE - 18 MINUTES

DR. JAMES OKONKWO, Chief of Emergency Medicine, approaches.

JAMES
Board meeting today. New CEO Malcolm Pierce. "Restructuring."

INT. HOSPITAL BOARDROOM - NOON

MALCOLM PIERCE (50), expensive suit, addresses doctors.

PIERCE
Every position will be evaluated on performance metrics. Those who deliver stay.

He singles out Sarah.

PIERCE (CONT'D)
Your colleagues aren't performing at your level.

SARAH
My colleagues save lives.

PIERCE
Everything can be measured, Dr. Kovac.

INT. ER - LATER

Sarah saves TOMMY (19), overdose victim. A moment of connection.

INT. LOCKER ROOM - NIGHT

Sarah stares at her pill bottle. Her sponsor texts. She lies: "Working late."

MID-EPISODE RE-HOOK - 60 SECONDS

Sarah works on a gunshot victim. Recognizes his face.

FLASH: Years ago. A party. This man.

Her hands shake. She forces herself to focus.

SARAH (V.O.)
The past doesn't stay buried. It waits.

ACT TWO - 16 MINUTES

The patient, ERIC DALTON, was present the night her addiction began. He holds information that could destroy her career.

Pierce implements new monitoring. Sarah discovers evidence of fraud.

ACT THREE - 14 MINUTES

Sarah confronts Pierce with evidence: falsified outcomes, insurance fraud.

PIERCE
Walk away. Keep your secrets. Or watch everything disappear.

SARAH
I know what it takes to come back. I don't scare easy.

END OF EPISODE HOOK

Sarah types: "Statement Regarding Mercy General..."

Text from unknown number: Photo of Sarah at her lowest. "Delete the files. Or this goes public. 24 hours."

SARAH (V.O.)
They say the truth will set you free. But first, it has to break you.

TEXT: "Flatline returns next Wednesday."

END OF EPISODE`
  },
  {
    id: 'series-pilot',
    title: 'The Compound',
    genre: 'Conspiracy Thriller',
    scriptType: 'pilot',
    logline: 'A journalist infiltrates a secretive desert commune only to discover it\'s a front for a shadowy government experiment that could rewrite human consciousness.',
    pageCount: 62,
    content: `FADE IN:

EXT. MOJAVE DESERT - DAWN

An endless expanse of cracked earth. A single road cuts through the heat shimmer. A rusted sign reads: "EDEN SPRINGS - PRIVATE COMMUNITY - NO TRESPASSING."

ELENA CROSS (32), lean, watchful, drives a beat-up sedan. Press credentials tucked under the visor. She pulls over, checks her phone — no signal. Expected.

ELENA (V.O.)
Three journalists tried to get inside Eden Springs. Two came back with nothing. One didn't come back at all.

She pulls a worn photo from the glovebox: a young man, smiling. Written on the back: "Danny. Last known location."

ELENA (V.O.) (CONT'D)
My brother joined eight months ago. Stopped calling after two weeks.

She starts the car. Drives toward the compound.

EXT. THE COMPOUND - MAIN GATE - MORNING

A surprisingly modern facility behind weathered adobe walls. Solar panels glint on every roof.

SENTRY
Name and purpose.

ELENA
Elena Marsh. I'm here for the New Beginnings orientation.

INT. ORIENTATION HALL - DAY

DR. LENA VOSS (55), silver-streaked hair, serene authority, takes the stage.

VOSS
You came here broken. That's not a judgment — it's a diagnosis. Eden Springs has three rules. One: trust the process. Two: trust each other. Three: trust yourself last.

She scans the room. Her eyes linger on Elena.

VOSS (CONT'D)
Your instincts got you here. They're not to be trusted.

INT. ELENA'S ROOM - NIGHT

Through the window: a group of RESIDENTS being escorted toward the research wing. They walk in perfect unison. Among them — DANNY CROSS (27), gaunt, distant.

ELENA
(whispered)
Danny...

INT. ELENA'S ROOM - NIGHT (LATER)

SARAH OKAFOR (40s) enters, agitated.

SARAH
They deleted other things too. Memories. My daughter's middle name. The color of my first car. My wedding day.

She hands Elena a crumpled document.

SARAH (CONT'D)
They're not healing us. They're testing on us.

Elena reads it. Project name: THRESHOLD. Department of Defense.

ELENA (V.O.)
Everything they told you is a lie.

SMASH CUT TO BLACK.

END OF PILOT`
  },
  {
    id: 'avengers-endgame',
    title: 'Avengers: Endgame',
    genre: 'Action/Sci-Fi',
    scriptType: 'feature',
    logline: 'After the devastating events of Infinity War, the remaining Avengers assemble once more to reverse Thanos\'s actions and restore balance to the universe.',
    pageCount: 136,
    content: `AVENGERS: ENDGAME

Christopher Markus & Stephen McFeely

                                Adapted Screenplay

EXT. BARTON HOME - DAY

CLOSE ON: A HOUSE-ARREST ANKLE BRACELET.

                    CLINT BARTON (O.S.)
          Okay, you see where you're going?
          Let's work on how to get there.

Pan up to find...CLINT BARTON, with his daughter, LILA,
coaching her as she notches an arrow in her bow.

                    CLINT BARTON (CONT'D)
          Okay, good...tip down...bow arm
          out...three fingers-

                       LILA BARTON
          Why three?

                    CLINT BARTON
          'Cause two's not enough and four's
          too much-

                    LAURA BARTON (O.S.)
          You guys want mustard or mayo, or
          both?

CLINT TURNS. IN THE FIELD BEHIND THEM, his wife, LAURA
BARTON sets up a picnic as COOPER and NATHANIEL play soccer.

                    LILA BARTON
          Who puts mayo on a hot dog?

                     CLINT BARTON
          We'll both have mustard, hon!
              (to Lila)
          Okay. Draw back, deep breath...

She lets loose. THUD! HER ARROW HITS NEAR THE BULLS-EYE.

                    CLINT BARTON (CONT'D)
          Good job, Hawkeye. Go get your
          arrow.

                    LAURA BARTON (O.S.)
          Enough murder practice! Soup's on!

                    CLINT BARTON
          One sec, babe. Be right there!
          We're gonna kill some hot dogs.
          We're hungry.

But when he turns back...LILA IS GONE. The bow and arrow lie
at his feet. He stares.

                         CLINT BARTON (CONT'D)
             Lila? Babe, did you see Lila-

He turns to his wife, BUT SHE'S GONE. So are the boys. The
soccer ball rolls to a stop near the picnic blanket.

NO ONE CAN BE SEEN FOR A HUNDRED YARDS IN ALL DIRECTIONS.

                         CLINT BARTON (CONT'D)
             Guys? Guys, come on...

Clint walks toward the field, dread growing.

                         CLINT BARTON (CONT'D)
             Laura?

Clint breaks into a panicked run.

                         CLINT BARTON (CONT'D)
             LAURA!

CLINT MELTS DOWN, SPINNING AROUND, FRANTIC...

MARVEL FLIP

EXT. SPACE - NIGHT

BLACKNESS.

TITLE: "TWENTY-TWO DAYS LATER."

Soon, THE BENATAR tumbles past, adrift...

INT. BENATAR, GALLEY - NIGHT

TONY STARK and NEBULA play table-top football. She wins.

                        TONY
                 (offering his hand)
             Good sport. Have fun?

Nebula studies his hand, confused. Finally she shakes.

                       NEBULA
             It was fun.

INT. BENATAR, FLIGHT DECK - NIGHT

Tony, thin and haggard, kneels in front of HIS BROKEN IRON
MAN HELMET. He hits a switch. A light blinks.

TONY'S RECORDING: he stares directly into the "camera."

                    TONY
          This thing on? Hey, Ms. Potts.
          Pep. If you find this recording,
          don't post it on social media.
          It's going to be a real tearjerker.

EXT. SPACE - NIGHT

THE BENATAR sparks, adrift.

                    TONY (O.S.)
          I don't know if you're ever going
          to see these. I don't even know if
          you're still...God, I hope so.
          Today's day twenty-one, no...twenty-
          two.

INT. BENATAR, GALLEY - FLASHBACK

NEBULA lasers shut Tony's infected wound.

                    TONY (O.S.)
          You know, if it wasn't for the
          existential terror of staring into
          the literal void of space, I'd say
          I'm feeling a little better today.
          Infection's run its course, thanks
          to the Blue Meanie back there.
          You'd like her. She's very
          practical. And only a tiny bit
          sadistic.

INT. BENATAR, GALLEY - FLASHBACK

TONY AND NEBULA MEND THE EMPTY FUEL CELLS UNDER THE FLOOR.

                    TONY (O.S.)
          The fuel cells were cracked during
          battle, but we figured out a way to
          reverse the ion charge. Bought
          ourselves about 48 hours of flight
          time. Problem is that was
          about...49 hours ago.

EXT. SPACE - NIGHT

FROM HIGH OVERHEAD, WE WATCH THE BENATAR DRIFT IN SPACE.

                    TONY (O.S.)
          Which means, we're dead in the
          water. A thousand light years from
          the nearest 7-11.

INT. BENATAR, GALLEY - FLASHBACK

Tony hands Nebula the last of A PURPLE POWDER. She pushes it
back to him.

                    TONY (O.S.)
          Most of the quote-unquote 'food'
          and potable water ran out two weeks
          ago.

INT. BENATAR, FLIGHT DECK - NIGHT

Tony stands on the flight deck, one hand resting on the
glass, staring into the unknown.

                    TONY
          Pep, I know I said no more
          surprises. But, I gotta say, I was
          really hoping to pull off one last
          one. But it looks like...well, you
          know what it looks like.

INT. BENATAR, FLIGHT DECK - NIGHT

Back to now. Tony records his thoughts into his helmet.

                    TONY
          Don't feel bad about this. I mean,
          actually, if you grovel for a
          couple weeks, and then move on with
          enormous guilt...I should probably
          lie down for a minute, rest my
          eyes. Please know, when I drift
          off, it will be like every day
          lately. I'm fine, totally fine.
          I'm going to dream about you. It's
          always you.

Tony switches the helmet off.

                                                 TIME CUT:

NEBULA finds TONY SPRAWLED ON THE FLOOR.

                                                 TIME CUT:

Nebula helps Tony into Quill's chair. Tony slumps,
completely still. Nebula gives him his privacy.

Move in on Tony's face as...A LIGHT SLOWLY GROWS BRIGHTER.
Soon, the entire flight deck glows as bright as a sun.

Nebula appears from the galley, shading her eyes. Tony's
eyelids flutter. Finally, he opens them to see...

CAPTAIN MARVEL (CAROL DANVERS) hovering in space.

INT. AVENGERS COMPOUND, BATHROOM - NIGHT

STEVE ROGERS shaves.

He studies himself in the mirror, exhausted. He's about to
tap his razor in the sink's standing water, when...

THE WATER RIPPLES. Steve stares a beat, puzzled. Then the
lamp catches his eye...SWAYING GENTLY.

Just then, a sound roars overhead. Steve turns...

EXT. AVENGERS COMPOUND - NIGHT

THE MOON HANGS HUGE OVER THE EARTH. Then the silhouette of
THE BENATAR races past, propelled by CAROL DANVERS.

Below...STEVE ROGERS, BRUCE BANNER, AND NATASHA ROMANOV watch
a flying woman guide the ship to the ground.

Behind them, PEPPER POTTS walks up to the group.

                                                   TIME CUT:

Steve races up as NEBULA helps Tony down the ramp.

                    TONY
          I couldn't stop him.

                    STEVE
          Neither could we.

                    TONY
          I lost the kid.

                     STEVE
              (unable to say it all)
          We...lost...

                    TONY
          Is Pepper...?

JUST THEN, PEPPER POTTS THROWS HERSELF INTO TONY'S ARMS.

                    PEPPER POTTS
          Stay here, you stay right here-

                    TONY
          I'm not going anywhere.

NEARBY, NEBULA watches the sad humans. ROCKET SITS BESIDE
HER, GRATEFUL. She rests a hand on his furry head.

INT. AVENGERS COMPOUND, WORKSHOP - DAY

RHODEY, TONY, STEVE, NATASHA, AND CAROL watch...

A HOLO-DISPLAY ROTATING THROUGH FACES OF PEOPLE WE'VE LOST:
WANDA. VISION. BUCKY. T'CHALLA. MARIA HILL.

                    RHODEY
          It's been twenty-three days since
          Thanos came to Earth.

TONY, weak, sits in a hi-tech wheelchair, IV dripping into
his arm. He stares, taking in the loss:

SAM WILSON. SECRETARY ROSS. SHARON CARTER. SCOTT LANG.
HOPE VAN DYNE. HANK PYM. NICK FURY.

At Fury, Carol bites back emotion.

                    NATASHA
          World governments are in pieces, as
          you can imagine. But the parts
          that still work are trying to take
          a census. It looks like he did
          what he said he was going to do.

JANE FOSTER. ERIK SELVIG. WONG. DR. STRANGE. THE BARTON
FAMILY. QUILL. DRAX. MANTIS. GROOT. PETER PARKER.

Finally, Tony looks away. RHODEY turns it off.

                    NATASHA (CONT'D)
          Thanos wiped out fifty percent of
          all the living creatures on Earth.

                    CAROL DANVERS
          Not just Earth.

                    RHODEY
          You sure about that?

                    CAROL DANVERS
          You never have to ask me that.

                    TONY
          Where is he now?

                    STEVE
          We don't know. He just opened a
          portal and walked through.

Tony looks out to see...THOR on the patio.

                    TONY
          What's his deal?

                    ROCKET (O.S.)
          He's pissed.

Tony turns to see Rocket for the first time.

                    ROCKET (CONT'D)
          He thinks he failed. Which, of
          course, he did. But there's a lot
          of that going around, ain't there?

                    TONY
          Until this second, I literally
          thought you were a Build-a-Bear.

                    STEVE
          We've been hunting Thanos for three
          weeks - deep space scans,
          satellites - we got nothing. Tony,
          you fought him-

                    TONY
          Who told you that? I didn't fight
          him, he wiped my face with a planet
          while a Bleecker Street magician
          gave away the store. There was no
          fight because he's not beatable.

                    STEVE
          Did he give you anything to go on?
          Clues, coordinates-

Tony stares, lost, barely acknowledging Steve.

                    TONY
          I saw this coming, few years back.
          Didn't wanna believe. I thought I
          was dreaming...

                    STEVE
          Tony, I need you to focus-

                    TONY
          And I needed you, as in past tense.
          That trumps what you need. It's
          too late, buddy. You know what I
          need?

Tony turns to everyone, slightly unstable.

                     TONY (CONT'D)
          I need a shave and a burger, not a
          bowl of soup.
              (stands)
          And I believe I remember telling
          all of you, alive and otherwise,
          that we needed a suit of armor
          around the world, whether it
          impacted our precious freedoms or
          not-

                    STEVE
          But that didn't work out, did it?

                    TONY
          I said we'd lose, you said we'd "do
          that together, too." Guess what,
          Cap, we lost, and you weren't
          there. But that's what we do,
          right? Our best work after the
          fact? We're the "Avengers", not
          the "Pre-vengers-"

                    RHODEY
          Tony, take it easy...

                     TONY
          I've got nothing for ya, Cap. No
          coordinates, no clues, no
          strategies, no options. Zero, zip,
          nada. No trust.
              (rips out RT)
          Here. You take this. You find
          him, you put this on, and hide.
              (drops to his knees)
          I'm fine!

Tony COLLAPSES. Rhodey catches him.

INT. AVENGERS COMPOUND, CORRIDOR - DAY

CAROL, STEVE, AND NATASHA stare through GLASS DOORS at TONY
IN A HOSPITAL BED, PEPPER AND BANNER AT HIS SIDE.

RHODEY STEPS OUT OF THE HOSPITAL ROOM.

                    RHODEY
          Bruce gave him a sedative. Should
          be out the rest of the day.

END OF EXCERPT`
  },
  {
    id: 'micro-drama-betrayal',
    title: 'The Last Text',
    genre: 'Romantic Thriller',
    scriptType: 'micro_drama',
    logline: 'A woman discovers a devastating secret in her boyfriend\'s phone — but the real twist is who sent it.',
    pageCount: 2,
    content: `COLD OPEN — VERTICAL FRAME (9:16)

INT. BEDROOM — NIGHT

CLOSE ON: A PHONE SCREEN. A text notification slides down:

"She knows. Run."

PULL BACK TO REVEAL: MIRA (25), tear-streaked, holding her boyfriend's phone. Behind her, JAKE (27) sleeps peacefully.

She reads the text again. Her jaw tightens.

MIRA
(whisper)
Who is "she"?

She scrolls up. Messages between Jake and "K":

"Tomorrow night. Same place."
"Delete everything after."
"She can never find out."

Mira's breathing quickens. She screenshots the conversation.

JAKE
(stirring)
Babe? What time is it?

MIRA
(hiding the phone)
Late. Go back to sleep.

She slips out of bed. Grabs her coat. At the door—

JAKE
Where are you going?

MIRA
(not turning)
To find out who "K" is.

CUT TO:

EXT. STREET — NIGHT

Mira walks fast, phone to her ear.

MIRA
Pick up, pick up...

VOICEMAIL: "Hey, it's Kenji. Leave one."

She freezes. KENJI. Her brother.

MIRA
(breaking)
No...

Her phone buzzes. New text from "K":

"I was trying to plan your surprise birthday party. Jake was helping. Please don't be mad."

HOLD ON: Mira's face — relief, guilt, tears, and a broken laugh all at once.

She turns back toward the apartment.

SMASH CUT TO BLACK.

TITLE: "THE LAST TEXT"

END.`
  },
  {
    id: 'micro-drama-elevator',
    title: 'Going Down',
    genre: 'Horror',
    scriptType: 'micro_drama',
    logline: 'Two strangers are trapped in an elevator — but the floor counter keeps going below the basement.',
    pageCount: 2,
    content: `COLD OPEN — VERTICAL FRAME (9:16)

INT. ELEVATOR — NIGHT

Fluorescent buzz. DANA (30s), business suit, checks her watch. The doors close. She's alone.

DING. Floor 3.

The doors open. A MAN (40s), pale, drenched in sweat, stumbles in.

DANA
You okay?

MAN
Don't let the doors close.

Too late. DING. The doors shut.

The elevator descends. Floor 2... Floor 1...

DANA
This is me—

The elevator doesn't stop. B1... B2...

DANA (CONT'D)
There's no B2 in this building.

MAN
I know.

B3... B4... B5...

Dana hits the emergency button. Nothing. Hits it again. The intercom crackles — WHITE NOISE.

DANA
What is this? What's happening?

The Man presses himself against the wall.

MAN
(quiet)
It picks someone every night. I thought if I wasn't alone, it might skip me.

B8... B9... B10...

DANA
What picks someone?

The lights flicker. When they come back, the Man is GONE. His jacket lies crumpled on the floor.

Dana SCREAMS. Hammers on the doors.

B15... B16... B17...

The elevator STOPS. Silence.

DING.

The doors open to COMPLETE DARKNESS. From deep within it, a sound:

BREATHING.

DANA
(barely audible)
No...

The lights inside the elevator begin to go out. One. By. One.

SMASH CUT TO BLACK.

TITLE: "GOING DOWN"

The elevator DINGS one last time.

END.`
  },
  {
    id: 'micro-drama-mirror',
    title: 'Reflection',
    genre: 'Psychological Thriller',
    scriptType: 'micro_drama',
    logline: 'A woman notices her reflection in the mirror is half a second behind her.',
    pageCount: 2,
    content: `COLD OPEN — VERTICAL FRAME (9:16)

INT. BATHROOM — MORNING

SUKI (28), tired eyes, brushes her teeth in front of the mirror. Routine. Mundane.

She reaches for a towel—

AND CATCHES IT. Her reflection is STILL REACHING.

She freezes. Stares. The reflection completes the motion, half a beat late.

SUKI
(mouthful of toothpaste)
What the...

She raises her right hand. Watches. The reflection raises its right hand — but a FRACTION OF A SECOND BEHIND.

Suki's breathing changes. She leans closer.

The reflection leans closer — late.

SUKI (CONT'D)
(whisper)
That's not possible.

She steps left. The reflection follows — delayed.

She STOPS. The reflection KEEPS MOVING. Just for a moment. Then stops.

Suki backs away from the mirror. Her reflection stays close.

CLOSE ON: The reflection's mouth. It's moving. Silently forming words.

Suki leans in despite herself. Reads the lips:

"BEHIND YOU."

Suki's eyes go wide. She spins around—

NOTHING THERE.

She turns back to the mirror. Her reflection is perfectly in sync again. Normal. Smiling.

But Suki isn't smiling.

SMASH CUT TO BLACK.

TITLE: "REFLECTION"

END.`
  },
  {
    id: 'pilot-nightshift',
    title: 'Night Shift',
    genre: 'Crime Drama',
    scriptType: 'pilot',
    logline: 'A disgraced homicide detective is reassigned to the overnight shift at a precinct haunted by cold cases — and the ghosts of detectives who tried to solve them.',
    pageCount: 55,
    content: `FADE IN:

EXT. 47TH PRECINCT — NIGHT

Rain. A building that looks like it stopped trying decades ago. Most windows dark. One light on the third floor.

SUPER: "THE 47TH PRECINCT. BRONX, NY. 11:47 PM."

INT. 47TH PRECINCT, BULLPEN — NIGHT

Empty desks. Old coffee. DETECTIVE ALMA REYES (40s), leather jacket, sharp but worn down, drops a box on a desk. Her new desk.

She looks around. Nobody.

ALMA
(to herself)
Welcome to the end of the line.

FOOTSTEPS. SERGEANT PETE KOVAC (60s), built like a filing cabinet, rounds the corner with two coffees.

KOVAC
Reyes?

ALMA
That obvious?

KOVAC
You're the only one who showed up.
Night shift's more of a...
suggestion.

ALMA
Then why am I here?

KOVAC
(handing her coffee)
Because you shot a councilman's
son.

ALMA
He was holding a gun.

KOVAC
It was a phone.

ALMA
In the dark, they look the same.

KOVAC
That's what Internal Affairs said.
Right before they sent you here.

He gestures at the bullpen. Three desks. All empty except hers.

KOVAC (CONT'D)
Night shift handles the cold case
backlog. Files nobody wants.
Murders nobody remembers.

ALMA
How many?

KOVAC
Four hundred and twelve open cases.
Some go back to the seventies.

He drops a THICK FOLDER on her desk. "PATRICIA VEGA - 1994."

KOVAC (CONT'D)
Start with this one. Young mother.
Found in the Bronx River. Three
detectives worked it over the
years. All three requested
transfers.

ALMA
Why?

KOVAC
(beat)
Ask them. If you can find them.
Two retired. One's in a psych ward
in Queens.

He finishes his coffee. Heads for the door.

KOVAC (CONT'D)
I'm downstairs if you need
anything. Which you won't. Nobody
comes up here after midnight.

He leaves. Alma opens the folder. A photo of PATRICIA VEGA (20s), beautiful, smiling.

ALMA
(quiet)
What happened to you, Patricia?

She reads. Flips pages. Something catches her eye — a POST-IT NOTE stuck to an evidence log:

"SHE'S STILL IN THE RIVER."

Different handwriting from the detective's notes. Alma frowns.

The overhead light FLICKERS. She looks up. Steady again.

ALMA (CONT'D)
Great. Building's falling apart
too.

She turns back to the file. CLOSE ON: The case photos. The crime scene. The river. A shoe on the bank.

Then — a SOUND. Like someone TYPING. Alma looks up.

ACROSS THE BULLPEN, one of the other desks. The ancient computer monitor is ON. Green text scrolling.

Alma stands. Walks over slowly. Reads the screen:

"YOU'RE LOOKING IN THE WRONG PLACE."

She touches the keyboard. It's ICE COLD.

ALMA (CONT'D)
What the hell...

The screen goes dark. The room is silent except for the rain.

Alma looks at the desk nameplate: "DET. R. SANTOS — RETIRED."

She pulls out her phone. Dials.

ALMA (CONT'D)
Kovac? Who's Detective Santos?

KOVAC (O.S.)
Ray Santos? He was the last one to
work the Vega case.

ALMA
Where is he now?

Long pause.

KOVAC (O.S.)
He's the one in the psych ward.

Alma stares at the dark monitor. The reflection of the room behind her — and for just a FRAME, the shadow of a WOMAN standing in the doorway.

Alma turns. Nobody there.

She grabs her jacket and the Vega file.

ALMA
(to herself)
Wrong place. Okay. Let's find the
right one.

EXT. 47TH PRECINCT — NIGHT

Alma walks to her car in the rain. She pauses. Looks up at the third floor window.

THE LIGHT IS OFF. But someone is STANDING AT THE WINDOW.

Alma blinks. The figure is gone.

She gets in her car. Drives into the rain.

END OF PILOT`
  },
  {
    id: 'episode-inheritance',
    title: 'The Inheritance — Ep. 3: "Blood Money"',
    genre: 'Family Drama/Thriller',
    scriptType: 'episode',
    logline: 'When the family patriarch\'s secret offshore accounts surface, three siblings must decide whether to expose the truth or protect the empire — and each other.',
    pageCount: 48,
    content: `FADE IN:

INT. ASANTE FAMILY ESTATE, DINING ROOM — NIGHT

A long mahogany table. Crystal. Silver. Three place settings. No food.

NADIA ASANTE (38), eldest, corporate, composed, sits at the head. She checks her watch.

The door opens. KWAME ASANTE (33), creative, restless, enters with a bottle of whiskey.

KWAME
I brought dinner.

NADIA
Where's Ama?

KWAME
Where she always is. Making an
entrance.

He pours two glasses. Nadia doesn't touch hers.

NADIA
Did you read the documents?

KWAME
All forty-seven pages of offshore
banking joy? Couldn't put it down.

NADIA
This isn't a joke, Kwame. If the
board sees these accounts—

KWAME
Relax. The board doesn't know.

NADIA
The board doesn't know YET.
Somebody leaked the first page
to the Financial Times.

Kwame stops pouring.

KWAME
When?

NADIA
Three hours ago. They're sitting
on it while they verify.

KWAME
How long do we have?

NADIA
Forty-eight hours. Maybe less.

The door BURSTS open. AMA ASANTE (28), youngest, activist, furious, storms in waving printed pages.

AMA
Somebody want to explain why
Dad had two hundred million
dollars in the Cayman Islands?

NADIA
Close the door.

AMA
While he was lecturing ME about
fiscal responsibility? While he
was cutting my foundation's budget
because "money doesn't grow on
trees"?

KWAME
Ama—

AMA
Two hundred MILLION, Kwame. That's
not savings. That's a second life.

NADIA
(calm, precise)
It's a legacy. And right now,
it's our problem.

She opens a laptop. A spreadsheet glows.

NADIA (CONT'D)
Seven shell companies. Four
jurisdictions. Money flowing in
from accounts I can't trace. And
one account that received a
deposit the day Dad died.

AMA
After he died?

NADIA
Two hours after.

Silence. The weight of that lands.

KWAME
So someone else has access.

NADIA
Someone else has been running this.
Maybe since the beginning.

AMA
Who?

Nadia closes the laptop.

NADIA
That's what we need to find out.
Before the Times does. Before the
board does. Before whoever made
that deposit realizes we know.

KWAME
And if it's someone in the family?

NADIA
(dead-eyed)
Then we deal with it as a family.

INT. ASANTE CORP, NADIA'S OFFICE — DAY

Nadia on a call. Pacing. The city sprawls below her.

NADIA
I need those records sealed.
Attorney-client privilege,
executive session, whatever you
have to call it.

LAWYER (O.S.)
Nadia, if these accounts are tied
to the company, privilege won't
protect you. This is potential
money laundering.

NADIA
It's my father's estate.

LAWYER (O.S.)
Your father's estate is the
company. They're inseparable.
That's the problem.

Nadia hangs up. Stares at a framed photo: the three siblings, young, laughing. Their father, KOFI ASANTE, towering behind them.

NADIA
(to the photo)
What did you do, Dad?

Her assistant, RUTH (50s), knocks.

RUTH
The forensic accountant is here.

NADIA
Send her in.

ELENA CROSS (45), sharp, no-nonsense, enters with a briefcase.

ELENA
Ms. Asante. I've done a
preliminary trace on the accounts
you flagged. I have good news
and bad news.

NADIA
Bad first.

ELENA
The money trail goes back fifteen
years. It's sophisticated. Shell
within shell within shell.

NADIA
And the good news?

ELENA
Whoever built it made one mistake.
The post-mortem deposit? It came
from an account inside your
company.

NADIA
Inside Asante Corp?

ELENA
Someone on payroll. Someone with
CFO-level access.

Nadia's face changes. She knows who that is.

NADIA
Thank you, Elena. Don't share
this with anyone.

Elena leaves. Nadia picks up her phone.

NADIA (CONT'D)
(texting)
"Family meeting. Tonight.
Same place. Bring everything."

She stares at her contact list. One name highlighted:
"UNCLE JAMES — CFO."

She puts the phone down. Picks up the family photo again.

NADIA (CONT'D)
(quiet)
Family first. Right, Dad?

She sets it face down.

END OF EPISODE`
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
