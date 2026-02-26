-- Stopwords table for character extraction noise filtering
CREATE TABLE public.parser_stopwords (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users DEFAULT NULL,
  UNIQUE(word)
);

-- Enable RLS
ALTER TABLE public.parser_stopwords ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view stopwords
CREATE POLICY "Authenticated users can view stopwords"
  ON public.parser_stopwords FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admins can manage stopwords (insert/update/delete)
-- Since stopwords are global (not org-scoped), restrict to any admin
CREATE POLICY "Admins can insert stopwords"
  ON public.parser_stopwords FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update stopwords"
  ON public.parser_stopwords FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete stopwords"
  ON public.parser_stopwords FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Seed with all existing stopwords
INSERT INTO public.parser_stopwords (word, category) VALUES
  -- Location/prop/direction
  ('INSIDE', 'location'), ('OUTSIDE', 'location'), ('UPSTAIRS', 'location'), ('DOWNSTAIRS', 'location'), ('NEARBY', 'location'), ('ELSEWHERE', 'location'),
  ('BIKE', 'prop'), ('CAR', 'prop'), ('PHONE', 'prop'), ('TEMPO', 'prop'), ('PASSAGE', 'location'), ('CELLAR', 'location'),
  ('STAND', 'location'), ('WALL', 'location'), ('GATE', 'location'), ('DOOR', 'location'), ('WINDOW', 'location'), ('STAIRS', 'location'), ('STEP', 'location'),
  ('CONCESSION', 'location'), ('ASSISTANT', 'role'), ('ANNOUNCER', 'role'), ('NARRATOR', 'role'), ('VOICE', 'role'),
  ('INTERVAL', 'direction'), ('INTERMISSION', 'direction'), ('FAMILY', 'other'), ('MESSAGE', 'other'), ('MOMENT', 'other'), ('ENDING', 'direction'),
  ('SONG', 'direction'), ('MUSIC', 'direction'), ('SILENCE', 'direction'), ('PAUSE', 'direction'), ('BEAT', 'direction'), ('MONTAGE', 'direction'),
  ('RUINS', 'location'), ('TEMPLE', 'location'), ('FORT', 'location'), ('PALACE', 'location'), ('MANSION', 'location'), ('HAVELI', 'location'), ('MAHAL', 'location'),
  ('JUNGLE', 'location'), ('FOREST', 'location'), ('RIVER', 'location'), ('LAKE', 'location'), ('POND', 'location'), ('WELL', 'location'), ('BRIDGE', 'location'),
  ('MARKET', 'location'), ('BAZAAR', 'location'), ('CHOWK', 'location'), ('GHAT', 'location'), ('MANDIR', 'location'), ('MASJID', 'location'), ('CHURCH', 'location'),
  ('TERRACE', 'location'), ('ROOFTOP', 'location'), ('BALCONY', 'location'), ('VERANDAH', 'location'), ('COURTYARD', 'location'), ('GARDEN', 'location'),
  ('GRAVEYARD', 'location'), ('CEMETERY', 'location'), ('CREMATORIUM', 'location'), ('SHAMSHAAN', 'location'),
  ('EXTERIOR', 'direction'), ('INTERIOR', 'direction'), ('CONTINUOUS', 'direction'), ('LATER', 'adverb'), ('MEANWHILE', 'adverb'),
  -- Pronouns
  ('YOU', 'pronoun'), ('SHE', 'pronoun'), ('THEY', 'pronoun'), ('HIM', 'pronoun'), ('HER', 'pronoun'), ('THEM', 'pronoun'),
  ('YOUR', 'pronoun'), ('HIS', 'pronoun'), ('ITS', 'pronoun'), ('OUR', 'pronoun'), ('THEIR', 'pronoun'),
  ('MYSELF', 'pronoun'), ('YOURSELF', 'pronoun'), ('HIMSELF', 'pronoun'), ('HERSELF', 'pronoun'), ('ITSELF', 'pronoun'), ('OURSELVES', 'pronoun'), ('THEMSELVES', 'pronoun'),
  -- Prepositions
  ('INTO', 'preposition'), ('ONTO', 'preposition'), ('UPON', 'preposition'), ('NEAR', 'preposition'), ('BETWEEN', 'preposition'),
  ('THROUGH', 'preposition'), ('ACROSS', 'preposition'), ('ALONG', 'preposition'), ('AROUND', 'preposition'), ('ABOVE', 'preposition'),
  ('BELOW', 'preposition'), ('UNDER', 'preposition'), ('OVER', 'preposition'), ('BEHIND', 'preposition'), ('BESIDE', 'preposition'),
  ('BEYOND', 'preposition'), ('BENEATH', 'preposition'), ('AMONG', 'preposition'), ('AGAINST', 'preposition'), ('BEFORE', 'preposition'),
  ('AFTER', 'preposition'), ('DURING', 'preposition'), ('WITHOUT', 'preposition'), ('TOWARD', 'preposition'), ('TOWARDS', 'preposition'),
  ('FROM', 'preposition'), ('WITH', 'preposition'),
  -- Conjunctions
  ('BECAUSE', 'conjunction'), ('ALTHOUGH', 'conjunction'), ('WHILE', 'conjunction'), ('WHEN', 'conjunction'), ('WHERE', 'conjunction'),
  ('SINCE', 'conjunction'), ('UNLESS', 'conjunction'), ('UNTIL', 'conjunction'), ('WHETHER', 'conjunction'), ('THOUGH', 'conjunction'), ('WHEREAS', 'conjunction'),
  -- Determiners
  ('THIS', 'determiner'), ('THAT', 'determiner'), ('THESE', 'determiner'), ('THOSE', 'determiner'), ('SOME', 'determiner'),
  ('EACH', 'determiner'), ('EVERY', 'determiner'), ('BOTH', 'determiner'), ('MANY', 'determiner'), ('MOST', 'determiner'), ('SEVERAL', 'determiner'), ('NONE', 'determiner'),
  -- Verbs
  ('BEEN', 'verb'), ('BEING', 'verb'), ('HAVE', 'verb'), ('DOES', 'verb'), ('WOULD', 'verb'), ('SHALL', 'verb'), ('SHOULD', 'verb'),
  ('COULD', 'verb'), ('MIGHT', 'verb'), ('MUST', 'verb'), ('NEED', 'verb'), ('DARE', 'verb'), ('OUGHT', 'verb'),
  ('COME', 'verb'), ('GOES', 'verb'), ('GOING', 'verb'), ('GONE', 'verb'), ('MAKE', 'verb'), ('TAKE', 'verb'), ('GIVE', 'verb'), ('KEEP', 'verb'),
  ('SAID', 'verb'), ('TELL', 'verb'), ('TOLD', 'verb'), ('SHOW', 'verb'), ('SHOWS', 'verb'), ('LOOK', 'verb'), ('FIND', 'verb'), ('KNOW', 'verb'),
  ('THINK', 'verb'), ('WANT', 'verb'), ('SEEM', 'verb'), ('FEEL', 'verb'), ('LEAVE', 'verb'), ('CALL', 'verb'), ('TURN', 'verb'), ('MOVE', 'verb'),
  ('LIVE', 'verb'), ('WORK', 'verb'), ('PLAY', 'verb'), ('READ', 'verb'), ('WRITE', 'verb'), ('DRAW', 'verb'), ('HEAR', 'verb'),
  ('WERE', 'verb'), ('ALSO', 'adverb'), ('JUST', 'adverb'),
  -- Adverbs
  ('VERY', 'adverb'), ('THEN', 'adverb'), ('HERE', 'adverb'), ('THERE', 'adverb'), ('ONLY', 'adverb'), ('STILL', 'adverb'), ('ALREADY', 'adverb'),
  ('AGAIN', 'adverb'), ('OFTEN', 'adverb'), ('NEVER', 'adverb'), ('ALWAYS', 'adverb'), ('SOMETIMES', 'adverb'), ('SOON', 'adverb'),
  ('EVEN', 'adverb'), ('QUITE', 'adverb'), ('RATHER', 'adverb'), ('ALMOST', 'adverb'), ('ENOUGH', 'adverb'), ('SLIGHTLY', 'adverb'),
  ('IMMEDIATELY', 'adverb'), ('SLOWLY', 'adverb'), ('QUICKLY', 'adverb'), ('REALLY', 'adverb'), ('SIMPLY', 'adverb'), ('MERELY', 'adverb'),
  -- Interrogatives
  ('WHAT', 'interrogative'), ('WHOM', 'interrogative'), ('WHICH', 'interrogative'), ('HOW', 'interrogative'), ('WHY', 'interrogative'),
  -- Other
  ('OKAY', 'other'), ('HELLO', 'other'), ('PLEASE', 'other'), ('THANK', 'other'), ('THANKS', 'other'), ('SORRY', 'other'),
  ('NUMBER', 'other'), ('WATER', 'other'), ('TWO', 'other'), ('THREE', 'other'), ('FOUR', 'other'), ('FIVE', 'other'), ('SIX', 'other'), ('SEVEN', 'other'),
  ('EIGHT', 'other'), ('NINE', 'other'), ('TEN', 'other'), ('FIRST', 'other'), ('SECOND', 'other'), ('THIRD', 'other'), ('NEXT', 'other'), ('LAST', 'other'),
  ('LITTLE', 'other'), ('ANOTHER', 'other'), ('MUCH', 'other'), ('MORE', 'other'), ('LESS', 'other'), ('SAME', 'other'), ('OTHER', 'other'),
  ('COMPLAINT', 'other'), ('PEOPLE', 'other'), ('EVERYONE', 'other'), ('SOMEONE', 'other'), ('ANYONE', 'other'), ('NOBODY', 'other'),
  ('NOTHING', 'other'), ('EVERYTHING', 'other'), ('SOMETHING', 'other'), ('ANYTHING', 'other')
ON CONFLICT (word) DO NOTHING;