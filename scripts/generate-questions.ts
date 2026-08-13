/**
 * Question-bank generation pipeline (dry-run only — see README.md in this folder).
 *
 * Agent 1 (generator) produces a batch of new questions from source material,
 * constrained to a JSON schema via structured outputs (output_config.format) —
 * this guarantees the *shape* is valid (field names/types), not that the math
 * or LaTeX content is correct.
 *
 * Agent 2 (QA) is dual-mode by design (see prompts.ts): it replies with a short
 * approval sentence when everything is correct, or a corrections summary
 * followed by the full corrected JSON array when it isn't. It is deliberately
 * NOT run through structured outputs, since forcing JSON every time would
 * defeat its token-saving "just say OK" path.
 *
 * Usage: bun scripts/generate-questions.ts [path-to-source-file]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { AGENT_1_SYSTEM_PROMPT, AGENT_2_SYSTEM_PROMPT } from "./prompts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODEL = "claude-opus-5";
const TOPICS = ["אלגברה", "בעיות", "גיאומטריה", "הסקה מתרשים"] as const;
const EXPECTED_SOURCE_COUNT = 5;
const APPROVED_MARKER = "הכל תקין";

const QuestionSchema = z
  .object({
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

const GeneratedBatchSchema = z.object({
  questions: z.array(QuestionSchema),
});

type Question = z.infer<typeof QuestionSchema>;

function readSourceFile(): string {
  const argPath = process.argv[2];
  const sourcePath = argPath
    ? join(process.cwd(), argPath)
    : join(__dirname, "input", "source-questions.txt");

  if (!existsSync(sourcePath)) {
    throw new Error(
      `לא נמצא קובץ שאלות מקור ב-${sourcePath}.\n` +
        `העתק את scripts/input/source-questions.example.txt לשם, מלא ${EXPECTED_SOURCE_COUNT} שאלות מקור, ונסה שוב.`,
    );
  }

  const text = readFileSync(sourcePath, "utf-8").trim();
  if (!text) throw new Error(`קובץ השאלות ריק: ${sourcePath}`);
  return text;
}

/**
 * Agent 2's corrections path prefixes a "🛠️ תיקונים שבוצעו:" summary before
 * the JSON array — extract just the array, with a proper JSON-string-aware
 * bracket scan (LaTeX like \sqrt[3]{x} inside a string value contains
 * unbalanced brackets, so naive indexOf/lastIndexOf would cut it wrong).
 */
function extractJsonArray(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.indexOf("[");
  if (start === -1) throw new Error("לא נמצא מערך JSON בתשובת סוכן ה-QA");

  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = -1;
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) throw new Error("מערך ה-JSON בתשובת סוכן ה-QA לא נסגר כראוי");
  return JSON.parse(candidate.slice(start, end + 1));
}

function sqlString(value: string | null): string {
  if (value === null) return "NULL";
  return `'${value.replace(/'/g, "''")}'`;
}
function sqlJsonb(value: unknown): string {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}
function sqlIntOrNull(value: number | null): string {
  return value === null ? "NULL" : String(value);
}

function buildInsertSql(rows: Question[]): string {
  const values = rows
    .map(
      (r) =>
        `  (${sqlString(r.topic)}, ${r.difficulty}, ${sqlString(r.question)}, ${sqlJsonb(
          r.answers,
        )}, ${r.correct_index}, ${sqlString(r.explanation)}, ${sqlString(r.svg_code)}, ${sqlString(
          r.group_id,
        )}, ${sqlIntOrNull(r.group_order)})`,
    )
    .join(",\n");
  return (
    `insert into questions\n` +
    `  (topic, difficulty, question, answers, correct_index, explanation, svg_code, group_id, group_order)\n` +
    `values\n${values};\n`
  );
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY לא מוגדר. ודא שיצרת scripts/../.env.local עם המפתח (bun טוען .env.local אוטומטית).",
    );
  }

  const client = new Anthropic();
  const sourceText = readSourceFile();

  console.log(`\n=== סוכן 1: יוצר שאלות ===`);
  const genStream = client.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: zodOutputFormat(GeneratedBatchSchema),
    },
    system: AGENT_1_SYSTEM_PROMPT,
    messages: [{ role: "user", content: sourceText }],
  });
  const genMessage = await genStream.finalMessage();
  const genText = genMessage.content.find((b) => b.type === "text");
  if (!genText || genText.type !== "text") {
    throw new Error("סוכן 1 לא החזיר תוכן טקסט (בדוק stop_reason: " + genMessage.stop_reason + ")");
  }
  const generated = GeneratedBatchSchema.parse(JSON.parse(genText.text)).questions;
  console.log(`נוצרו ${generated.length} שאלות.`);

  console.log(`\n=== סוכן 2: בדיקת איכות ===`);
  const qaStream = client.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: AGENT_2_SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(generated, null, 2) }],
  });
  const qaMessage = await qaStream.finalMessage();
  const qaText = qaMessage.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("\n");

  let approved: Question[];
  let hadCorrections: boolean;
  if (qaText.includes(APPROVED_MARKER)) {
    approved = generated;
    hadCorrections = false;
  } else {
    hadCorrections = true;
    const extracted = extractJsonArray(qaText);
    approved = z.array(QuestionSchema).parse(extracted);
  }

  // Local structural safety net — Agent 2's schema checks are content-level,
  // not a hard guarantee; re-validate every row before writing output.
  const failures: { index: number; error: string }[] = [];
  const validRows: Question[] = [];
  approved.forEach((row, i) => {
    const result = QuestionSchema.safeParse(row);
    if (result.success) validRows.push(result.data);
    else failures.push({ index: i, error: result.error.message });
  });

  const outDir = join(__dirname, "output");
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = join(outDir, `batch-${stamp}.json`);
  const sqlPath = join(outDir, `batch-${stamp}.sql`);
  writeFileSync(jsonPath, JSON.stringify(validRows, null, 2), "utf-8");
  writeFileSync(sqlPath, buildInsertSql(validRows), "utf-8");

  console.log(`\n=== סיכום הרצה ===`);
  console.log(`שאלות שנוצרו: ${generated.length}`);
  console.log(`תיקוני QA: ${hadCorrections ? "כן — ראה פירוט למטה" : "לא — אושר כפי שהוא"}`);
  console.log(`עברו אימות מקומי: ${validRows.length}`);
  if (failures.length > 0) {
    console.log(`נכשלו באימות מקומי: ${failures.length}`);
    for (const f of failures) console.log(`  שאלה #${f.index + 1}: ${f.error}`);
  }
  if (hadCorrections) {
    console.log(`\n--- דיווח סוכן QA ---\n${qaText.split("[")[0]!.trim()}`);
  }
  console.log(`\nקובץ JSON: ${jsonPath}`);
  console.log(`קובץ SQL:  ${sqlPath}`);
  console.log(`\nזהו dry-run — שום דבר לא הועלה ל-Supabase. בדוק את הקבצים ותדביק ידנית ב-SQL Editor.`);
}

main().catch((err) => {
  console.error("\n❌ הריצה נכשלה:", err instanceof Error ? err.message : err);
  process.exit(1);
});
