ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS svg_code text,
  ADD COLUMN IF NOT EXISTS difficulty_level integer;

UPDATE public.questions
SET difficulty_level = CASE difficulty
  WHEN 'קל' THEN 1
  WHEN 'בינוני' THEN 2
  WHEN 'קשה' THEN 3
  ELSE 2 END
WHERE difficulty_level IS NULL;

ALTER TABLE public.questions
  ALTER COLUMN difficulty_level SET DEFAULT 2;

ALTER TABLE public.questions
  ADD CONSTRAINT questions_difficulty_level_check CHECK (difficulty_level BETWEEN 1 AND 4);