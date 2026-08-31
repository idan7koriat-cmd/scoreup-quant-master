-- The signup form (src/routes/auth.tsx) never actually collects a name — it only sends
-- exam_date/target_degree/terms_accepted as user metadata — so profiles.full_name has always
-- ended up NULL for every real signup. The dashboard greeting already falls back to the email
-- prefix at render time (see fullName in src/routes/dashboard.tsx), but the underlying column
-- itself stayed empty, which is awkward for Studio/admin use (e.g. solved_questions_with_user).
--
-- This derives a display name from the email's local-part instead of asking the user for one:
-- dots/underscores/plus/dashes become spaces and each word is capitalized, e.g.
-- "ori.levran" -> "Ori Levran", "segevarn" -> "Segevarn". It's a best-effort default, not a
-- real name — same idea as GitHub/Slack falling back to the email handle when no name is set.

UPDATE public.profiles
SET full_name = initcap(regexp_replace(split_part(email, '@', 1), '[._+-]+', ' ', 'g'))
WHERE full_name IS NULL AND email IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, exam_date, target_degree, terms_accepted_at, trial_ends_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
        NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
        initcap(regexp_replace(split_part(NEW.email, '@', 1), '[._+-]+', ' ', 'g'))
      ),
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
