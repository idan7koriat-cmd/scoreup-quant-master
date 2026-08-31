-- Users who signed up via Google already have their real name sitting in
-- auth.users.raw_user_meta_data (full_name/name, populated by Supabase's Google OAuth flow) —
-- see the dashboard greeting fallback in src/routes/dashboard.tsx. profiles.full_name never
-- picked it up though, and the previous backfill (20260831100000) filled every NULL full_name
-- with an email-derived guess, including for Google users who actually have a real name
-- available. This corrects those rows: wherever auth metadata has a real name, it now wins over
-- both NULL and the earlier email-derived guess. Users without OAuth metadata (email+password
-- signups) are untouched and keep the email-derived name from the previous migration.
UPDATE public.profiles p
SET full_name = COALESCE(NULLIF(u.raw_user_meta_data ->> 'full_name', ''), NULLIF(u.raw_user_meta_data ->> 'name', ''))
FROM auth.users u
WHERE u.id = p.id
  AND COALESCE(NULLIF(u.raw_user_meta_data ->> 'full_name', ''), NULLIF(u.raw_user_meta_data ->> 'name', '')) IS NOT NULL;
