
# Fix Character Extraction Noise in Script Parser

## Problem
The Khaaki Squad script has 138 extracted characters, but a large portion are common English words being misidentified as character names. Examples from the database:

| Noise "Character" | Dialogue Count | Type |
|---|---|---|
| TO | 19 | Preposition |
| YOU | 18 | Pronoun |
| AND | 16 | Conjunction |
| IN | 12 | Preposition |
| IS | 11 | Verb |
| THIS | 9 | Determiner |
| THAT | 9 | Determiner |
| ARE | 8 | Verb |
| HE | 8 | Pronoun |
| DO | 8 | Verb |
| FROM | 7 | Preposition |
| AT | 7 | Preposition |
| WE | 7 | Pronoun |
| HAS | 6 | Verb |
| HIS | 6 | Possessive |
| WILL | 6 | Modal verb |
| WAS | 6 | Verb |
| FOR | 5 | Preposition |
| THEY | 5 | Pronoun |
| IT | 5 | Pronoun |
| BUT | 4 | Conjunction |
| COME | 4 | Verb |
| WHAT | 4 | Interrogative |
| IF | 4 | Conjunction |
| WITH | 4 | Preposition |
| WHEN | 4 | Conjunction |
| SLIGHTLY | 4 | Adverb |
| COMPLAINT | 4 | Noun |
| STILL | 3 | Adverb |
| ...and many more |

Legitimate characters (JEEVANANDAM, ALEX, JEEVA, JOTHI, BHAGATH SINGH, etc.) are present but buried in noise.

## Root Cause
The `isNonCharacter()` filter in `script-parser-stream/index.ts` has patterns for multi-word phrases starting with prepositions/articles (line 1982-1984), but it lacks a **single-word stopword set** for common English words that can never be character names.

The `nonCharacterWords` set (line 603) is only used during Fountain normalization, not during the final character filtering stage. The final filter's `genericSingles` set (line 1990) covers locations and props but misses basic English stopwords.

## Solution
Add a comprehensive English stopword set to the `isNonCharacter()` function's `genericSingles` set. These are words that should never be character names.

### Changes

**File: `supabase/functions/script-parser-stream/index.ts`**

Expand the `genericSingles` set (around line 1990) to include common English stopwords:

```text
Categories to add:
- Pronouns: I, YOU, HE, SHE, IT, WE, THEY, ME, HIM, HER, US, THEM, MY, YOUR, HIS, ITS, OUR, THEIR
- Prepositions: TO, IN, ON, AT, BY, FOR, FROM, WITH, INTO, ONTO, UPON, NEAR, BETWEEN, THROUGH, ACROSS, ALONG, AROUND, ABOVE, BELOW, UNDER, OVER, BEHIND, BESIDE, BEYOND, BENEATH, AMONG, AGAINST, BEFORE, AFTER, DURING, WITHOUT, TOWARD, TOWARDS
- Conjunctions: AND, BUT, OR, SO, IF, NOR, YET, BECAUSE, ALTHOUGH, WHILE, WHEN, WHERE, SINCE, UNLESS, UNTIL, WHETHER, THOUGH, WHEREAS
- Articles/Determiners: THE, A, AN, THIS, THAT, THESE, THOSE, SOME, ANY, EACH, EVERY, ALL, BOTH, FEW, MANY, MOST, SEVERAL, NO, NONE
- Common verbs (bare form): IS, ARE, WAS, WERE, BE, BEEN, BEING, HAS, HAVE, HAD, DO, DOES, DID, WILL, WOULD, SHALL, SHOULD, CAN, COULD, MAY, MIGHT, MUST, NEED, DARE, OUGHT, COME, GO, GET, MAKE, TAKE, GIVE, KEEP, LET, PUT, SAY, SAID, TELL, TOLD, SHOW, SHOWS, ASK, LOOK, FIND, KNOW, THINK, WANT, SEEM, FEEL, TRY, LEAVE, CALL, TURN, MOVE, LIVE, RUN, SET, USE, WORK, PLAY, READ, WRITE, DRAW, HEAR, SEE
- Adverbs: NOT, VERY, ALSO, JUST, NOW, THEN, HERE, THERE, ONLY, STILL, ALREADY, AGAIN, OFTEN, NEVER, ALWAYS, SOMETIMES, SOON, WELL, EVEN, QUITE, RATHER, ALMOST, ENOUGH, TOO, SLIGHTLY, IMMEDIATELY, SLOWLY, QUICKLY, REALLY, SIMPLY, MERELY
- Interrogatives: WHAT, WHO, WHOM, WHICH, WHERE, WHEN, HOW, WHY
- Other: YES, NO, OK, OKAY, HELLO, HEY, PLEASE, THANK, THANKS, SORRY, NUMBER, WATER, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, FIRST, SECOND, THIRD, NEXT, LAST, LITTLE, ANOTHER, MUCH, MORE, LESS, SAME, OTHER
```

Also add a minimum character name length check: single-character names (just one or two letters like "IN", "TO", "IF", "AT", "DO", "IS", "IT", "WE", "HE", "AN", "AS", "OR", "SO", "MY", "UP", "NO", "BE") should be rejected outright. Any name that is a single word of 3 or fewer characters should be rejected unless it matches known short character name patterns (like "BO", "AL", etc. -- but these are extremely rare and the false positive cost is too high).

### Specific code changes:
1. Add a length gate: reject single-word names with 3 or fewer characters
2. Merge the comprehensive stopword list into `genericSingles`
3. Also add duplicate-name deduplication for near-matches (e.g., "SP" vs "SP AVINASH BIDARI" vs "SP AVINASH", and "ANNAMMA" vs "ANNAMMAL" vs "SUB INSPECTOR ANNAMMAL")

### After deployment:
- Re-parse the Khaaki Squad script to verify the fix
- Expected result: ~20-30 legitimate characters instead of 138

## Technical Details
- Only one file needs to change: `supabase/functions/script-parser-stream/index.ts`
- The fix is in the `isNonCharacter()` function around lines 1986-2014
- The edge function will be redeployed automatically
- Users will need to re-parse existing scripts to benefit from the fix
