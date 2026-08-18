import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, X, ChevronDown, ChevronLeft, Sparkles, Lock, RotateCcw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { demoQuestions } from "@/data/demoQuestions";
import { MathText } from "./MathText";
import { QuestionDiagram } from "./QuestionDiagram";

export function DemoPractice() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [paywall, setPaywall] = useState(false);

  const total = demoQuestions.length;
  const q = demoQuestions[index]!;
  const selected = answers[index] ?? null;
  const submitted = !!checked[index];
  const isCorrect = submitted && selected === q.correctIndex;
  const score = demoQuestions.reduce(
    (acc, item, i) => acc + (answers[i] === item.correctIndex ? 1 : 0),
    0,
  );

  const goTo = (i: number) => {
    setIndex(i);
    setShowSolution(false);
  };

  const optionClass = (i: number) => {
    const base =
      "w-full text-start rounded-[10px] border-2 px-5 py-4 font-medium transition-[border-color,background-color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
    if (!submitted) {
      return `${base} ${
        selected === i
          ? "border-primary bg-accent text-foreground shadow-md"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent/40"
      }`;
    }
    if (i === q.correctIndex) return `${base} border-success bg-success/10 text-foreground`;
    if (i === selected) return `${base} border-destructive bg-destructive/10 text-foreground`;
    return `${base} border-border bg-card opacity-55`;
  };

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <section id="practice" className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
            <Sparkles className="h-4 w-4" />
            טעימה חינם
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            5 שאלות לדוגמה — ללא הרשמה
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            פתור, קבל משוב מיידי וראה פתרון מלא שלב-אחר-שלב.
          </p>
        </div>

        <div
          className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-[20px] border border-border bg-card"
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
            {q.svgCode && <QuestionDiagram svg={q.svgCode} />}

            <p className="text-lg leading-relaxed text-foreground">
              <MathText>{q.question}</MathText>
            </p>

            <div className="mt-6 grid gap-3">
              {q.answers.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [index]: i }))}
                  disabled={submitted}
                  className={optionClass(i)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-[border-color,background-color,color] duration-150 ${
                        submitted && i === q.correctIndex
                          ? "border-success bg-success text-success-foreground"
                          : submitted && i === selected
                            ? "border-destructive bg-destructive text-destructive-foreground"
                            : selected === i
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {submitted && i === q.correctIndex ? (
                        <Check className="h-4 w-4" />
                      ) : submitted && i === selected ? (
                        <X className="h-4 w-4" />
                      ) : (
                        String.fromCharCode(0x05d0 + i)
                      )}
                    </span>
                    <span className="flex-1 text-base">
                      <MathText>{opt}</MathText>
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              {!submitted ? (
                <button
                  onClick={() =>
                    selected !== null && setChecked((prev) => ({ ...prev, [index]: true }))
                  }
                  disabled={selected === null}
                  className={`w-full rounded-[10px] py-4 text-base font-bold text-primary-foreground shadow-md transition-transform duration-150 ease-snappy hover:scale-[1.01] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${focusRing}`}
                  style={{ background: "var(--gradient-primary)" }}
                >
                  בדוק תשובה
                </button>
              ) : (
                <div className="space-y-4">
                  <div
                    key={isCorrect ? "correct" : "wrong"}
                    className={`flex items-center gap-3 rounded-[10px] border-2 px-5 py-4 opacity-0 transition-[opacity,transform] duration-200 ease-out [animation:su-feedback-in_200ms_ease-out_forwards] ${
                      isCorrect
                        ? "border-success bg-success/10 text-success"
                        : "border-destructive bg-destructive/10 text-destructive"
                    }`}
                  >
                    {isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    <span className="font-bold">
                      {isCorrect ? "כל הכבוד! תשובה נכונה." : "תשובה שגויה. בוא נבין למה."}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowSolution((s) => !s)}
                    className={`flex w-full items-center justify-between rounded-[10px] border border-border bg-secondary/50 px-5 py-4 text-start font-semibold text-foreground transition-colors duration-150 hover:bg-secondary ${focusRing}`}
                  >
                    <span>פתרון מפורט</span>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-200 ease-out ${showSolution ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showSolution && (
                    <div className="space-y-4 rounded-[10px] border border-border bg-background p-5 opacity-0 [animation:su-feedback-in_200ms_ease-out_forwards]">
                      {q.explanation
                        .split(/\n{2,}/)
                        .map((p) => p.trim())
                        .filter(Boolean)
                        .map((p, i) => (
                          <p key={i} className="leading-relaxed text-foreground">
                            <MathText>{p}</MathText>
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

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
