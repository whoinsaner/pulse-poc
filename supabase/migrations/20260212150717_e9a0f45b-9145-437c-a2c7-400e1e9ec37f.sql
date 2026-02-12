-- Add new script types to the enum
ALTER TYPE public.script_type ADD VALUE IF NOT EXISTS 'stage_play';
ALTER TYPE public.script_type ADD VALUE IF NOT EXISTS 'audio_drama';
ALTER TYPE public.script_type ADD VALUE IF NOT EXISTS 'podcast_fiction';
ALTER TYPE public.script_type ADD VALUE IF NOT EXISTS 'game_narrative';