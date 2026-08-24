import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  XCircle,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { getExtSupabase } from "@/lib/extAuthClient";
import {
  cancelSubscription,
  getProfilePage,
  resetMyStats,
  updateMyProfile,
} from "@/lib/profile.functions";
import { ContactButton } from "@/components/scoreup/ContactButton";
import { AccuracyRing } from "@/components/scoreup/AccuracyRing";
import { TopicBar } from "@/components/scoreup/TopicBar";
import { Footer } from "@/components/scoreup/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "הפרופיל שלי — ScoreUp" },
      {
        name: "description",
        content: "עדכן את פרטי החשבון, תאריך הבחינה וצפה בסיכום התרגול והדיוק שלך לפי נושאים.",
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

type StatsRange = "today" | "yesterday" | "week" | "month" | "all";

const RANGE_OPTIONS: { value: StatsRange; label: string }[] = [
  { value: "today", label: "היום" },
  { value: "yesterday", label: "אתמול" },
  { value: "week", label: "שבוע אחרון" },
  { value: "month", label: "חודש אחרון" },
  { value: "all", label: "מתחילת השימוש" },
];

function rangeToDates(range: StatsRange): { from: string | null; to: string | null } {
  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  const today = new Date();
  if (range === "today") {
    const k = toKey(today);
    return { from: k, to: k };
  }
  if (range === "yesterday") {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - 1);
    const k = toKey(d);
    return { from: k, to: k };
  }
  if (range === "week") {
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - 6);
    return { from: toKey(from), to: toKey(today) };
  }
  if (range === "month") {
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - 29);
    return { from: toKey(from), to: toKey(today) };
  }
  return { from: null, to: null };
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[16px] border border-border bg-card p-6">
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
  const [targetDegree, setTargetDegree] = useState("");
  const [saved, setSaved] = useState(false);
  const [range, setRange] = useState<StatsRange>("all");
  const [notice, setNotice] = useState("");

  const { from, to } = rangeToDates(range);
  const { data, isLoading } = useQuery({
    queryKey: ["profile-page", range],
    queryFn: () => getProfilePage({ data: { from, to } }),
    enabled: !!session,
  });

  useEffect(() => {
    if (!data) return;
    setFullName(data.fullName ?? "");
    setExamDate(data.examDate ?? "");
    setTargetDegree(data.targetDegree ?? "");
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      updateMyProfile({
        data: { fullName, examDate: examDate || null, targetDegree: targetDegree || null },
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

  const cancel = useMutation({
    mutationFn: () => cancelSubscription(),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error("לא הצלחנו לבטל את המנוי כרגע — נסה שוב או פנה לתמיכה");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["profile-page"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("הביטול נקלט — נשלח אליך מייל אישור");
    },
    onError: () => {
      toast.error("לא הצלחנו לבטל את המנוי כרגע — נסה שוב או פנה לתמיכה");
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
  const cancelAtPeriodEnd = data?.cancelAtPeriodEnd ?? false;
  const currentPeriodEnd = data?.currentPeriodEnd ?? null;
  const statsError = data?.statsError ?? null;

  return (
    <div dir="rtl" className="su-theme-v2 min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sigma className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
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
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowRight className="h-4 w-4" />
              חזרה לדשבורד
            </Link>
            <Link
              to="/how-to-learn"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline"
            >
              איך ללמוד
            </Link>
            <Link
              to="/pricing"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline"
            >
              תכניות ומנויים
            </Link>
            <ContactButton className="hidden rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline">
              צור קשר
            </ContactButton>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <LogOut className="h-4 w-4" />
              התנתק
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-10">
        <div className="su-rise-in" style={{ animationDelay: "0ms" }}>
          <h1 className="text-4xl font-black tracking-tight text-foreground">הפרופיל שלי</h1>
          <p className="mt-2 text-muted-foreground">
            נהל את פרטי החשבון שלך ועקוב אחרי ההתקדמות בתרגול.
          </p>
        </div>

        {/* פרטי חשבון */}
        <section
          className="su-rise-in mt-8 rounded-[20px] border border-border bg-card p-6"
          style={{ animationDelay: "70ms" }}
        >
          <h2 className="text-xl font-extrabold text-foreground">פרטי חשבון</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-email"
                className="text-sm font-semibold text-muted-foreground"
              >
                כתובת אימייל
              </label>
              <input
                id="profile-email"
                value={data?.email ?? ""}
                disabled
                className="mt-1.5 w-full rounded-[10px] border border-border bg-secondary/50 px-4 py-3 text-sm font-semibold text-muted-foreground"
              />
            </div>

            <div>
              <label htmlFor="fullName" className="text-sm font-semibold text-muted-foreground">
                שם מלא
              </label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="השם המלא שלך"
                className="mt-1.5 w-full rounded-[10px] border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none transition-colors duration-150 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="examDate" className="text-sm font-semibold text-muted-foreground">
                תאריך הבחינה הקרוב
              </label>
              <input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="mt-1.5 w-full rounded-[10px] border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none transition-colors duration-150 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="targetDegree" className="text-sm font-semibold text-muted-foreground">
                תחום לימודים מבוקש
              </label>
              <input
                id="targetDegree"
                value={targetDegree}
                onChange={(e) => setTargetDegree(e.target.value)}
                placeholder="הנדסה, רפואה, מדעי המחשב…"
                className="mt-1.5 w-full rounded-[10px] border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none transition-colors duration-150 focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="inline-flex items-center gap-2 rounded-[10px] px-5 py-3 text-sm font-bold text-white shadow-md transition-transform duration-150 ease-snappy hover:scale-[1.01] active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{ background: "var(--gradient-primary)" }}
            >
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              שמור שינויים
            </button>
            <button
              onClick={changePassword}
              className="inline-flex items-center gap-2 rounded-[10px] border border-border px-5 py-3 text-sm font-bold text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <KeyRound className="h-4 w-4" />
              שינוי סיסמה
            </button>
            {saved && <span className="text-sm font-semibold text-success">השינויים נשמרו ✓</span>}
            {notice && <span className="text-sm font-semibold text-primary">{notice}</span>}
          </div>
        </section>

        {/* סטטוס מנוי */}
        <section
          className="su-rise-in mt-8 rounded-[20px] border border-border bg-card p-6"
          style={{ animationDelay: "140ms" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] ${
                  isPremium ? "text-primary-foreground" : "text-muted-foreground"
                }`}
                style={{ background: isPremium ? "var(--gradient-primary)" : "var(--secondary)" }}
              >
                {isPremium ? <Sparkles className="h-5 w-5" /> : <Target className="h-5 w-5" />}
              </span>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">סוג החשבון</p>
                <p className="mt-1 text-xl font-extrabold text-foreground">
                  {isPremium ? "מנוי פעיל — מסלול 700+" : "מסלול חינמי"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isPremium
                    ? cancelAtPeriodEnd
                      ? `המנוי בוטל ולא יחודש. תיהנה/י מהגישה המלאה ${
                          currentPeriodEnd
                            ? `עד ${new Date(currentPeriodEnd).toLocaleDateString("he-IL")}`
                            : "עד תום מחזור החיוב הנוכחי ששולם"
                        }.`
                      : "יש לך גישה מלאה לכל המאגר, לסימולציות ולניתוח AI."
                    : "גישה חלקית למאגר. שדרג כדי לפתוח את הכל."}
                </p>
              </div>
            </div>
            {!isPremium && (
              <Link
                to="/pricing"
                className="flex items-center gap-2 rounded-[10px] px-5 py-3.5 text-sm font-bold text-white shadow-md transition-transform duration-150 ease-snappy hover:scale-[1.01] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{ background: "var(--gradient-cta)" }}
              >
                <Zap className="h-4 w-4" />
                שדרג למסלול 700+ ⚡
              </Link>
            )}
            {isPremium && !cancelAtPeriodEnd && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 rounded-[10px] border border-destructive/40 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors duration-150 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                    <XCircle className="h-4 w-4" />
                    בטל מנוי
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="su-theme-v2" dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>לבטל את המנוי?</AlertDialogTitle>
                    <AlertDialogDescription>
                      המנוי לא יחודש ולא תחויב/י שוב במחזור החיוב הבא. תמשיך/י ליהנות מהגישה המלאה
                      עד תום התקופה ששולמה.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>השאר/י פעיל</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancel.mutate()}
                      disabled={cancel.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {cancel.isPending && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
                      כן, בטל את המנוי
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </section>

        {/* סיכום תרגול */}
        <section className="su-rise-in mt-8" style={{ animationDelay: "210ms" }}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-xl font-extrabold text-foreground">סיכום התרגול שלי</h2>
            <button
              onClick={() => reset.mutate()}
              disabled={reset.isPending}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-destructive/40 px-3 py-2 text-sm font-semibold text-destructive transition-colors duration-150 hover:bg-destructive/10 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <RotateCcw className="h-4 w-4" />
              איפוס סטטיסטיקה
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`rounded-[10px] border-2 px-3.5 py-2 text-sm font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  range === opt.value
                    ? "border-primary bg-accent text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {statsError ? (
            <p className="mt-4 rounded-[10px] border border-destructive bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
              לא הצלחנו לטעון את הסטטיסטיקה כרגע.
              <span dir="ltr" className="mt-1 block font-mono text-xs font-normal opacity-80">
                {statsError}
              </span>
            </p>
          ) : (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-5 rounded-[16px] border border-border bg-card p-6">
                  <AccuracyRing percent={accuracy} />
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">אחוז דיוק</p>
                    {!total && (
                      <p className="mt-1 text-xs text-muted-foreground">עדיין אין נתונים</p>
                    )}
                  </div>
                </div>
                <StatCard label="שאלות שנפתרו" value={String(total)} />
                <StatCard label="תשובות נכונות" value={String(correct)} />
              </div>

              <h3 className="mt-8 text-lg font-extrabold text-foreground">פילוח לפי נושאים</h3>
            </>
          )}
          {!statsError && data && data.byTopic.length > 0 ? (
            <div className="mt-4 space-y-3">
              {data.byTopic.map((t, i) => (
                <TopicBar
                  key={t.topic}
                  topic={t.topic}
                  correct={t.correct}
                  total={t.total}
                  delayMs={i * 60}
                />
              ))}
            </div>
          ) : !statsError ? (
            <p className="mt-3 text-sm text-muted-foreground">
              עדיין לא פתרת שאלות — התחל תרגול ונתחיל לאסוף נתונים.
            </p>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
