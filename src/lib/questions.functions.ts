import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Question } from "@/data/questions";

type Filters = {
  topics?: string[];
  count?: number;
  difficultyLevel?: number | null;
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


export const getTopics = createServerFn({ method: "GET" }).handler(async (): Promise<string[]> => {
  const { data, error } = await client().from("questions").select("topic");
  if (error) throw new Error(error.message);
  return Array.from(new Set((data ?? []).map((r: any) => r.topic))).sort();
});

export const getQuestions = createServerFn({ method: "GET" })
  .inputValidator((input: any) => input)
  .handler(async ({ data }): Promise<Question[]> => {
    // חילוץ פילטרים גם מקריאה עטופה (data.data) וגם מקריאה ישירה
    const rawData = (data as any)?.data ? (data as any).data : data;
    const filters: Filters = rawData ?? {};

    let query = client().from("questions").select("*");

    // 1. סינון לפי נושאים
    if (filters.topics && filters.topics.length > 0) {
      query = query.in("topic", filters.topics);
    }

    // 2. סינון לפי רמת קושי (עמודה מספרית difficulty)
    if (filters.difficultyLevel != null) {
      query = query.eq("difficulty", filters.difficultyLevel);
    }


    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    // קיבוץ לפי group_id (שאלה ללא קבוצה = קבוצה של אחת)
    const groups = new Map<string, any[]>();
    for (const row of rows ?? []) {
      const gid =
        row.group_id != null && String(row.group_id).trim() !== ""
          ? `g:${row.group_id}`
          : `s:${row.id}`;
      const list = groups.get(gid);
      if (list) list.push(row);
      else groups.set(gid, [row]);
    }

    // מיון פנימי לפי group_order (null בסוף)
    const ordered = Array.from(groups.values()).map((list) =>
      [...list].sort((a, b) => {
        const av = a.group_order == null ? Number.POSITIVE_INFINITY : Number(a.group_order);
        const bv = b.group_order == null ? Number.POSITIVE_INFINITY : Number(b.group_order);
        return av - bv;
      }),
    );

    // ערבוב ברמת קבוצה
    for (let i = ordered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    }

    let selected: any[] = [];
    if (filters.count && filters.count > 0) {
      for (const group of ordered) {
        if (selected.length >= filters.count) break;
        if (selected.length + group.length <= filters.count) selected.push(...group);
      }
      // אם שום קבוצה לא נכנסה במכסה, ניקח את הקבוצה הקטנה ביותר
      if (selected.length === 0 && ordered.length > 0) {
        const smallest = [...ordered].sort((a, b) => a.length - b.length)[0];
        selected = [...smallest];
      }
    } else {
      selected = ordered.flat();
    }

    return selected.map(toQuestion);
  });
