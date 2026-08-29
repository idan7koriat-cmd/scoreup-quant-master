-- profiles.email exists on this database but nothing in the app ever wrote to it (the app always
-- sources email from auth.users.email via the session — see getProfilePage in
-- src/lib/profile.functions.ts). This just makes the column actually useful for browsing/searching
-- users in Supabase Studio: backfill existing rows, and keep populating it on future signups.
--
-- Not granted to `authenticated` (same as is_premium/trial_ends_at etc.) — it should always mirror
-- auth.users.email, never be user-editable directly. It's a convenience mirror for admin/Studio use,
-- not read by the app, so it isn't kept in sync if a user's email changes later.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id AND p.email IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, exam_date, target_degree, terms_accepted_at, trial_ends_at)
    VALUES (
      NEW.id,
      NEW.email,
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
