import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Sigma,
  Flame,
  LogOut,
  Zap,
  
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getExtSupabase } from "@/lib/extAuthClient";
import { getMyProfile, markQuickPractice } from "@/lib/profile.functions";

import { useSession } from "@/hooks/useSession";
import { PracticeSetup } from "@/components/scoreup/PracticeSetup";
import type { PracticeConfig } from "@/data/questions";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "הדשבורד שלי — ScoreUp" },
      {
        name: "description",
        content:
          "בנה תרגול מותאם אישית, עקוב אחרי רצף הימים והתקדם בחשיבה כמותית עם ScoreUp.",
      },
      { property: "og:title", content: "הדשבורד שלי — ScoreUp" },
      {
        property: "og:description",
        content: "תרגול מותאם אישית וניתוח התקדמות בחשיבה כמותית.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getMyProfile(),
    enabled: !!session,
    staleTime: 60 * 1000,
  });

  if (loading) {
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

  const user = session.user;
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "תלמיד";
  // שם פרטי בלבד — כדי שהפנייה תרגיש אישית
  const name = fullName.trim().split(/[\s._-]+/)[0] || fullName;
  const streak = 1;

  const examDate = profile?.examDate ?? null;
  const daysToExam = examDate
    ? Math.ceil(
        (new Date(`${examDate}T00:00:00`).getTime() -
          new Date(new Date().toDateString()).getTime()) /
          86400000,
      )
    : null;

  const isPremium = profile?.isPremium ?? false;
  const today = new Date().toISOString().slice(0, 10);
  const quickLocked = !isPremium && profile?.lastQuickPractice === today;

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await (await getExtSupabase()).auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const start = async (config: PracticeConfig) => {
    if (config.quick && !isPremium) {
      await markQuickPractice();
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
    navigate({
      to: "/practice",
      search: {
        mode: config.launch ?? "custom",
        topics: config.topics,
        count: config.count,
        level: config.difficultyLevel ?? 0,
        seconds: config.totalSeconds ?? 0,
        style: config.mode,
      },
    });
  };





  return (
    <div className="min-h-screen bg-background">
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

          <div className="flex items-center gap-2 md:gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-bold text-accent-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              {streak} ימי רצף
            </span>
            <Link
              to="/profile"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary sm:inline"
            >
              פרופיל
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

      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          היי {name} 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          בוא נתקדם היום — בנה תרגול מותאם אישית והתחל לפתור.
        </p>
        {daysToExam !== null && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">
            {daysToExam > 0
              ? `עוד ${daysToExam} ימים עד הבחינה הפסיכומטרית`
              : daysToExam === 0
                ? "הבחינה הפסיכומטרית היום — בהצלחה!"
                : "תאריך הבחינה חלף — עדכן תאריך חדש בפרופיל"}
          </p>
        )}

        {/* Account status */}
        <div className="mt-8">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  סטטוס חשבון
                </p>
                <p className="mt-1 text-xl font-extrabold text-foreground">
                  {isPremium ? "סטטוס: מסלול 700+" : "סטטוס: מסלול בסיסי"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isPremium
                    ? "יש לך גישה מלאה לכל המאגר, לסימולציות ולניתוח AI."
                    : "יש לך גישה חלקית למאגר. שדרג כדי לפתוח הכל."}
                </p>
              </div>
              {!isPremium && (
                <Link
                  to="/pricing"
                  className="flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.03]"
                  style={{ background: "var(--gradient-cta)" }}
                >
                  <Zap className="h-4 w-4" />
                  שדרג למסלול 700+ ללא הגבלה ⚡
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Practice engine */}
        <div className="mt-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            בניה עצמית — תרגול מותאם אישית
          </h2>
          <p className="mt-2 text-muted-foreground">
            בחר נושאים, כמות שאלות, רמת קושי וטיימר — ותתחיל לפתור.
          </p>
          <PracticeSetup
            onStart={start}
            isPremium={isPremium}
            quickLocked={quickLocked}
            onUpgrade={() => navigate({ to: "/pricing" })}
          />
        </div>

      </main>
    </div>
  );
}
