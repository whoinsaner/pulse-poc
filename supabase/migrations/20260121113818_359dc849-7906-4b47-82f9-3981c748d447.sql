-- Add web_series to the script_type enum
ALTER TYPE script_type ADD VALUE IF NOT EXISTS 'web_series';

-- Add episode_length_class column to scripts table for web series classification
ALTER TABLE scripts 
ADD COLUMN IF NOT EXISTS episode_length_class TEXT DEFAULT NULL;

-- Add check constraint for valid episode length class values
-- Using a trigger instead of CHECK constraint for better compatibility
CREATE OR REPLACE FUNCTION validate_episode_length_class()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.episode_length_class IS NOT NULL AND 
     NEW.episode_length_class NOT IN ('short_form_web', 'mid_form_web', 'long_form_web') THEN
    RAISE EXCEPTION 'Invalid episode_length_class: %. Must be one of: short_form_web, mid_form_web, long_form_web', NEW.episode_length_class;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for episode length class validation
DROP TRIGGER IF EXISTS validate_scripts_episode_length_class ON scripts;
CREATE TRIGGER validate_scripts_episode_length_class
BEFORE INSERT OR UPDATE ON scripts
FOR EACH ROW
EXECUTE FUNCTION validate_episode_length_class();