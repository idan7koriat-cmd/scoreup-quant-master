-- Grants every new signup a 7-day trial with full premium access. The trial expires on its own —
-- no cron/expiry job needed, because "does this user have premium access" is evaluated live as
-- is_premium (a real paid subscription — still set manually until billing is wired up) OR
-- trial_ends_at still being in the future, via public.has_premium_access() everywhere access is
-- checked.
--
-- Also closes a privilege-escalation hole found while adding this: public.profiles had a
-- table-wide INSERT/UPDATE grant for `authenticated`, so any logged-in free user could set
-- is_premium = true on themselves (or, without this fix, push trial_ends_at into the future
-- forever) via a direct PostgREST call, bypassing the app UI entirely. Column-level grants now
-- restrict `authenticated` to the columns the app itself needs users to write; subscription/quota
-- columns are reachable only from SECURITY DEFINER functions (handle_new_user, check_answers) or a
-- future service_role billing webhook — the same pattern already used for
-- questions.correct_index/explanation (see 20260817101500_restrict_questions_answer_columns.sql).

-- daily_checks_date/daily_checks_count were meant to already exist from
-- 20260817101600_check_answers_rpc.sql, but given the payment_consent_at surprise above, this
-- migration no longer assumes any earlier migration actually ran against this database — it
-- re-declares (idempotently) everything check_answers() below depends on.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS daily_checks_date date,
  ADD COLUMN IF NOT EXISTS daily_checks_count integer NOT NULL DEFAULT 0;

-- New signups get a 7-day trial. Existing users are left with trial_ends_at = NULL (no
-- retroactive trial) — this only affects users created from this migration onward.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  RETURN NEW;
END;
$$;

-- Single definition of "does this user currently have premium access", so trial users and paying
-- users are treated identically everywhere access is gated instead of duplicating the OR logic.
CREATE OR REPLACE FUNCTION public.has_premium_access(p_is_premium boolean, p_trial_ends_at timestamptz)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(p_is_premium, false) OR (p_trial_ends_at IS NOT NULL AND p_trial_ends_at > now());
$$;

-- check_answers now also lets a trial user bypass the free-tier 3-reveals/day cap, same as a paid
-- premium user, for as long as trial_ends_at hasn't passed yet.
CREATE OR REPLACE FUNCTION public.check_answers(payload jsonb)
RETURNS TABLE(question_id uuid, is_correct boolean, correct_index int, explanation text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  uid uuid := auth.uid();
  is_prem boolean;
  trial_end timestamptz;
  chk_date date;
  chk_count int;
  n int := jsonb_array_length(payload);
  rec jsonb;
  qid uuid;
begin
  if uid is null then
    raise exception 'unauthorized';
  end if;

  if n > 20 then
    raise exception 'batch too large (% items) — max 20 per call', n;
  end if;

  select p.is_premium, p.trial_ends_at, p.daily_checks_date, p.daily_checks_count
    into is_prem, trial_end, chk_date, chk_count
    from profiles p where p.id = uid
    for update;

  if not public.has_premium_access(is_prem, trial_end) and n > 0 then
    if chk_date is distinct from current_date then
      chk_count := 0;
    end if;

    if coalesce(chk_count, 0) + n > 3 then
      raise exception 'DAILY_LIMIT_REACHED';
    end if;

    update profiles
      set daily_checks_date = current_date,
          daily_checks_count = coalesce(chk_count, 0) + n
      where id = uid;
  end if;

  for rec in select * from jsonb_array_elements(payload)
  loop
    qid := (rec->>'question_id')::uuid;

    select q.correct_index, q.explanation into correct_index, explanation
      from questions q where q.id = qid;

    if not found then
      raise exception 'question % not found', qid;
    end if;

    question_id := qid;
    is_correct := (rec->>'selected_index')::int = correct_index;
    return next;
  end loop;
end;
$$;

REVOKE EXECUTE ON FUNCTION public.check_answers(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_answers(jsonb) TO authenticated;

-- Lock down which profiles columns a logged-in user can write to directly (the app's own
-- upserts in src/lib/profile.functions.ts run with the user's own JWT, not service_role, so
-- whatever is grantable here is also directly reachable via a raw PostgREST call).
--
-- Column lists are applied defensively (only if the column actually exists on this database)
-- because the live schema has drifted from the tracked migrations before in both directions —
-- e.g. full_name was added outside any tracked migration, while columns from
-- 20260823120000_legal_consent_and_cancellation.sql (payment_consent_at, cancel_at_period_end,
-- cancelled_at, terms_accepted_at) may never actually have been run against this database. This
-- way the migration succeeds and grants whatever is really there, instead of failing outright on
-- "column does not exist" for a column this environment happens not to have.
REVOKE INSERT, UPDATE ON public.profiles FROM authenticated;

DO $$
DECLARE
  insertable text[] := ARRAY[
    'id', 'exam_date', 'target_degree', 'full_name', 'last_quick_practice', 'payment_consent_at'
  ];
  updatable text[] := ARRAY[
    'exam_date', 'target_degree', 'full_name', 'last_quick_practice',
    'payment_consent_at', 'cancel_at_period_end', 'cancelled_at'
  ];
  col text;
BEGIN
  FOREACH col IN ARRAY insertable LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = col
    ) THEN
      EXECUTE format('GRANT INSERT (%I) ON public.profiles TO authenticated', col);
    END IF;
  END LOOP;

  FOREACH col IN ARRAY updatable LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = col
    ) THEN
      EXECUTE format('GRANT UPDATE (%I) ON public.profiles TO authenticated', col);
    END IF;
  END LOOP;
END $$;

-- is_premium, trial_ends_at, daily_checks_date, daily_checks_count, current_period_end,
-- terms_accepted_at, created_at, updated_at are intentionally left out of both grants above:
-- they're only ever meant to be written by the SECURITY DEFINER functions above, by
-- handle_new_user, or (in the future) by a service_role billing webhook.
