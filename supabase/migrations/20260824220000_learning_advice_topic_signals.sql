ALTER TABLE public.learning_advice
  ADD COLUMN topic_signals jsonb NOT NULL DEFAULT '[]'::jsonb;
