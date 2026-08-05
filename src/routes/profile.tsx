import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Loader2,
  LogOut,
  Sigma,
  Sparkles,
  Target,
  Zap,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { getExtSupabase } from "@/lib/extAuthClient";
import { getProfilePage, resetMyStats, updateMyProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "הפרופיל שלי — ScoreUp" },
      {
        name: "description",
        content:
          "עדכן את פרטי החשבון, תאריך הבחינה וצפה בסיכום התרגול והדיוק שלך לפי נושאים.",
      },
      { property: "og:title", content: "הפרופיל שלי — ScoreUp" },
      {
        property: "og:description",
        content: "פרטי חשבון, סטטוס מנוי וסטטיסטיקות תרגול אישיות ב-ScoreUp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-black text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ProfilePage() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [saved, setSaved] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [notice, setNotice] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["profile-page", from, to],
    queryFn: () => getProfilePage({ data: { from: from || null, to: to || null } }),
    enabled: !!session,
  });

  useEffect(() => {
    if (!data) return;
    setFullName(data.fullName ?? "");
    setExamDate(data.examDate ?? "");
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      updateMyProfile({
        data: { fullName, examDate: examDate || null },
      }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      queryClient.invalidateQueries({ queryKey: ["profile-page"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const reset = useMutation({
    mutationFn: () => resetMyStats(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-page"] });
      setNotice("הסטטיסטיקה אופסה ✓");
      setTimeout(() => setNotice(""), 2500);
    },
  });

  const changePassword = async () => {
    const email = data?.email ?? session?.user.email;
    if (!email) return;
    const supabase = await getExtSupabase();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=signin`,
    });
    setNotice("נשלח אליך מייל לאיפוס סיסמה 📧");
    setTimeout(() => setNotice(""), 4000);
  };

  if (loading || (session && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    navigate({ to: "/auth", search: { mode: "signin" as const }, replace: true });
    return null;
  }

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await (await getExtSupabase()).auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" as const }, replace: true });
  };

  const total = data?.total ?? 0;
  const correct = data?.correct ?? 0;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const isPremium = data?.isPremium ?? false;

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sigma className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="text-xl font-black tracking-tight text-foreground">
              Score
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-text)" }}
              >
                Up
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4" />
              חזרה לדשבורד
            </Link>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              התנתק
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          הפרופיל שלי
        </h1>
        <p className="mt-2 text-muted-foreground">
          נהל את פרטי החשבון שלך ועקוב אחרי ההתקדמות בתרגול.
        </p>

        {/* פרטי חשבון */}
        <section className="mt-8 rounded-3xl border border-border bg-card p-6">
          <h2 className="text-xl font-extrabold text-foreground">פרטי חשבון</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-muted-foreground">
                כתובת אימייל
              </label>
              <input
                value={data?.email ?? ""}
                disabled
                className="mt-1.5 w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm font-semibold text-muted-foreground"
              />
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="text-sm font-semibold text-muted-foreground"
              >
                שם מלא
              </label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="השם המלא שלך"
                className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="examDate"
                className="text-sm font-semibold text-muted-foreground"
              >
                תאריך הבחינה הקרוב
              </label>
              <input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground">
                תחום לימודים מבוקש
              </label>
              <input
                value={data?.targetDegree ?? "—"}
                disabled
                className="mt-1.5 w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm font-semibold text-muted-foreground"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "var(--gradient-primary)" }}
            >
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              שמור שינויים
            </button>
            <button
              onClick={changePassword}
              className="inline-flex items-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
            >
              <KeyRound className="h-4 w-4" />
              שינוי סיסמה
            </button>
            {saved && (
              <span className="text-sm font-semibold text-emerald-600">
                השינויים נשמרו ✓
              </span>
            )}
            {notice && (
              <span className="text-sm font-semibold text-primary">{notice}</span>
            )}
          </div>
        </section>

        {/* סטטוס מנוי */}
        <section className="mt-8 rounded-3xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                סוג החשבון
              </p>
              <p className="mt-1 flex items-center gap-2 text-xl font-extrabold text-foreground">
                {isPremium ? (
                  <>
                    <Sparkles className="h-5 w-5 text-primary" />
                    מנוי פעיל — מסלול 700+
                  </>
                ) : (
                  <>
                    <Target className="h-5 w-5 text-muted-foreground" />
                    מסלול חינמי
                  </>
                )}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isPremium
                  ? "יש לך גישה מלאה לכל המאגר, לסימולציות ולניתוח AI."
                  : "גישה חלקית למאגר. שדרג כדי לפתוח את הכל."}
              </p>
            </div>
            {!isPremium && (
              <Link
                to="/pricing"
                className="flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.03]"
                style={{ background: "var(--gradient-cta)" }}
              >
                <Zap className="h-4 w-4" />
                שדרג למסלול 700+ ⚡
              </Link>
            )}
          </div>
        </section>

        {/* סיכום תרגול */}
        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-xl font-extrabold text-foreground">
              סיכום התרגול שלי
            </h2>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="from" className="text-xs font-semibold text-muted-foreground">
                  מתאריך
                </label>
                <input
                  id="from"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="mt-1 block rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="to" className="text-xs font-semibold text-muted-foreground">
                  עד תאריך
                </label>
                <input
                  id="to"
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="mt-1 block rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary"
                />
              </div>
              {(from || to) && (
                <button
                  onClick={() => {
                    setFrom("");
                    setTo("");
                  }}
                  className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
                >
                  הצג הכל
                </button>
              )}
              <button
                onClick={() => reset.mutate()}
                disabled={reset.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/40 px-3 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4" />
                איפוס סטטיסטיקה
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <StatCard label="שאלות שנפתרו" value={String(total)} />
            <StatCard label="תשובות נכונות" value={String(correct)} />
            <StatCard
              label="אחוז דיוק"
              value={`${accuracy}%`}
              hint={total ? undefined : "עדיין אין נתונים"}
            />
          </div>

          <h3 className="mt-8 text-lg font-extrabold text-foreground">
            פילוח לפי נושאים
          </h3>
          {data && data.byTopic.length > 0 ? (
            <div className="mt-4 space-y-3">
              {data.byTopic.map((t) => {
                const pct = t.total ? Math.round((t.correct / t.total) * 100) : 0;
                return (
                  <div
                    key={t.topic}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-foreground">{t.topic}</span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {t.correct}/{t.total} · {pct}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: "var(--gradient-primary)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              עדיין לא פתרת שאלות — התחל תרגול ונתחיל לאסוף נתונים.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
