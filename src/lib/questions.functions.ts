import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireExtAuth } from "@/lib/extAuth.middleware";
import type { Question } from "@/data/questions";

type Filters = {
  topics?: string[];
  count?: number;
  difficultyLevel?: number | null;
  examMode?: boolean;
};

function client() {
  const key = process.env['EXT_SUPABASE_ANON_KEY']!;
  return createClient<any>(process.env['EXT_SUPABASE_URL']!, key, {
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

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "קל",
  2: "בינוני",
  3: "קשה",
  4: "מאתגר",
};

const EXAM_TOPICS = ["אלגברה", "בעיות", "גיאומטריה"];

function toQuestion(row: any): Question {
  const raw = row.difficulty;
  const level = typeof raw === "number" ? raw : Number(raw);
  const diff = Number.isFinite(level) ? level : 2;
  return {
    id: row.id,
    topic: row.topic,
    difficulty: DIFFICULTY_LABELS[diff] ?? String(diff),
    difficultyLevel: diff,
    question: row.question ?? "",
    answers: (row.answers as string[]) ?? [],
    correctIndex: row.correct_index ?? row.correctIndex ?? 0,
    explanation: row.explanation ?? "",
    svgCode: row.svg_code ?? row.svgCode ?? null,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function groupRows(rows: any[]): any[][] {
  const groups = new Map<string, any[]>();
  for (const row of rows) {
    const gid =
      row.group_id != null && String(row.group_id).trim() !== ""
        ? `g:${row.group_id}`
        : `s:${row.id}`;
    const list = groups.get(gid);
    if (list) list.push(row);
    else groups.set(gid, [row]);
  }
  return Array.from(groups.values()).map((list) => {
    const sorted = [...list].sort((a, b) => {
      const av = a.group_order == null ? Number.POSITIVE_INFINITY : Number(a.group_order);
      const bv = b.group_order == null ? Number.POSITIVE_INFINITY : Number(b.group_order);
      return av - bv;
    });
    // בחלק מהתרשימים המשותפים ה-svg נשמר רק בשאלה הראשונה של הקבוצה — נפיץ אותו לכל חברות הקבוצה.
    const sharedSvg = sorted.find((r) => r.svg_code)?.svg_code ?? null;
    if (sharedSvg) {
      for (const r of sorted) if (!r.svg_code) r.svg_code = sharedSvg;
    }
    return sorted;
  });
}

export const getTopics = createServerFn({ method: "GET" }).handler(async (): Promise<string[]> => {
  const { data, error } = await client().from("questions").select("topic");
  if (error) throw new Error(error.message);
  return Array.from(new Set((data ?? []).map((r: any) => r.topic))).sort();
});

/** כלי בדיקה זמני (להסרה לפני ההשקה): שולף שאלה בודדת לפי id, לצורך QA ידני אחרי עריכה ב-DB. */
export const getQuestionById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string } | { data: { id: string } }) => input)
  .handler(async ({ data }): Promise<Question | null> => {
    const payload = (data as any)?.data ?? data;
    const id = String(payload.id ?? "").trim();
    if (!id) return null;

    const { data: row, error } = await client().from("questions").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return row ? toQuestion(row) : null;
  });

export const getQuestions = createServerFn({ method: "GET" })
  .middleware([requireExtAuth])
  .inputValidator((input: any) => input)
  .handler(async ({ data, context }): Promise<Question[]> => {
    const rawData = (data as any)?.data ? (data as any).data : data;
    const filters: Filters = rawData ?? {};

    // שאלות שהמשתמש כבר פתר — לא נציג אותן שוב.
    // כשל כאן לא אמור לחסום את טעינת השאלות עצמה — רק שהסינון לא יעבוד הפעם.
    const { data: solvedRows, error: solvedError } = await context.supabase
      .from("solved_questions")
      .select("question_id")
      .eq("user_id", context.userId);
    if (solvedError) console.error("[getQuestions] solved_questions fetch failed:", solvedError.message);
    const solved = new Set((solvedRows ?? []).map((r: any) => String(r.question_id)));

    let query = client().from("questions").select("*");
    if (!filters.examMode) {
      if (filters.topics && filters.topics.length > 0) {
        query = query.in("topic", filters.topics);
      }
      if (filters.difficultyLevel != null) {
        query = query.eq("difficulty", filters.difficultyLevel);
      }
    }

    const { data: allRows, error } = await query;
    if (error) throw new Error(error.message);

    let rows = (allRows ?? []).filter((r: any) => !solved.has(String(r.id)));
    // אם לא נותרו מספיק שאלות חדשות, נאפשר חזרה על שאלות קיימות
    if (rows.length === 0) rows = allRows ?? [];

    const ordered = shuffle(groupRows(rows));

    if (filters.examMode) {
      return buildExam(ordered).map(toQuestion);
    }

    let selected: any[] = [];
    if (filters.count && filters.count > 0) {
      for (const group of ordered) {
        if (selected.length >= filters.count) break;
        if (selected.length + group.length <= filters.count) selected.push(...group);
      }
      if (selected.length === 0 && ordered.length > 0) {
        const smallest = [...ordered].sort((a, b) => a.length - b.length)[0];
        selected = [...smallest];
      }
    } else {
      selected = ordered.flat();
    }

    return selected.map(toQuestion);
  });

/** סימולציית פרק מלאה: מקבץ תרשים אחד (4-5 שאלות) + שאר השאלות מחולקות בין הנושאים */
function buildExam(groups: any[][]): any[] {
  const TOTAL = 20;
  const diagramGroups = groups.filter(
    (g) => g.length >= 4 && g.length <= 5 && g[0].group_id != null,
  );
  const cluster = diagramGroups[0] ?? [];
  const used = new Set(cluster.map((r) => String(r.id)));

  const singles = groups
    .flat()
    .filter((r) => !used.has(String(r.id)));

  const byTopic = new Map<string, any[]>();
  for (const topic of EXAM_TOPICS) byTopic.set(topic, []);
  const rest: any[] = [];
  for (const row of singles) {
    const list = byTopic.get(row.topic);
    if (list) list.push(row);
    else rest.push(row);
  }

  const remaining = TOTAL - cluster.length;
  const picked: any[] = [];
  let i = 0;
  while (picked.length < remaining) {
    let added = false;
    for (const topic of EXAM_TOPICS) {
      const list = byTopic.get(topic)!;
      if (list[i]) {
        picked.push(list[i]);
        added = true;
        if (picked.length >= remaining) break;
      }
    }
    if (!added) break;
    i++;
  }
  // השלמה משאלות מנושאים אחרים אם חסר
  for (const row of rest) {
    if (picked.length >= remaining) break;
    picked.push(row);
  }

  // התרשים מוצג כמקבץ רציף באמצע הפרק
  const half = Math.floor(picked.length / 2);
  return [...picked.slice(0, half), ...cluster, ...picked.slice(half)];
}
