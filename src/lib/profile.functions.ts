import { createServerFn } from "@tanstack/react-start";
import { requireExtAuth } from "@/lib/extAuth.middleware";

export type Profile = {
  fullName: string;
  examDate: string | null;
  targetDegree: string | null;
  isPremium: boolean;
  trialEndsAt: string | null;
  lastQuickPractice: string | null;
  streak: number;
};

/** פרימיום בפועל: מנוי בתשלום, או עדיין בתוך חלון הניסיון של שבוע מההרשמה. */
function hasPremiumAccess(isPremium: boolean, trialEndsAt: string | null): boolean {
  return isPremium || (trialEndsAt != null && new Date(trialEndsAt).getTime() > Date.now());
}

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
    let data: any = null;
    try {
      const res = await context.supabase
        .from("profiles")
        .select("full_name, exam_date, target_degree, is_premium, trial_ends_at, last_quick_practice")
        .eq("id", context.userId)
        .maybeSingle();
      data = res.data;

      // משתמשים שנכנסו דרך Google מגיעים בלי שורת פרופיל — יוצרים אותה בכניסה הראשונה.
      if (!data) {
        await context.supabase
          .from("profiles")
          .upsert({ id: context.userId } as any, { onConflict: "id" });
      }
    } catch {
      // ממשיכים עם ברירות מחדל מה-auth metadata במקום להפיל את כל הבקשה.
    }

    const meta = (context as any).user?.user_metadata ?? {};
    const fullName = (data as any)?.full_name ?? meta.full_name ?? meta.name ?? "";

    let practicedDates = new Set<string>();
    try {
      const { data: solved } = await context.supabase
        .from("solved_questions")
        .select("solved_at")
        .eq("user_id", context.userId);
      practicedDates = new Set(
        ((solved as any[]) ?? []).map((r) => new Date(r.solved_at).toISOString().slice(0, 10)),
      );
    } catch {
      // רצף שלא ניתן לחישוב עדיף על הפלת כל הפרופיל.
    }

    const trialEndsAt = (data as any)?.trial_ends_at ?? null;

    return {
      fullName,
      examDate: (data as any)?.exam_date ?? null,
      targetDegree: (data as any)?.target_degree ?? null,
      isPremium: hasPremiumAccess(Boolean((data as any)?.is_premium), trialEndsAt),
      trialEndsAt,
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
    const { error } = await context.supabase.from("solved_questions").upsert(
      {
        user_id: context.userId,
        question_id: String(payload.questionId),
        is_correct: Boolean(payload.isCorrect),
      } as any,
      { onConflict: "user_id,question_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type TopicStat = { topic: string; total: number; correct: number };

type StatsContext = { supabase: any; userId: string };

/**
 * שולף את פילוח הדיוק לפי נושא + הסכומים הכוללים, מתוך solved_questions.
 * משותף בין getProfilePage (עם טווח תאריכים אופציונלי) לבין יועץ הלימודים (כל הזמנים).
 */
export async function getUserTopicStats(
  context: StatsContext,
  range?: { from?: string | null; to?: string | null },
): Promise<{ total: number; correct: number; byTopic: TopicStat[]; statsError: string | null }> {
  let rows: any[] = [];
  let statsErrorMessage: string | null = null;
  try {
    let solvedQuery = context.supabase
      .from("solved_questions")
      .select("question_id, is_correct, solved_at")
      .eq("user_id", context.userId);

    if (range?.from) solvedQuery = solvedQuery.gte("solved_at", `${range.from}T00:00:00`);
    if (range?.to) solvedQuery = solvedQuery.lte("solved_at", `${range.to}T23:59:59`);

    const { data: solved, error: solvedError } = await solvedQuery;
    if (solvedError) statsErrorMessage = solvedError.message;
    else rows = (solved as any[]) ?? [];
  } catch (e) {
    statsErrorMessage = e instanceof Error ? e.message : String(e);
  }

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
    total: rows.length,
    correct,
    byTopic: [...map.values()].sort((a, b) => b.total - a.total),
    statsError: statsErrorMessage,
  };
}

export type ProfilePage = {
  email: string | null;
  fullName: string;
  examDate: string | null;
  targetDegree: string | null;
  isPremium: boolean;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  total: number;
  correct: number;
  byTopic: TopicStat[];
  statsError: string | null;
};

export const getProfilePage = createServerFn({ method: "POST" })
  .middleware([requireExtAuth])
  .inputValidator((input?: { from?: string | null; to?: string | null }) => input ?? {})
  .handler(async ({ data, context }): Promise<ProfilePage> => {
    const payload = ((data as any)?.data ?? data ?? {}) as {
      from?: string | null;
      to?: string | null;
    };

    let row: any = null;
    try {
      const res = await context.supabase
        .from("profiles")
        .select("*")
        .eq("id", context.userId)
        .maybeSingle();
      row = res.data;
    } catch {
      // אם שליפת הפרופיל עצמה נכשלת, ממשיכים עם ברירות מחדל מה-auth metadata
      // במקום להפיל את כל הבקשה.
    }

    const user = (context as any).user;
    const meta = user?.user_metadata ?? {};
    const fullName = (row as any)?.full_name ?? meta.full_name ?? meta.name ?? "";

    const stats = await getUserTopicStats(context, { from: payload.from, to: payload.to });

    const trialEndsAt = (row as any)?.trial_ends_at ?? null;

    return {
      email: user?.email ?? null,
      fullName,
      examDate: (row as any)?.exam_date ?? null,
      targetDegree: (row as any)?.target_degree ?? null,
      isPremium: hasPremiumAccess(Boolean((row as any)?.is_premium), trialEndsAt),
      trialEndsAt,
      cancelAtPeriodEnd: Boolean((row as any)?.cancel_at_period_end),
      currentPeriodEnd: (row as any)?.current_period_end ?? null,
      total: stats.total,
      correct: stats.correct,
      byTopic: stats.byTopic,
      statsError: stats.statsError,
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

export const recordPaymentConsent = createServerFn({ method: "POST" })
  .middleware([requireExtAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, payment_consent_at: new Date().toISOString() } as any, {
        onConflict: "id",
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type CancelSubscriptionResult =
  | { ok: true; periodEnd: string | null }
  | { ok: false; reason: string };

/** מבטל את חידוש המנוי (ללא חיבור לחברת סליקה בפועל עדיין) ושולח מייל אישור ביטול. */
export const cancelSubscription = createServerFn({ method: "POST" })
  .middleware([requireExtAuth])
  .handler(async ({ context }): Promise<CancelSubscriptionResult> => {
    const { data: row } = await context.supabase
      .from("profiles")
      .select("current_period_end")
      .eq("id", context.userId)
      .maybeSingle();

    const { error } = await context.supabase
      .from("profiles")
      .update({ cancel_at_period_end: true, cancelled_at: new Date().toISOString() })
      .eq("id", context.userId);
    if (error) return { ok: false, reason: error.message };

    const periodEnd = (row as any)?.current_period_end ?? null;
    const email = (context as any).user?.email as string | undefined;
    const apiKey = process.env["RESEND_API_KEY"];

    if (email && apiKey) {
      const untilText = periodEnd ? `עד ${periodEnd}` : "עד תום מחזור החיוב הנוכחי ששולם";
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "ScoreUp <onboarding@resend.dev>",
            to: [email],
            subject: "אישור ביטול מנוי — ScoreUp",
            text: `היי,\n\nביטול המנוי שלך ל-ScoreUp נקלט בהצלחה. המנוי לא יחודש ולא תחויב/י שוב במחזור החיוב הבא.\nתמשיך/י ליהנות מהגישה המלאה ${untilText}.\n\nאם זו לא היית את/ה, אנא צור/י איתנו קשר בהקדם: ${process.env["VITE_SUPPORT_EMAIL"] ?? ""}\n\nצוות ScoreUp`,
          }),
        });
        if (!res.ok) {
          console.error("[cancelSubscription] Resend error:", res.status, await res.text());
        }
      } catch (e) {
        // כשל בשליחת המייל לא אמור לחסום את הביטול עצמו.
        console.error("[cancelSubscription] failed to send confirmation email", e);
      }
    }

    return { ok: true, periodEnd };
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
