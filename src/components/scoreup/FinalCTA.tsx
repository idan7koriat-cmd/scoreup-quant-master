import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 text-white">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div
        className="pointer-events-none absolute -top-32 start-1/3 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--cyan)" }}
      />
      <div className="container relative mx-auto px-4 text-center">
        <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight md:text-5xl">
          מוכן להעלות את הציון{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-text)" }}
          >
            בחלק הכמותי?
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
          הצטרף עכשיו וקבל גישה למאגר השאלות המלא, פתרונות מפורטים וניתוח ביצועים
          ב-AI שמכוון אותך בדיוק לאן שצריך.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/auth"
            className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-slate-950 shadow-xl transition-transform hover:scale-[1.03]"
            style={{ background: "var(--gradient-cta)" }}
          >
            הירשם עכשיו
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </Link>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300">
            <ShieldCheck className="h-4 w-4" />
            {"\n"}
          </span>
        </div>
      </div>
    </section>
  );
}
