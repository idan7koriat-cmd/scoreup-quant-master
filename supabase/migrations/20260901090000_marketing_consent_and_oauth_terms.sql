-- Closes two gaps in legal consent:
-- 1. Google OAuth signup never set profiles.terms_accepted_at (Google never sends a
--    `terms_accepted` flag), so every Google user was treated as having agreed to the
--    terms/privacy policy without ever actually seeing them. A new blocking screen
--    (src/routes/complete-signup.tsx) now collects that consent right after the OAuth
--    redirect, via record_oauth_consent() below.
-- 2. There was no separate marketing/reminder-email consent, distinct from the general
--    terms checkbox — required by Israeli Communications Law section 30א (explicit,
--    separate consent, not a pre-checked default).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_timestamp timestamptz,
  ADD COLUMN IF NOT EXISTS marketing_consent_source text;

-- Same trigger as before (see 20260831120000_full_name_google_only.sql), extended to
-- also read marketing_consent from signup metadata (regular email/password signup form
-- only — Google OAuth never populates this, so OAuth signups always start at false until
-- record_oauth_consent() runs).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (
      id, email, full_name, exam_date, target_degree, terms_accepted_at, trial_ends_at,
      marketing_consent, marketing_consent_timestamp, marketing_consent_source
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), NULLIF(NEW.raw_user_meta_data ->> 'name', '')),
      NULLIF(NEW.raw_user_meta_data ->> 'exam_date', '')::date,
      NULLIF(NEW.raw_user_meta_data ->> 'target_degree', ''),
      CASE WHEN NEW.raw_user_meta_data ->> 'terms_accepted' = 'true' THEN now() ELSE NULL END,
      now() + interval '7 days',
      COALESCE(NEW.raw_user_meta_data ->> 'marketing_consent', 'false') = 'true',
      CASE WHEN NEW.raw_user_meta_data ->> 'marketing_consent' = 'true' THEN now() ELSE NULL END,
      CASE WHEN NEW.raw_user_meta_data ? 'marketing_consent' THEN 'signup_form' ELSE NULL END
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

-- Records consent from the post-OAuth blocking screen. SECURITY DEFINER + auth.uid()
-- (same pattern as check_answers() in 20260830120000_trial_subscription.sql) because
-- terms_accepted_at is deliberately NOT in the direct column-grant list for
-- `authenticated` (see that migration's closing comment) — this is the one sanctioned
-- way to set it outside of handle_new_user().
CREATE OR REPLACE FUNCTION public.record_oauth_consent(p_marketing boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  UPDATE public.profiles
  SET terms_accepted_at = now(),
      marketing_consent = p_marketing,
      marketing_consent_timestamp = CASE WHEN p_marketing THEN now() ELSE marketing_consent_timestamp END,
      marketing_consent_source = 'oauth_followup'
  WHERE id = auth.uid();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_oauth_consent(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_oauth_consent(boolean) TO authenticated;

-- One-click unsubscribe link target (clicked from an email, so no session — there is no
-- service_role client anywhere in this codebase; src/lib/extAuth.middleware.ts always
-- runs with the caller's own JWT/anon key). Intentionally only ever turns consent OFF,
-- never on, so the worst case of someone guessing another user's uuid is an unwanted
-- opt-out, not a privacy escalation.
CREATE OR REPLACE FUNCTION public.unsubscribe_marketing(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET marketing_consent = false, marketing_consent_timestamp = now()
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.unsubscribe_marketing(uuid) TO anon, authenticated;

-- Explicit, auditable backfill for existing rows (largely a no-op given the defaults
-- above, but written out so "no exceptions, no retroactive assumption of consent" is a
-- checked fact, not an accident of trigger history):
-- every Google-signup profile never actually consented to terms/privacy, regardless of
-- what handle_new_user() happened to write in earlier migrations.
UPDATE public.profiles p
SET terms_accepted_at = NULL
FROM auth.users u
JOIN auth.identities i ON i.user_id = u.id
WHERE u.id = p.id AND i.provider = 'google';

UPDATE public.profiles SET marketing_consent = false WHERE marketing_consent IS NULL;
