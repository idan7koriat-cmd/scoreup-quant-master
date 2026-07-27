import { ArrowLeft, TrendingUp, Database, Timer, Zap } from "lucide-react";

const stats = [
  { icon: TrendingUp, label: "+20-40 נקודות לשיפור" },
  { icon: Database, label: "מאגר שאלות מעודכן" },
  { icon: Timer, label: "תרגול בזמן אמת" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden text-white">
      {/* Base slate-navy */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      {/* Tech mesh grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "var(--mesh-grid)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      {/* Glow blobs */}
      <div
        className="pointer-events-none absolute -top-40 -end-40 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--cyan)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -start-40 h-[520px] w-[520px] rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--emerald)" }}
      />

      <div className="container relative mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold backdrop-blur-xl"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.14)",
              color: "var(--cyan)",
            }}
          >
            <Zap className="h-4 w-4" />
            פלטפורמת ScoreUp — לימוד חכם מבוסס AI
          </span>

          <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-white md:text-6xl">
            ScoreUp — שפר את הציון בחלק
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-text)" }}
            >
              הכמותי בפסיכומטרי
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
            למידה חכמה ותרגול ממוקד עם AI, פתרונות מפורטים שלב-אחר-שלב וניתוח
            ביצועים בזמן אמת.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#practice"
              className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-slate-950 shadow-xl transition-all hover:scale-[1.03]"
              style={{
                background: "var(--gradient-cta)",
                boxShadow: "0 20px 50px -12px oklch(0.72 0.17 60 / 0.5)",
              }}
            >
              התחל לתרגל חינם
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </a>
            <a
              href="#why"
              className="inline-flex items-center gap-2 rounded-full border px-8 py-4 text-base font-semibold text-white backdrop-blur-xl transition-colors"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderColor: "rgba(255,255,255,0.14)",
              }}
            >
              למה ScoreUp?
            </a>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="flex items-center justify-center gap-3 rounded-2xl border px-5 py-4 backdrop-blur-xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <s.icon
                  className="h-5 w-5"
                  style={{
                    color: i % 2 === 0 ? "var(--cyan)" : "var(--emerald)",
                  }}
                />
                <span className="text-sm font-semibold text-slate-100">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
