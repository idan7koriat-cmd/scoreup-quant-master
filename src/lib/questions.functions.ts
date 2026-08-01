import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Question } from "@/data/questions";

type Filters = {
  topics?: string[];
  count?: number;
  difficultyLevel?: number | null;
};

function client() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
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

type Row = Database["public"]["Tables"]["questions"]["Row"];

function toQuestion(row: Row & { difficulty?: number }): Question {
  return {
    id: row.id,
    topic: row.topic,
    difficulty: row.difficulty ?? 1,
    difficultyLevel: row.difficulty ?? null,
    question: row.question,
    answers: (row.answers as string[]) ?? [],
    correctIndex: row.correct_index,
    explanation: row.explanation ?? "",
    svgCode: row.svg_code ?? null,
  };
}

/** Distinct topics available in the bank, for the configurator. */
export const getTopics = createServerFn({ method: "GET" }).handler(async (): Promise<string[]> => {
  const { data, error } = await client().from("questions").select("topic");
  if (error) throw new Error(error.message);
  return Array.from(new Set((data ?? []).map((r) => r.topic))).sort();
});

export const getQuestions = createServerFn({ method: "GET" })
  .inputValidator((input: any) => input)
  .handler(async ({ data }): Promise<Question[]> => {
    // תמיכה גם בקריאה עטופה וגם בקריאה ישירה
    const filters: Filters = data?.data ? data.data : (data ?? {});

    let query = client().from("questions").select("*");

    if (filters.topics && filters.topics.length > 0) {
      query = query.in("topic", filters.topics);
    }
    if (filters.difficultyLevel != null) {
      query = query.eq("difficulty", filters.difficultyLevel);
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
