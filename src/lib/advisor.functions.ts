import { createServerFn } from "@tanstack/react-start";
import { requireExtAuth } from "@/lib/extAuth.middleware";
import { getUserTopicStats } from "@/lib/profile.functions";
import { buildAdvice, type AdvisorTone, type TopicSignal } from "@/lib/learningAdvisorRules";

export type LearningAdvice = {
  headline: string;
  detail: string;
  recommendedTopic: string | null;
  recommendedDifficulty: number | null;
  tone: AdvisorTone;
  topicSignals: TopicSignal[];
};

const REFRESH_AFTER_MS = 3 * 24 * 60 * 60 * 1000;
const REFRESH_AFTER_NEW_SOLVED = 5;

function daysUntil(examDate: string | null): number | null {
  if (!examDate) return null;
  return Math.ceil(
    (new Date(`${examDate}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) /
      86400000,
  );
}

export const getLearningAdvice = createServerFn({ method: "GET" })
  .middleware([requireExtAuth])
  .handler(async ({ context }): Promise<LearningAdvice> => {
    const stats = await getUserTopicStats(context);

    let cached: any = null;
    try {
      const { data } = await context.supabase
        .from("learning_advice")
        .select("*")
        .eq("user_id", context.userId)
        .maybeSingle();
      cached = data;
    } catch {
      // אין שורה שמורה עדיין / הטבלה עוד לא זמינה — נחשב תובנה טרייה במקום.
    }

    const isStale =
      !cached ||
      Date.now() - new Date(cached.calculated_at).getTime() > REFRESH_AFTER_MS ||
      stats.total - cached.solved_count_at_calc >= REFRESH_AFTER_NEW_SOLVED;

    if (!isStale) {
      return {
        headline: cached.headline,
        detail: cached.detail,
        recommendedTopic: cached.recommended_topic,
        recommendedDifficulty: cached.recommended_difficulty,
        tone: cached.tone,
        topicSignals: (cached.topic_signals as TopicSignal[] | null) ?? [],
      };
    }

    let examDate: string | null = null;
    try {
      const { data: profileRow } = await context.supabase
        .from("profiles")
        .select("exam_date")
        .eq("id", context.userId)
        .maybeSingle();
      examDate = (profileRow as any)?.exam_date ?? null;
    } catch {
      // בלי תאריך בחינה פשוט לא נוסיף משפט דחיפות.
    }

    const advice = buildAdvice(stats.byTopic, daysUntil(examDate), `${context.userId}:${Date.now()}`);

    try {
      await context.supabase.from("learning_advice").upsert(
        {
          user_id: context.userId,
          headline: advice.headline,
          detail: advice.detail,
          recommended_topic: advice.recommendedTopic,
          recommended_difficulty: advice.recommendedDifficulty,
          tone: advice.tone,
          topic_signals: advice.topicSignals,
          solved_count_at_calc: stats.total,
          calculated_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id" },
      );
    } catch {
      // כשל בשמירת הקאש לא אמור למנוע החזרת התובנה שכבר חושבה.
    }

    return advice;
  });
