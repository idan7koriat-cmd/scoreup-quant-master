import { createServerFn } from "@tanstack/react-start";
import { requireExtAuth } from "@/lib/extAuth.server";

export type Profile = {
  examDate: string | null;
  targetDegree: string | null;
  isPremium: boolean;
  lastQuickPractice: string | null;
};

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireExtAuth])
  .handler(async ({ context }): Promise<Profile> => {
    const { data } = await context.supabase
      .from("profiles")
      .select("exam_date, target_degree, is_premium, last_quick_practice")
      .eq("id", context.userId)
      .maybeSingle();

    return {
      examDate: (data as any)?.exam_date ?? null,
      targetDegree: (data as any)?.target_degree ?? null,
      isPremium: Boolean((data as any)?.is_premium),
      lastQuickPractice: (data as any)?.last_quick_practice ?? null,
    };
  });

export const markQuickPractice = createServerFn({ method: "POST" })
  .middleware([requireExtAuth])
  .handler(async ({ context }) => {
    const today = new Date().toISOString().slice(0, 10);
    await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, last_quick_practice: today } as any);
    return { ok: true };
  });

export const recordSolvedQuestion = createServerFn({ method: "POST" })
  .middleware([requireExtAuth])
  .inputValidator((input: { questionId: string; isCorrect: boolean }) => input)
  .handler(async ({ data, context }) => {
    const payload = (data as any)?.data ?? data;
    await context.supabase.from("solved_questions").upsert(
      {
        user_id: context.userId,
        question_id: String(payload.questionId),
        is_correct: Boolean(payload.isCorrect),
      } as any,
      { onConflict: "user_id,question_id" },
    );
    return { ok: true };
  });
