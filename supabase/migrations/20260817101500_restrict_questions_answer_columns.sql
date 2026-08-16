-- questions.correct_index and questions.explanation must never be readable by anon/authenticated
-- directly via PostgREST — they were world-readable (even to logged-out visitors hitting the REST
-- API with the public anon key), letting anyone fetch every correct answer, including for
-- "premium" questions, bypassing the isPremium/quickLocked checks that only ever existed in the UI.
--
-- Column-level GRANTs (not a view) keep this on the base table: RLS still allows the row, but the
-- two sensitive columns are only reachable from SECURITY DEFINER functions (e.g. check_answers,
-- see the next migration), which run as the table owner and bypass column privileges the same way
-- they bypass RLS.

REVOKE SELECT ON public.questions FROM anon, authenticated;

GRANT SELECT (
  id, topic, difficulty, question, answers,
  svg_code, group_id, group_order, created_at
) ON public.questions TO anon, authenticated;
