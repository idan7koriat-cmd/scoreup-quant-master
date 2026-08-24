import { useState } from "react";
import { ArrowLeft, TrendingUp, Database, Timer, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { demoQuestions } from "@/data/demoQuestions";
import { DemoQuestionCard } from "./DemoQuestionCard";

const stats = [
  { icon: TrendingUp, label: "+20-40 נקודות לשיפור" },
  { icon: Database, label: "מאגר שאלות מעודכן" },
  { icon: Timer, label: "תרגול בזמן אמת" },
];

function HeroPreviewCard() {
  const q = demoQuestions[0]!;
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="su-rise-in" style={{ animationDelay: "260ms" }}>
      <div
        className="rounded-[20px] border border-border bg-card p-6 text-foreground md:p-7"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {q.topic}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            שאלה לדוגמה — בלי הרשמה
          </span>
        </div>

        <div className="pt-5">
          <DemoQuestionCard
            question={q}
            selected={selected}
            submitted={submitted}
            showSolution={showSolution}
            onSelect={setSelected}
            onCheck={() => setSubmitted(true)}
            onToggleSolution={() => setShowSolution((s) => !s)}
          />
        </div>

        {submitted && (
          <a
            href="#practice"
            className="group mt-5 flex items-center justify-center gap-2 rounded-[10px] py-4 text-base font-bold text-white shadow-md transition-transform duration-150 ease-snappy hover:scale-[1.01] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            style={{ background: "var(--gradient-cta)" }}
          >
            עוד 4 שאלות למטה — בלי הרשמה
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </a>
        )}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="su-gradient-energy" aria-hidden="true" />
      <div className="su-instrument-texture" aria-hidden="true" />

      <div className="container relative mx-auto grid gap-14 px-4 py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-32">
        <div>
          <span
            className="su-rise-in inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold backdrop-blur-xl"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.14)",
              color: "var(--petrol-tint)",
              animationDelay: "0ms",
            }}
          >
            <Zap className="h-4 w-4" />
            פלטפורמת ScoreUp — לימוד חכם מבוסס AI
          </span>

          <h1
            className="su-rise-in mt-6 text-6xl leading-[1.02] font-black tracking-tighter text-white sm:text-7xl lg:text-[5.5rem] xl:text-8xl"
            style={{ animationDelay: "70ms" }}
          >
            שפר את הציון
            <br />
            <span style={{ color: "var(--petrol-tint)" }}>בכמותי</span>
          </h1>

          <p
            className="su-rise-in mt-6 max-w-xl text-lg text-white/75 md:text-xl"
            style={{ animationDelay: "140ms" }}
          >
            למידה חכמה ותרגול ממוקד עם AI, פתרונות מפורטים שלב-אחר-שלב וניתוח ביצועים בזמן אמת.
          </p>

          <div
            className="su-rise-in mt-10 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "210ms" }}
          >
            <Link
              to="/auth"
              search={{ mode: "signup" as const }}
              className="group inline-flex items-center gap-2 rounded-[10px] px-8 py-4 text-base font-bold text-white shadow-xl transition-transform duration-150 ease-snappy hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--petrol-deep)]"
              style={{
                background: "var(--gradient-cta)",
                boxShadow: "0 16px 36px -10px color-mix(in oklab, var(--coral) 55%, transparent)",
              }}
            >
              התחל לתרגל
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Link>
            <a
              href="#practice"
              className="inline-flex items-center gap-2 rounded-[10px] border px-8 py-4 text-base font-semibold text-white backdrop-blur-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--petrol-deep)]"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderColor: "rgba(255,255,255,0.14)",
              }}
            >
              נסה 5 שאלות חינם
            </a>
          </div>

          <div
            className="su-rise-in mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3"
            style={{ animationDelay: "280ms" }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-center gap-3 rounded-[16px] border px-5 py-4 backdrop-blur-xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <s.icon className="h-5 w-5" style={{ color: "var(--petrol-tint)" }} />
                <span className="text-sm font-semibold text-white/90">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <HeroPreviewCard />
      </div>
    </section>
  );
}
