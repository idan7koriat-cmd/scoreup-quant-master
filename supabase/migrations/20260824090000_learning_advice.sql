CREATE TABLE public.learning_advice (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  headline text NOT NULL,
  detail text NOT NULL,
  recommended_topic text,
  recommended_difficulty int,
  tone text NOT NULL,
  solved_count_at_calc int NOT NULL DEFAULT 0,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.learning_advice TO authenticated;
GRANT ALL ON public.learning_advice TO service_role;

ALTER TABLE public.learning_advice ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own learning advice" ON public.learning_advice
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
