import { ArrowLeft, TrendingUp, Database, Timer, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";

const stats = [
  { icon: TrendingUp, label: "+20-40 נקודות לשיפור" },
  { icon: Database, label: "מאגר שאלות מעודכן" },
  { icon: Timer, label: "תרגול בזמן אמת" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

      <div className="container relative mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold backdrop-blur-xl"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.14)",
              color: "var(--petrol-tint)",
            }}
          >
            <Zap className="h-4 w-4" />
            פלטפורמת ScoreUp — לימוד חכם מבוסס AI
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl">
            ScoreUp — שפר את הציון בחלק
            <br />
            <span style={{ color: "var(--petrol-tint)" }}>הכמותי בפסיכומטרי</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/75 md:text-xl">
            למידה חכמה ותרגול ממוקד עם AI, פתרונות מפורטים שלב-אחר-שלב וניתוח ביצועים בזמן אמת.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/auth"
              search={{ mode: "signup" as const }}
              className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white shadow-xl transition-transform duration-150 ease-snappy hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--petrol-deep)]"
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
              className="inline-flex items-center gap-2 rounded-full border px-8 py-4 text-base font-semibold text-white backdrop-blur-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--petrol-deep)]"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderColor: "rgba(255,255,255,0.14)",
              }}
            >
              נסה 5 שאלות חינם
            </a>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
      </div>
    </section>
  );
}
