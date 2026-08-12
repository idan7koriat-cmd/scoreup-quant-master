import { createServerFn } from "@tanstack/react-start";
import { requireExtAuth } from "@/lib/extAuth.middleware";

export type Profile = {
  fullName: string;
  examDate: string | null;
  targetDegree: string | null;
  isPremium: boolean;
  lastQuickPractice: string | null;
  streak: number;
};

/** ימי רצף רצופים שבהם נפתרה לפחות שאלה אחת, כולל "יום חסד": אם עוד לא תרגלת היום, הרצף עדיין נספר עד חצות. */
function computeStreak(practicedDates: Set<string>): number {
  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  const cursor = new Date();

  if (!practicedDates.has(toKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!practicedDates.has(toKey(cursor))) return 0;
  }

  let streak = 0;
  while (practicedDates.has(toKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireExtAuth])
  .handler(async ({ context }): Promise<Profile> => {
    const { data } = await context.supabase
      .from("profiles")
      .select("full_name, exam_date, target_degree, is_premium, last_quick_practice")
      .eq("id", context.userId)
      .maybeSingle();

    // משתמשים שנכנסו דרך Google מגיעים בלי שורת פרופיל — יוצרים אותה בכניסה הראשונה.
    if (!data) {
      await context.supabase
        .from("profiles")
        .upsert({ id: context.userId } as any, { onConflict: "id" });
    }

    const meta = (context as any).user?.user_metadata ?? {};
    const fullName = (data as any)?.full_name ?? meta.full_name ?? meta.name ?? "";

    const { data: solved } = await context.supabase
      .from("solved_questions")
      .select("created_at")
      .eq("user_id", context.userId);
    const practicedDates = new Set(
      ((solved as any[]) ?? []).map((r) => new Date(r.created_at).toISOString().slice(0, 10)),
    );

    return {
      fullName,
      examDate: (data as any)?.exam_date ?? null,
      targetDegree: (data as any)?.target_degree ?? null,
      isPremium: Boolean((data as any)?.is_premium),
      lastQuickPractice: (data as any)?.last_quick_practice ?? null,
      streak: computeStreak(practicedDates),
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

export type TopicStat = { topic: string; total: number; correct: number };
export type ProfilePage = {
  email: string | null;
  fullName: string;
  examDate: string | null;
  targetDegree: string | null;
  isPremium: boolean;
  total: number;
  correct: number;
  byTopic: TopicStat[];
};

export const getProfilePage = createServerFn({ method: "POST" })
  .middleware([requireExtAuth])
  .inputValidator((input?: { from?: string | null; to?: string | null }) => input ?? {})
  .handler(async ({ data, context }): Promise<ProfilePage> => {
    const payload = ((data as any)?.data ?? data ?? {}) as {
      from?: string | null;
      to?: string | null;
    };

    const { data: row } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();

    const user = (context as any).user;
    const meta = user?.user_metadata ?? {};
    const fullName =
      (row as any)?.full_name ?? meta.full_name ?? meta.name ?? "";

    let solvedQuery = context.supabase
      .from("solved_questions")
      .select("question_id, is_correct, created_at")
      .eq("user_id", context.userId);

    if (payload.from) solvedQuery = solvedQuery.gte("created_at", `${payload.from}T00:00:00`);
    if (payload.to) solvedQuery = solvedQuery.lte("created_at", `${payload.to}T23:59:59`);

    const { data: solved } = await solvedQuery;


    const rows = (solved as any[]) ?? [];
    const ids = [...new Set(rows.map((r) => String(r.question_id)))];
    let topics = new Map<string, string>();
    if (ids.length) {
      const { data: qs } = await context.supabase
        .from("questions")
        .select("id, topic")
        .in("id", ids);
      topics = new Map(((qs as any[]) ?? []).map((q) => [String(q.id), q.topic]));
    }

    const map = new Map<string, TopicStat>();
    let correct = 0;
    for (const r of rows) {
      if (r.is_correct) correct++;
      const topic = topics.get(String(r.question_id)) ?? "אחר";
      const cur = map.get(topic) ?? { topic, total: 0, correct: 0 };
      cur.total++;
      if (r.is_correct) cur.correct++;
      map.set(topic, cur);
    }

    return {
      email: user?.email ?? null,
      fullName,
      examDate: (row as any)?.exam_date ?? null,
      targetDegree: (row as any)?.target_degree ?? null,
      isPremium: Boolean((row as any)?.is_premium),
      total: rows.length,
      correct,
      byTopic: [...map.values()].sort((a, b) => b.total - a.total),
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireExtAuth])
  .inputValidator(
    (input: { fullName: string; examDate: string | null; targetDegree?: string | null }) => input,
  )
  .handler(async ({ data, context }) => {
    const payload = (data as any)?.data ?? data;
    const fullName = String(payload.fullName ?? "").trim();
    const examDate = payload.examDate ? String(payload.examDate) : null;
    const targetDegree = String(payload.targetDegree ?? "").trim() || null;

    const base = { id: context.userId, exam_date: examDate, target_degree: targetDegree } as any;
    const withName = { ...base, full_name: fullName };

    const { error } = await context.supabase
      .from("profiles")
      .upsert(withName, { onConflict: "id" });

    if (error) {
      // בפרויקטים שבהם אין עמודת full_name — שומרים את השם על המשתמש עצמו
      await context.supabase.from("profiles").upsert(base, { onConflict: "id" });
      await context.supabase.auth.updateUser({ data: { full_name: fullName } });
    }

    return { ok: true };
  });

export const resetMyStats = createServerFn({ method: "POST" })
  .middleware([requireExtAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("solved_questions")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reportQuestion = createServerFn({ method: "POST" })
  .middleware([requireExtAuth])
  .inputValidator((input: { questionId: string; reason: string; details?: string }) => input)
  .handler(async ({ data, context }) => {
    const payload = (data as any)?.data ?? data;
    const details = typeof payload.details === "string" ? payload.details.trim() : "";
    const { error } = await context.supabase.from("question_reports").insert({
      user_id: context.userId,
      question_id: String(payload.questionId),
      reason: String(payload.reason),
      details: details || null,
    } as any);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
