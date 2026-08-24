import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Sigma, Loader2 } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { PracticeSession } from "@/components/scoreup/PracticeSession";
import type { PracticeConfig, PracticeMode, LauncherMode } from "@/data/questions";
import { ContactButton } from "@/components/scoreup/ContactButton";

type PracticeSearch = {
  mode: LauncherMode;
  topics: string[];
  count: number;
  level: number;
  seconds: number;
  style: PracticeMode;
};

export const Route = createFileRoute("/practice")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): PracticeSearch => ({
    mode: search.mode === "warmup" || search.mode === "simulation" ? search.mode : "custom",
    topics: Array.isArray(search.topics) ? (search.topics as string[]) : [],
    count: Number(search.count) > 0 ? Number(search.count) : 10,
    level: Number(search.level) > 0 ? Number(search.level) : 0,
    seconds: Number(search.seconds) > 0 ? Number(search.seconds) : 0,
    style: search.style === "exam" ? "exam" : "study",
  }),

  head: () => ({
    meta: [
      { title: "תרגול חשיבה כמותית — ScoreUp" },
      {
        name: "description",
        content:
          "פתור שאלות בחשיבה כמותית עם משוב מיידי, פתרונות מפורטים וניהול זמן כמו במבחן האמיתי.",
      },
      { property: "og:title", content: "תרגול חשיבה כמותית — ScoreUp" },
      {
        property: "og:description",
        content: "שאלות פסיכומטרי כמותי עם משוב מיידי ופתרון שלב-אחר-שלב.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const search = Route.useSearch();
  const { session, loading } = useSession();
  const navigate = useNavigate();

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

  const config: PracticeConfig =
    search.mode === "warmup"
      ? {
          launch: "warmup",
          topics: [],
          count: 3,
          difficultyLevel: null,
          totalSeconds: null,
          mode: "study",
          quick: true,
        }
      : search.mode === "simulation"
        ? {
            launch: "simulation",
            topics: [],
            count: 20,
            difficultyLevel: null,
            totalSeconds: 20 * 60,
            mode: "exam",
            simulation: true,
          }
        : {
            launch: "custom",
            topics: search.topics,
            count: search.count,
            difficultyLevel: search.level > 0 ? search.level : null,
            totalSeconds: search.seconds > 0 ? search.seconds : null,
            mode: search.style,
          };

  return (
    <div className="su-theme-v2 min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2.5">
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
              to="/pricing"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline"
            >
              תכניות ומנויים
            </Link>
            <ContactButton className="hidden rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline">
              צור קשר
            </ContactButton>
            <Link
              to="/dashboard"
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              חזרה לדשבורד
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-16">
        <PracticeSession
          config={config}
          onExit={(result) =>
            navigate({
              to: "/dashboard",
              search: result
                ? {
                    justFinished: true,
                    score: result.score,
                    total: result.total,
                    topic: result.topic,
                  }
                : undefined,
            })
          }
        />
      </main>
    </div>
  );
}
