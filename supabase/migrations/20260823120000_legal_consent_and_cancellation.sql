-- Consent timestamps (terms/privacy at signup, purchase consent at checkout) and
-- self-serve subscription cancellation flags. No live payment processor is wired
-- up yet — these columns are structure only, ready for a future billing integration.
ALTER TABLE public.profiles
  ADD COLUMN terms_accepted_at timestamptz,
  ADD COLUMN payment_consent_at timestamptz,
  ADD COLUMN cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN cancelled_at timestamptz,
  ADD COLUMN current_period_end date;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, exam_date, target_degree, terms_accepted_at)
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data ->> 'exam_date', '')::date,
    NULLIF(NEW.raw_user_meta_data ->> 'target_degree', ''),
    CASE WHEN NEW.raw_user_meta_data ->> 'terms_accepted' = 'true' THEN now() ELSE NULL END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
