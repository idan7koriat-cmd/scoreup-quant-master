-- Server-side answer checking. Never expose questions.correct_index / questions.explanation to
-- anon/authenticated directly (see the column-grant migration) — instead the client submits a
-- selected answer and gets back correctness + explanation through this SECURITY DEFINER RPC,
-- which also enforces the free-tier daily limit (3 answer reveals/day) that used to be enforced
-- only in the UI (isPremium / quickLocked / last_quick_practice), and was therefore bypassable via
-- direct REST/RPC calls with a valid free-tier login.
--
-- auth.uid() here comes from the caller's verified JWT (the app calls this via the per-request
-- Supabase client that's already authenticated as the real user), not a client-supplied argument,
-- so it cannot be spoofed to check another user's quota or another user's premium status.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_checks_date date,
  ADD COLUMN IF NOT EXISTS daily_checks_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.check_answers(payload jsonb)
RETURNS TABLE(question_id uuid, is_correct boolean, correct_index int, explanation text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  uid uuid := auth.uid();
  is_prem boolean;
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

  select p.is_premium, p.daily_checks_date, p.daily_checks_count
    into is_prem, chk_date, chk_count
    from profiles p where p.id = uid
    for update;

  if not coalesce(is_prem, false) and n > 0 then
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
