import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useInView } from "@/hooks/useInView";

export function FinalCTA() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="relative overflow-hidden py-24 text-white">
      <div className="su-gradient-energy" aria-hidden="true" />
      <div className="su-instrument-texture" aria-hidden="true" />
      <div
        ref={ref}
        className={`container relative mx-auto px-4 text-center ${inView ? "su-rise-in" : "opacity-0"}`}
      >
        <h2 className="mx-auto max-w-3xl text-4xl leading-tight font-black tracking-tight md:text-6xl">
          מוכן להעלות את הציון <span style={{ color: "var(--petrol-tint)" }}>בחלק הכמותי?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
          הצטרף עכשיו וקבל גישה למאגר השאלות המלא, פתרונות מפורטים וניתוח ביצועים ב-AI שמכוון אותך
          בדיוק לאן שצריך.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/auth"
            search={{ mode: "signup" as const }}
            className="group inline-flex items-center gap-2 rounded-[10px] px-8 py-4 text-base font-bold text-white shadow-xl transition-transform duration-150 ease-snappy hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--petrol-deep)]"
            style={{
              background: "var(--gradient-cta)",
              boxShadow: "0 16px 36px -10px color-mix(in oklab, var(--coral) 55%, transparent)",
            }}
          >
            הירשם עכשיו
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </Link>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/75">
            <ShieldCheck className="h-4 w-4" />
            התחלה חינמית — ללא כרטיס אשראי
          </span>
        </div>
      </div>
    </section>
  );
}
