-- Fixes a bug that silently broke every new signup after 20260830120000_trial_subscription.sql:
-- handle_new_user() unconditionally writes profiles.terms_accepted_at, a column from
-- 20260823120000_legal_consent_and_cancellation.sql — which, like payment_consent_at before it,
-- turns out to have never actually been applied to this database. A plpgsql function body isn't
-- checked against real columns until it runs, so CREATE OR REPLACE FUNCTION succeeded silently;
-- the failure only surfaced at the next real signup, when the trigger raised undefined_column and
-- Supabase Auth returned it as an opaque AuthRetryableFetchError { message: "{}", status: 500 } —
-- the "red box with {}" that blocked signup entirely. Confirmed by calling
-- supabase.auth.signUp() directly and inspecting the error.

-- Ensure the full legal_consent_and_cancellation column set actually exists (idempotent, so this
-- is safe to run whether or not that migration ever ran here).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS current_period_end date;

-- 20260830120000_trial_subscription.sql's defensive GRANT block skipped payment_consent_at /
-- cancel_at_period_end / cancelled_at because they didn't exist yet when it ran. They exist now
-- (just above), so grant them for real — the app writes these with the user's own JWT via
-- src/lib/profile.functions.ts (recordPaymentConsent, cancelSubscription).
GRANT INSERT (payment_consent_at) ON public.profiles TO authenticated;
GRANT UPDATE (payment_consent_at, cancel_at_period_end, cancelled_at) ON public.profiles TO authenticated;

-- Defense in depth: even with the column guaranteed above, wrap the insert so that if some future
-- column this trigger references ever turns out to be missing again, signup degrades to the
-- minimal columns instead of failing outright for every single user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, exam_date, target_degree, terms_accepted_at, trial_ends_at)
    VALUES (
      NEW.id,
      NULLIF(NEW.raw_user_meta_data ->> 'exam_date', '')::date,
      NULLIF(NEW.raw_user_meta_data ->> 'target_degree', ''),
      CASE WHEN NEW.raw_user_meta_data ->> 'terms_accepted' = 'true' THEN now() ELSE NULL END,
      now() + interval '7 days'
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN undefined_column THEN
    INSERT INTO public.profiles (id, exam_date, target_degree)
    VALUES (
      NEW.id,
      NULLIF(NEW.raw_user_meta_data ->> 'exam_date', '')::date,
      NULLIF(NEW.raw_user_meta_data ->> 'target_degree', '')
    )
    ON CONFLICT (id) DO NOTHING;
  END;
  RETURN NEW;
END;
$$;
