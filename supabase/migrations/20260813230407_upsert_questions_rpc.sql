-- Narrow, secret-gated RPC for the local question-generation pipeline (scripts/upload-questions.ts)
-- to insert new questions or fix existing ones by id, WITHOUT ever handing that script a
-- service_role key or an RLS policy that opens INSERT/UPDATE to the public anon key.
--
-- Design:
--   - SECURITY DEFINER means this function runs with the owner's privileges (bypasses RLS on
--     `questions` internally), but it is the ONLY privileged surface — it touches no other table.
--   - The `write_secret` argument is checked against a value stored in `app_secrets` (below), so
--     calling this successfully requires the secret even though EXECUTE is granted to the public
--     `anon` role. Leaking the anon key alone is not enough to call this successfully.
--   - Updates only ever touch a row whose `id` you explicitly pass — there is no dynamic WHERE
--     clause, so this can never turn into a mass update. Passing an `id` that doesn't exist raises
--     an error rather than silently inserting a new row under a caller-chosen id.
--   - Batch size is capped (20) as a guardrail against script bugs, independent of the secret check.
--
-- The secret itself lives in `app_secrets`, a table with RLS enabled and zero policies — so it is
-- unreachable via the REST API (PostgREST) by anon/authenticated no matter what, and readable only
-- by a SECURITY DEFINER function owned by the same role that owns the table (table owners bypass
-- RLS by default). This replaces the more common `alter database ... set app.settings.x = ...`
-- pattern, which Supabase's hosted platform blocks for the SQL Editor's role (permission denied).
--
-- ONE-TIME SETUP: run this entire file, once, in the Supabase SQL Editor.
--
-- To revoke/rotate later: `update app_secrets set value = '<new value>' where key =
-- 'question_writer_secret';`, and update QUESTION_WRITER_SECRET in .env.local to match.

create table if not exists public.app_secrets (
  key text primary key,
  value text not null
);
alter table public.app_secrets enable row level security;

insert into public.app_secrets (key, value)
values ('question_writer_secret', '<value from .env.local QUESTION_WRITER_SECRET>')
on conflict (key) do update set value = excluded.value;

create or replace function public.upsert_questions(payload jsonb, write_secret text)
returns table(id uuid, action text)
language plpgsql
security definer
set search_path = public
as $$
declare
  rec jsonb;
  existing_id uuid;
  new_id uuid;
begin
  if write_secret is null or write_secret <> (select value from public.app_secrets where key = 'question_writer_secret') then
    raise exception 'unauthorized';
  end if;

  if jsonb_typeof(payload) <> 'array' then
    raise exception 'payload must be a JSON array';
  end if;

  if jsonb_array_length(payload) > 20 then
    raise exception 'batch too large (% rows) — max 20 per call', jsonb_array_length(payload);
  end if;

  for rec in select * from jsonb_array_elements(payload)
  loop
    existing_id := nullif(rec->>'id', '')::uuid;

    if existing_id is not null then
      update questions set
        topic         = rec->>'topic',
        difficulty    = (rec->>'difficulty')::int,
        question      = rec->>'question',
        answers       = rec->'answers',
        correct_index = (rec->>'correct_index')::int,
        explanation   = rec->>'explanation',
        svg_code      = rec->>'svg_code',
        group_id      = rec->>'group_id',
        group_order   = (rec->>'group_order')::int
      where questions.id = existing_id;

      if not found then
        raise exception 'question id % not found — refusing to insert a new row under a caller-supplied id', existing_id;
      end if;

      id := existing_id;
      action := 'updated';
    else
      insert into questions (topic, difficulty, question, answers, correct_index, explanation, svg_code, group_id, group_order)
      values (
        rec->>'topic',
        (rec->>'difficulty')::int,
        rec->>'question',
        rec->'answers',
        (rec->>'correct_index')::int,
        rec->>'explanation',
        rec->>'svg_code',
        rec->>'group_id',
        (rec->>'group_order')::int
      )
      returning questions.id into new_id;

      id := new_id;
      action := 'inserted';
    end if;

    return next;
  end loop;
end;
$$;

grant execute on function public.upsert_questions(jsonb, text) to anon;
