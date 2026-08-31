-- Read-only convenience view for browsing solved_questions in Supabase Studio with the
-- solving user's name/email inline, instead of having to look up user_id by hand.
--
-- Deliberately NOT granted to authenticated/anon: Studio's Table Editor connects as
-- postgres/service_role and bypasses RLS regardless, so it needs no grant to be visible there.
-- Granting this to authenticated would leak every user's profile (full_name/email) and every
-- other user's solved_questions rows to any logged-in user via the PostgREST API, since a plain
-- view runs with the querying role's privileges but profiles/solved_questions RLS only
-- restricts rows for the *owning* row's user_id/id match — a joined view has no single "owner"
-- row for auth.uid() to match against, so RLS on the base tables would not narrow it correctly.
CREATE OR REPLACE VIEW public.solved_questions_with_user AS
SELECT
  sq.id,
  sq.user_id,
  p.full_name,
  p.email,
  sq.question_id,
  sq.is_correct,
  sq.solved_at
FROM public.solved_questions sq
LEFT JOIN public.profiles p ON p.id = sq.user_id
ORDER BY sq.solved_at DESC;

COMMENT ON VIEW public.solved_questions_with_user IS
  'Admin/Studio convenience view: solved_questions joined to profiles for full_name/email. Not exposed to authenticated/anon.';
