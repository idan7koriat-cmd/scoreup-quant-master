import { useState } from "react";
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

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <button
          onClick={onClose}
          aria-label="סגור"
          className="absolute end-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <span
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sparkles className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-2xl font-extrabold text-foreground">
          פתיחת גישה מלאה
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          כל מאגר השאלות, סימולציות פרק מלאות, פתרונות AI מותאמים אישית וניתוח
          ביצועים מתקדם — במסלול 150 עגול.
        </p>
        <ul className="mt-5 space-y-2 text-start text-sm font-semibold text-foreground">
          {[
            "מאגר שאלות מלא ומעודכן",
            "סימולציות פרק ללא הגבלה",
            "מורה AI שמסביר כל טעות",
            "מעקב התקדמות ונקודות תורפה",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              {t}
            </li>
          ))}
        </ul>
        <button
          className="mt-6 w-full rounded-2xl py-4 text-base font-bold text-slate-950 shadow-md transition-transform hover:scale-[1.01]"
          style={{ background: "var(--gradient-cta)" }}
        >
          שדרג עכשיו למסלול 150 עגול
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          הסליקה תיפתח בקרוב — נעדכן אותך במייל.
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [upgrade, setUpgrade] = useState(false);

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
        topics: config.topics,
        count: config.count,
        level: config.difficultyLevel ?? 0,
        seconds: config.totalSeconds ?? 0,
        mode: config.mode,
        sim: config.simulation ? 1 : 0,
      },
    });
  };





  return (
    <div className="min-h-screen bg-background">
      {upgrade && <UpgradeModal onClose={() => setUpgrade(false)} />}

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
            <span className="hidden text-sm font-semibold text-foreground sm:inline">
              {name}
            </span>
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

        {/* Account status */}
        <div className="mt-8">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  סטטוס חשבון
                </p>
                <p className="mt-1 text-xl font-extrabold text-foreground">
                  {isPremium ? "סטטוס: מסלול 150 עגול" : "סטטוס: מסלול בסיסי"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isPremium
                    ? "יש לך גישה מלאה לכל המאגר, לסימולציות ולניתוח AI."
                    : "יש לך גישה חלקית למאגר. שדרג כדי לפתוח הכל."}
                </p>
              </div>
              {!isPremium && (
                <button
                  onClick={() => setUpgrade(true)}
                  className="flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-950 shadow-md transition-transform hover:scale-[1.03]"
                  style={{ background: "var(--gradient-cta)" }}
                >
                  <Zap className="h-4 w-4" />
                  שדרג למסלול 150 עגול ללא הגבלה ⚡
                </button>
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
            onUpgrade={() => setUpgrade(true)}
          />
        </div>

      </main>
    </div>
  );
}
