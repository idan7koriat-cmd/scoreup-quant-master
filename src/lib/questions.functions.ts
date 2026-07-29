import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Question, SolutionStep } from "@/data/questions";

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
      .select("id, topic, difficulty, prompt, latex, options, correct_index, solution_steps")
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      topic: row.topic,
      difficulty: row.difficulty,
      prompt: row.prompt,
      latex: row.latex,
      options: (row.options as string[]) ?? [],
      correctIndex: row.correct_index,
      solutionSteps: (row.solution_steps as SolutionStep[]) ?? [],
    }));
  },
);
