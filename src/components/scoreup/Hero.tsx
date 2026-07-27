import { ArrowLeft, Sparkles, TrendingUp, Database, Timer } from "lucide-react";

const stats = [
  { icon: TrendingUp, label: "+20-40 נקודות לשיפור" },
  { icon: Database, label: "מאגר שאלות מעודכן" },
  { icon: Timer, label: "תרגול בזמן אמת" },
];

export function Hero() {
  return (
    <section
      className="relative overflow-hidden text-primary-foreground"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* decorative blobs */}
      <div
        className="pointer-events-none absolute -top-32 -end-32 h-96 w-96 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--primary-glow)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -start-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "oklch(0.7 0.2 320)" }}
      />

      <div className="container relative mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <Sparkles className="h-4 w-4" />
            פלטפורמת ScoreUp — לימוד חכם מבוסס AI
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            ScoreUp — שפר את הציון בחלק
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, oklch(0.85 0.18 145), oklch(0.9 0.15 100))",
              }}
            >
              הכמותי בפסיכומטרי
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85 md:text-xl">
            למידה חכמה ותרגול ממוקד עם AI, פתרונות מפורטים שלב-אחר-שלב וניתוח
            ביצועים בזמן אמת.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#practice"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-primary shadow-xl transition-all hover:scale-[1.03] hover:shadow-2xl"
            >
              התחל לתרגל חינם
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </a>
            <a
              href="#why"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              למה ScoreUp?
            </a>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur"
              >
                <s.icon className="h-5 w-5 text-white/90" />
                <span className="text-sm font-semibold">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
