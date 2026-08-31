-- Only OAuth (Google) signups get profiles.full_name auto-filled, using the real name Supabase
-- Auth already received from the provider (raw_user_meta_data ->> 'full_name'/'name' — see the
-- dashboard greeting fallback in src/routes/dashboard.tsx, which reads the same fields).
-- Plain email+password signups have no real name available anywhere in the system, so full_name
-- is deliberately left NULL for them instead of guessing one from the email address.

UPDATE public.profiles p
SET full_name = COALESCE(NULLIF(u.raw_user_meta_data ->> 'full_name', ''), NULLIF(u.raw_user_meta_data ->> 'name', ''))
FROM auth.users u
WHERE u.id = p.id
  AND p.full_name IS NULL
  AND COALESCE(NULLIF(u.raw_user_meta_data ->> 'full_name', ''), NULLIF(u.raw_user_meta_data ->> 'name', '')) IS NOT NULL;

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
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), NULLIF(NEW.raw_user_meta_data ->> 'name', '')),
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
