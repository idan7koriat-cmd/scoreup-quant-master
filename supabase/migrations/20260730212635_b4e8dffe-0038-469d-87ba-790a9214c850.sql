ALTER TABLE public.questions RENAME COLUMN prompt TO question;
ALTER TABLE public.questions RENAME COLUMN options TO answers;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation text NOT NULL DEFAULT '';

UPDATE public.questions q
SET explanation = COALESCE((
  SELECT string_agg(
    trim(both E'\n' from concat_ws(E'\n', s->>'text', s->>'math')),
    E'\n\n'
  )
  FROM jsonb_array_elements(q.solution_steps) AS s
), '');

ALTER TABLE public.questions DROP COLUMN solution_steps;
ALTER TABLE public.questions DROP COLUMN latex;