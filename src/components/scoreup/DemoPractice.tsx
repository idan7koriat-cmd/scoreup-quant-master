import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, Lock, RotateCcw, FileCheck2, Gauge, BookOpenCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { demoQuestions } from "@/data/demoQuestions";
import { useInView } from "@/hooks/useInView";
import { DemoQuestionCard } from "./DemoQuestionCard";

const benefits = [
  { icon: FileCheck2, label: "5 שאלות אמיתיות, בלי הרשמה" },
  { icon: Gauge, label: "משוב מיידי אחרי כל תשובה" },
  { icon: BookOpenCheck, label: "פתרון מלא שלב-אחר-שלב" },
];

export function DemoPractice() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const { ref: revealRef, inView: revealInView } = useInView<HTMLDivElement>();

  const total = demoQuestions.length;
  const q = demoQuestions[index]!;
  const selected = answers[index] ?? null;
  const submitted = !!checked[index];
  const score = demoQuestions.reduce(
    (acc, item, i) => acc + (answers[i] === item.correctIndex ? 1 : 0),
    0,
  );

  const goTo = (i: number) => {
    setIndex(i);
    setShowSolution(false);
  };

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <section id="practice" className="bg-background py-24">
      <div
        ref={revealRef}
        className={`container mx-auto px-4 ${revealInView ? "su-rise-in" : "opacity-0"}`}
      >
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              5 שאלות לדוגמה — ללא הרשמה
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              פתור, קבל משוב מיידי וראה פתרון מלא שלב-אחר-שלב — בדיוק כמו בתרגול המלא.
            </p>

            <ul className="mt-8 space-y-4">
              {benefits.map((b) => (
                <li key={b.label} className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <b.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">{b.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="overflow-hidden rounded-[20px] border border-border bg-card"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/60 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {q.topic}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  שאלה {index + 1} מתוך {total}
                </span>
              </div>
              <div className="flex gap-2">
                {demoQuestions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-9 w-9 rounded-[8px] border-2 text-sm font-bold transition-[border-color,background-color,color] duration-150 ${focusRing} ${
                      i === index
                        ? "border-primary bg-primary text-primary-foreground"
                        : answers[i] != null
                          ? "border-success bg-success/15 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8">
              <DemoQuestionCard
                question={q}
                selected={selected}
                submitted={submitted}
                showSolution={showSolution}
                onSelect={(i) => setAnswers((prev) => ({ ...prev, [index]: i }))}
                onCheck={() => setChecked((prev) => ({ ...prev, [index]: true }))}
                onToggleSolution={() => setShowSolution((s) => !s)}
              />

              <div className="mt-6">
                {index < total - 1 ? (
                  <button
                    onClick={() => goTo(index + 1)}
                    className={`flex w-full items-center justify-center gap-2 rounded-[10px] py-4 text-base font-bold text-primary-foreground shadow-md transition-transform duration-150 ease-snappy hover:scale-[1.01] active:scale-[0.97] ${focusRing}`}
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    השאלה הבאה
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setPaywall(true)}
                    className={`flex w-full items-center justify-center gap-2 rounded-[10px] py-4 text-base font-bold text-white shadow-md transition-transform duration-150 ease-snappy hover:scale-[1.01] active:scale-[0.97] ${focusRing}`}
                    style={{ background: "var(--gradient-cta)" }}
                  >
                    המשך
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {paywall && (
        <DialogPrimitive.Root open onOpenChange={(next) => !next && setPaywall(false)}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="su-theme-v2 fixed inset-0 z-50 bg-background/85 p-4 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <DialogPrimitive.Content
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="su-theme-v2 fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-border bg-card p-8 text-center"
              style={{ boxShadow: "var(--shadow-elegant)" }}
            >
              <span
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-[16px] text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Lock className="h-7 w-7" />
              </span>
              <DialogPrimitive.Title asChild>
                <h3 className="mt-5 text-2xl font-extrabold text-foreground">אהבת את התרגול?</h3>
              </DialogPrimitive.Title>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                הירשם עכשיו לקבלת גישה למאגר השאלות המלא ולניתוח ביצועים ב-AI!
              </p>
              <p className="mt-4 text-sm font-semibold text-foreground">
                בתרגול החינם ענית נכון על {score} מתוך {total} שאלות
              </p>
              <Link
                to="/auth"
                search={{ mode: "signup" as const }}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] py-4 text-base font-bold text-white shadow-md transition-transform duration-150 ease-snappy hover:scale-[1.01] active:scale-[0.97] ${focusRing}`}
                style={{ background: "var(--gradient-cta)" }}
              >
                הירשם עכשיו
              </Link>
              <button
                onClick={() => {
                  setPaywall(false);
                  setAnswers({});
                  setChecked({});
                  goTo(0);
                }}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-border bg-card py-3 font-semibold text-foreground transition-colors duration-150 hover:bg-secondary ${focusRing}`}
              >
                <RotateCcw className="h-4 w-4" />
                התחל את התרגול מחדש
              </button>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </section>
  );
}
