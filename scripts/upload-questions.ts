/**
 * Uploads a previously-generated batch (scripts/output/batch-*.json) to Supabase via the
 * upsert_questions() RPC — see supabase/migrations/20260813230407_upsert_questions_rpc.sql
 * for the one-time DB setup this depends on.
 *
 * This never uses service_role. It calls the RPC with the existing public anon key plus a
 * QUESTION_WRITER_SECRET (from .env.local) that the RPC checks internally — the anon key alone
 * cannot successfully call it. Rows without an `id` are inserted; rows with an `id` update that
 * existing question in place (used for fixing a previously-flagged question) or fail loudly if
 * that id doesn't exist.
 *
 * Always dry-runs by default — nothing is sent to Supabase unless --confirm is passed, so you
 * can review exactly what would happen first.
 *
 * Usage:
 *   bun scripts/upload-questions.ts scripts/output/batch-<timestamp>.json            (dry-run — prints a plan only)
 *   bun scripts/upload-questions.ts scripts/output/batch-<timestamp>.json --confirm   (actually uploads)
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod/v4";

const MAX_BATCH_SIZE = 20;

const TOPICS = ["אלגברה", "בעיות", "גיאומטריה", "הסקה מתרשים"] as const;

const RowSchema = z
  .object({
    id: z.string().uuid().optional(),
    topic: z.enum(TOPICS),
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    question: z.string().min(1),
    answers: z.array(z.string().min(1)).length(4),
    correct_index: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
    explanation: z.string().min(1),
    svg_code: z.string().nullable(),
    group_id: z.string().nullable(),
    group_order: z.number().int().nullable(),
  })
  .strict();

type Row = z.infer<typeof RowSchema>;

function client() {
  const key = process.env["EXT_SUPABASE_ANON_KEY"]!;
  return createClient<any>(process.env["EXT_SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function readBatch(path: string): Row[] {
  const text = readFileSync(path, "utf-8");
  const parsed = JSON.parse(text);
  const rows = z.array(RowSchema).parse(parsed);
  if (rows.length === 0) throw new Error("קובץ ה-batch ריק");
  if (rows.length > MAX_BATCH_SIZE) {
    throw new Error(`יותר מדי שאלות בקובץ אחד (${rows.length}) — מקסימום ${MAX_BATCH_SIZE} להעלאה בפעם אחת`);
  }
  return rows;
}

function printPlan(rows: Row[]) {
  console.log(`\n=== תוכנית העלאה (${rows.length} שאלות) ===`);
  rows.forEach((r, i) => {
    const action = r.id ? `עדכון (id: ${r.id})` : "שאלה חדשה";
    const preview = r.question.length > 70 ? r.question.slice(0, 70) + "…" : r.question;
    console.log(`  ${i + 1}. [${action}] [${r.topic}] ${preview}`);
  });
}

async function main() {
  const filePath = process.argv[2];
  const confirm = process.argv.includes("--confirm");

  if (!filePath) {
    throw new Error("שימוש: bun scripts/upload-questions.ts <path-to-batch.json> [--confirm]");
  }
  if (!process.env["EXT_SUPABASE_URL"] || !process.env["EXT_SUPABASE_ANON_KEY"]) {
    throw new Error("EXT_SUPABASE_URL / EXT_SUPABASE_ANON_KEY לא מוגדרים (.env)");
  }
  if (!process.env["QUESTION_WRITER_SECRET"]) {
    throw new Error(
      "QUESTION_WRITER_SECRET לא מוגדר ב-.env.local. ודא שהרצת את ה-setup החד-פעמי ב-SQL Editor " +
        "(ראה supabase/migrations/20260813230407_upsert_questions_rpc.sql) עם אותו ערך.",
    );
  }

  const rows = readBatch(filePath);
  printPlan(rows);

  if (!confirm) {
    console.log(`\nזהו dry-run — שום דבר לא נשלח ל-Supabase. הרץ שוב עם --confirm כדי להעלות בפועל.`);
    return;
  }

  console.log(`\n=== מעלה ל-Supabase ===`);
  const { data, error } = await client().rpc("upsert_questions", {
    payload: rows,
    write_secret: process.env["QUESTION_WRITER_SECRET"],
  });

  if (error) throw new Error(`ההעלאה נכשלה: ${error.message}`);

  const results = data as { id: string; action: string }[];
  const inserted = results.filter((r) => r.action === "inserted").length;
  const updated = results.filter((r) => r.action === "updated").length;
  console.log(`הצליח: ${inserted} שאלות חדשות נוספו, ${updated} שאלות קיימות עודכנו.`);
  for (const r of results) console.log(`  ${r.action === "inserted" ? "➕" : "✏️"} ${r.id}`);
}

main().catch((err) => {
  console.error("\n❌ ", err instanceof Error ? err.message : err);
  process.exit(1);
});
