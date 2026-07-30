import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Question } from "@/data/questions";

export const getQuestions = createServerFn({ method: "GET" }).handler(
  async (): Promise<Question[]> => {
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supabasePublic = createClient<Database>(process.env.SUPABASE_URL!, key, {
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

    const { data, error } = await supabasePublic
      .from("questions")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      topic: row.topic,
      difficulty: row.difficulty,
      question: row.question,
      answers: (row.answers as string[]) ?? [],
      correctIndex: row.correct_index,
      explanation: row.explanation ?? "",
    }));
  },
);
