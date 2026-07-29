import { useEffect, useMemo, useState } from "react";
import { InlineMath, BlockMath } from "react-katex";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { getQuestions } from "@/lib/questions.functions";

const QUESTION_SECONDS = 60;

function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section id="practice" className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
            <Sparkles className="h-4 w-4" />
            מנוע התרגול
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            נסה שאלה אמיתית — עכשיו
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            שאלה אמריקאית, טיימר של דקה, ופתרון מלא ברגע שסיימת.
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}

export function PracticeEngine() {
  const {
    data: questions,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: () => getQuestions(),
  });

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [showSolution, setShowSolution] = useState(false);

  const total = questions?.length ?? 0;
  const q = questions?.[index];


  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      setSubmitted(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted]);

  const reset = (newIndex: number) => {
    setIndex(newIndex);
    setSelected(null);
    setSubmitted(false);
    setTimeLeft(QUESTION_SECONDS);
    setShowSolution(false);
  };

  const next = () => reset((index + 1) % total);
  const restart = () => reset(0);

  const pick = (i: number) => {
    if (submitted) return;
    setSelected(i);
  };

  const submit = () => {
    if (selected === null || submitted) return;
    setSubmitted(true);
  };

  const optionClass = (i: number) => {
    const base =
      "w-full text-start rounded-2xl border-2 px-5 py-4 font-medium transition-all";
    if (!submitted) {
      return `${base} ${
        selected === i
          ? "border-primary bg-accent text-foreground shadow-md"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent/40"
      }`;
    }
    if (i === q?.correctIndex) {
      return `${base} border-success bg-success/10 text-foreground`;
    }
    if (i === selected) {
      return `${base} border-destructive bg-destructive/10 text-foreground`;
    }
    return `${base} border-border bg-card opacity-60`;
  };

  const timerPct = useMemo(
    () => Math.max(0, (timeLeft / QUESTION_SECONDS) * 100),
    [timeLeft]
  );
  const isCorrect = submitted && selected === q?.correctIndex;

  if (isPending) {
    return (
      <SectionShell>
        <div
          className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-card px-6 py-20"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">טוען שאלות מהמאגר…</p>
        </div>
      </SectionShell>
    );
  }

  if (isError || !q) {
    return (
      <SectionShell>
        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-border bg-card px-6 py-16 text-center">
          <p className="font-semibold text-foreground">
            לא הצלחנו לטעון את השאלות כרגע.
          </p>
          <p className="mt-2 text-muted-foreground">נסה לרענן את העמוד.</p>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell>
        <div
          className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-border bg-card"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {q.topic}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                שאלה {index + 1} מתוך {total}
              </span>
            </div>
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ${
                timeLeft <= 10 && !submitted
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Clock className="h-4 w-4" />
              0:{timeLeft.toString().padStart(2, "0")}
            </div>
          </div>

          {/* Timer bar */}
          <div className="h-1.5 w-full bg-border">
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{
                width: `${timerPct}%`,
                background:
                  timeLeft <= 10 && !submitted
                    ? "var(--destructive)"
                    : "var(--gradient-primary)",
              }}
            />
          </div>

          {/* Body */}
          <div className="p-6 md:p-8">
            <p className="text-lg leading-relaxed text-foreground">
              {q.prompt}
            </p>
            {q.latex && (
              <div className="mt-5 overflow-x-auto rounded-2xl bg-secondary/60 px-5 py-6 text-center text-xl">
                <BlockMath math={q.latex} />
              </div>
            )}

            <div className="mt-6 grid gap-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={submitted}
                  className={optionClass(i)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
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
                        String.fromCharCode(0x05d0 + i) /* א ב ג ד */
                      )}
                    </span>
                    <span className="flex-1 text-base">{opt}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Feedback / Actions */}
            <div className="mt-6">
              {!submitted ? (
                <button
                  onClick={submit}
                  disabled={selected === null}
                  className="w-full rounded-2xl py-4 text-base font-bold text-primary-foreground shadow-md transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  בדוק תשובה
                </button>
              ) : (
                <div className="space-y-4">
                  <div
                    className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-4 ${
                      isCorrect
                        ? "border-success bg-success/10 text-success"
                        : "border-destructive bg-destructive/10 text-destructive"
                    }`}
                  >
                    {isCorrect ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <X className="h-5 w-5" />
                    )}
                    <span className="font-bold">
                      {isCorrect
                        ? "כל הכבוד! תשובה נכונה."
                        : selected === null
                        ? "הזמן נגמר. בוא נראה את הפתרון."
                        : "תשובה שגויה. בוא נבין למה."}
                    </span>
                  </div>

                  {/* Solution accordion */}
                  <button
                    onClick={() => setShowSolution((s) => !s)}
                    className="flex w-full items-center justify-between rounded-2xl border border-border bg-secondary/50 px-5 py-4 text-start font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    <span>פתרון מפורט</span>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        showSolution ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {showSolution && (
                    <div className="rounded-2xl border border-border bg-background p-5">
                      <ol className="space-y-4">
                        {q.solutionSteps.map((step, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {i + 1}
                            </span>
                            <div className="flex-1 text-foreground">
                              {step.text && (
                                <p className="leading-relaxed">{step.text}</p>
                              )}
                              {step.math && (
                                <div className="mt-2 overflow-x-auto rounded-xl bg-secondary/60 px-4 py-3 text-lg">
                                  <InlineMath math={step.math} />
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={next}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-primary-foreground shadow-md transition-all hover:scale-[1.01]"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      השאלה הבאה
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={restart}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
                    >
                      <RotateCcw className="h-4 w-4" />
                      התחל מחדש
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </SectionShell>

  );
}
