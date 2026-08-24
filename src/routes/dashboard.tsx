import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sigma, Flame, LogOut, Zap, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getExtSupabase } from "@/lib/extAuthClient";
import { getMyProfile, markQuickPractice } from "@/lib/profile.functions";

import { useSession } from "@/hooks/useSession";
import { PracticeSetup } from "@/components/scoreup/PracticeSetup";
import type { PracticeConfig } from "@/data/questions";
import { ContactButton } from "@/components/scoreup/ContactButton";
import { LearningAdvisorCard } from "@/components/scoreup/LearningAdvisorCard";
import { Footer } from "@/components/scoreup/Footer";

type DashboardSearch = {
  justFinished?: boolean;
  score?: number;
  total?: number;
  topic?: string | null;
};

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    justFinished: search.justFinished === true || search.justFinished === "true",
    score: Number(search.score) > 0 ? Number(search.score) : 0,
    total: Number(search.total) > 0 ? Number(search.total) : 0,
    topic: typeof search.topic === "string" && search.topic ? search.topic : null,
  }),
  head: () => ({
    meta: [
      { title: "הדשבורד שלי — ScoreUp" },
      {
        name: "description",
        content: "בנה תרגול מותאם אישית, עקוב אחרי רצף הימים והתקדם בחשיבה כמותית עם ScoreUp.",
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
  const search = Route.useSearch();

  // נלכד פעם אחת ברגע הכניסה מה-URL, ואז מנקים את הפרמטרים כדי שרענון לא יחזור על אותה תגובה.
  const [justFinished] = useState(() =>
    search.justFinished && (search.total ?? 0) > 0
      ? { score: search.score ?? 0, total: search.total ?? 0, topic: search.topic ?? null }
      : null,
  );

  useEffect(() => {
    if (search.justFinished) {
      navigate({ to: "/dashboard", search: {}, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.justFinished]);

  const { data: profile, isPending: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getMyProfile(),
    enabled: !!session,
    staleTime: 60 * 1000,
  });

  if (loading || (session && profileLoading)) {
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
    profile?.fullName ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "תלמיד";
  // שם פרטי בלבד — כדי שהפנייה תרגיש אישית
  const name = fullName.trim().split(/[\s._-]+/)[0] || fullName;
  const streak = profile?.streak ?? 0;

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
    <div className="su-theme-v2 min-h-screen bg-background text-foreground">
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

          <div className="flex items-center gap-2 md:gap-3">
            {streak > 0 && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
                style={{
                  background: "color-mix(in oklab, var(--coral) 14%, transparent)",
                  color: "var(--coral-deep)",
                }}
              >
                <Flame className="h-4 w-4" style={{ color: "var(--coral)" }} />
                {streak} ימי רצף
              </span>
            )}
            <Link
              to="/profile"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline"
            >
              פרופיל
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

      <main className="container mx-auto px-4 py-10">
        <div className="su-rise-in" style={{ animationDelay: "0ms" }}>
          <h1 className="text-4xl font-black tracking-tight text-foreground">היי {name} 👋</h1>
          <p className="mt-2 text-muted-foreground">
            בוא נתקדם היום — בנה תרגול מותאם אישית והתחל לפתור.
          </p>
        </div>
        {daysToExam !== null && (
          <p
            className="su-rise-in mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-base font-extrabold text-accent-foreground"
            style={{ animationDelay: "70ms" }}
          >
            {daysToExam > 0
              ? `עוד ${daysToExam} ימים עד הבחינה הפסיכומטרית`
              : daysToExam === 0
                ? "הבחינה הפסיכומטרית היום — בהצלחה!"
                : "תאריך הבחינה חלף — עדכן תאריך חדש בפרופיל"}
          </p>
        )}

        <div className="su-rise-in" style={{ animationDelay: "140ms" }}>
          <LearningAdvisorCard
            isPremium={isPremium}
            onStart={start}
            onUpgrade={() => navigate({ to: "/pricing" })}
            justFinished={justFinished}
          />
        </div>

        {/* Account status */}
        <div className="su-rise-in mt-8" style={{ animationDelay: "210ms" }}>
          <div
            className="rounded-[20px] border border-border bg-card p-6"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] ${
                    isPremium ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                  style={{ background: isPremium ? "var(--gradient-primary)" : "var(--secondary)" }}
                >
                  <Zap className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">סטטוס חשבון</p>
                  <p className="mt-1 text-xl font-extrabold text-foreground">
                    {isPremium ? "סטטוס: מסלול 700+" : "סטטוס: מסלול בסיסי"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isPremium
                      ? "יש לך גישה מלאה לכל המאגר, לסימולציות ולניתוח AI."
                      : "יש לך גישה חלקית למאגר. שדרג כדי לפתוח הכל."}
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
                  שדרג למסלול 700+ ללא הגבלה ⚡
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Practice engine */}
        <div className="su-rise-in mt-10" style={{ animationDelay: "280ms" }}>
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
      <Footer />
    </div>
  );
}
