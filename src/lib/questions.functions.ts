import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Question } from "@/data/questions";

type Filters = {
  topics?: string[];
  count?: number;
  difficultyLevel?: number | null;
};

function client() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<any>(process.env.SUPABASE_URL!, key, {
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

function toQuestion(row: any): Question {
  const diff = row.difficulty ?? row.difficulty_level ?? 1;
  return {
    id: row.id,
    topic: row.topic,
    difficulty: diff,
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

    // 2. סינון לפי רמת קושי (עמודה מספרית difficulty_level)
    if (filters.difficultyLevel != null) {
      query = query.eq("difficulty_level", filters.difficultyLevel);
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    const shuffled = [...(rows ?? [])];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const limited = filters.count && filters.count > 0 ? shuffled.slice(0, filters.count) : shuffled;

    return limited.map(toQuestion);
  });
