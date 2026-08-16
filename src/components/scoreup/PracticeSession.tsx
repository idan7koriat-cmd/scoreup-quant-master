import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  Flag,
  Megaphone,
  Lock,
} from "lucide-react";
import { getQuestions, checkAnswers } from "@/lib/questions.functions";
import { recordSolvedQuestion, reportQuestion } from "@/lib/profile.functions";
import { toast } from "sonner";
import type { AnswerReveal, PracticeConfig } from "@/data/questions";
import { MathText } from "./MathText";
import { QuestionDiagram } from "./QuestionDiagram";
import { Textarea } from "@/components/ui/textarea";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}


const REPORT_REASONS = [
  "יש טעות תחבירית / טעות במבנה השאלה",
  "אין תשובה נכונה / התשובה המוצגת אינה נכונה",
  "דירוג הקושי לא מתאים",
];

function ReportModal({
  questionId,
  onClose,
}: {
  questionId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState(REPORT_REASONS[0]!);
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    try {
      await reportQuestion({ data: { questionId, reason, details } });
      toast.success("תודה! הדיווח התקבל ונבדוק אותו במידי");
      onClose();
    } catch {
      toast.error("לא הצלחנו לשלוח את הדיווח כרגע, נסה שוב");
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-3xl p-7">
        <h3 className="text-xl font-extrabold text-foreground">השאלה בעייתית כי:</h3>
        <div className="mt-5 space-y-3">
          {REPORT_REASONS.map((r) => (
            <label
              key={r}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 text-sm font-semibold transition-colors ${
                reason === r
                  ? "border-primary bg-accent text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              <input
                type="radio"
                name="report-reason"
                className="mt-1 accent-[var(--primary)]"
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              {r}
            </label>
          ))}
        </div>
        <div className="mt-5">
          <label htmlFor="report-details" className="mb-2 block text-sm font-semibold text-foreground">
            פרטים נוספים (לא חובה)
          </label>
          <Textarea
            id="report-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="ספר לנו עוד על הבעיה..."
            className="min-h-[90px] resize-none"
          />
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-bold text-foreground hover:bg-secondary"
          >
            ביטול
          </button>
          <button
            onClick={submit}
            disabled={sending}
            className="flex-1 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] disabled:opacity-60"
            style={{ background: "var(--gradient-cta)" }}
          >
            {sending ? "שולח…" : "שלח דיווח"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PracticeSession({
  config,
  onExit,
}: {
  config: PracticeConfig;
  onExit: () => void;
}) {
  const {
    data: questions,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["questions", config],
    queryFn: async () => {
      return getQuestions({
        data: {
          topics: config.topics,
          count: config.count,
          difficultyLevel: config.difficultyLevel,
          examMode: config.simulation ?? false,
        },
      });
    },
    staleTime: Infinity,
  });

  const total = questions?.length ?? 0;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [reveals, setReveals] = useState<Record<number, AnswerReveal>>({});
  const [revealing, setRevealing] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [finished, setFinished] = useState(false);
  const [summaryReady, setSummaryReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.totalSeconds ?? 0);
  const [elapsed, setElapsed] = useState(0);
  const [sent] = useState<Set<string>>(() => new Set());
  const [reportOpen, setReportOpen] = useState(false);

  const record = (qid: string, isCorrect: boolean) => {
    if (sent.has(qid)) return;
    sent.add(qid);
    void recordSolvedQuestion({ data: { questionId: qid, isCorrect } }).catch(() => {
      sent.delete(qid);
      toast.error("לא הצלחנו לשמור את ההתקדמות בשאלה הזו");
    });
  };

  /**
   * הדרך היחידה לגלות אם תשובה נכונה: קריאה לשרת (checkAnswers), שגם אוכפת את המכסה היומית
   * למשתמש חינמי. מדלגת על שאלות שכבר נחשפו, כדי לא לבזבז מכסה פעמיים על אותה שאלה.
   */
  const reveal = async (indices: number[]) => {
    if (!questions) return;
    const need = indices.filter((i) => !reveals[i] && questions[i]);
    if (need.length === 0) return;

    setRevealing(true);
    try {
      const res = await checkAnswers({
        data: {
          items: need.map((i) => ({
            questionId: questions[i]!.id,
            selectedIndex: answers[i] ?? -1,
          })),
        },
      });

      if (!res.ok) {
        setLimitReached(true);
        toast.error("הגעת למכסת השאלות החינמית להיום — שדרג למסלול 700+ לגישה ללא הגבלה");
        return;
      }

      setReveals((prev) => {
        const next = { ...prev };
        need.forEach((i, k) => {
          const r = res.results[k]!;
          next[i] = { isCorrect: r.isCorrect, correctIndex: r.correctIndex, explanation: r.explanation };
        });
        return next;
      });

      need.forEach((i, k) => {
        const a = answers[i];
        if (a != null) record(questions[i]!.id, res.results[k]!.isCorrect);
      });
    } catch {
      toast.error("לא הצלחנו לבדוק את התשובה כרגע, נסה שוב");
    } finally {
      setRevealing(false);
    }
  };

  /** Reveal the current answer (if any) before leaving the question. */
  const goTo = (i: number) => {
    if (answers[index] != null) void reveal([index]);
    setIndex(i);
  };

  useEffect(() => {
    if (config.totalSeconds != null || finished) return;
    const t = setTimeout(() => setElapsed((s) => s + 1), 1000);
    return () => clearTimeout(t);
  }, [elapsed, finished, config.totalSeconds]);

  useEffect(() => {
    if (!finished || summaryReady || !questions) return;
    void reveal(questions.map((_, i) => i)).finally(() => setSummaryReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, questions]);

  const q = questions?.[index];
  const selected = answers[index] ?? null;
  const submitted = config.mode === "study" ? reveals[index] != null : false;

  useEffect(() => {
    if (config.totalSeconds == null || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, finished, config.totalSeconds]);

  useEffect(() => setShowSolution(false), [index]);

  const score = useMemo(() => {
    if (!questions) return 0;
    return questions.reduce((acc, _item, i) => acc + (reveals[i]?.isCorrect ? 1 : 0), 0);
  }, [questions, reveals]);

  if (isPending) {
    return (
      <div
        className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-card px-6 py-20"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">טוען שאלות מהמאגר…</p>
      </div>
    );
  }

  if (isError || total === 0 || !q) {
    return (
      <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-border bg-card px-6 py-16 text-center">
        <p className="font-semibold text-foreground">
          {isError
            ? "לא הצלחנו לטעון את השאלות כרגע."
            : "לא נמצאו שאלות שתואמות את הבחירה שלך."}
        </p>
        <button
          onClick={onExit}
          className="mt-4 rounded-xl border border-border bg-card px-5 py-2.5 font-semibold text-foreground hover:bg-secondary"
        >
          חזרה להגדרות
        </button>
      </div>
    );
  }

  // ---- Summary ----
  if (finished) {
    if (!summaryReady) {
      return (
        <div
          className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-card px-6 py-20"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">מכינים את הסיכום…</p>
        </div>
      );
    }

    return (
      <div
        className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <h3 className="text-2xl font-extrabold text-foreground">סיכום התרגול</h3>
        <p className="mt-2 text-lg text-muted-foreground">
          ענית נכון על {score} מתוך {total} שאלות
        </p>

        <div className="mt-6 space-y-4">
          {questions.map((item, i) => {
            const itemReveal = reveals[i];
            const ok = !!itemReveal?.isCorrect;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border-2 p-5 ${
                  !itemReveal
                    ? "border-border bg-secondary/30"
                    : ok
                      ? "border-success bg-success/5"
                      : "border-destructive bg-destructive/5"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  {!itemReveal ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : ok ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-muted-foreground">שאלה {i + 1}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {item.topic}
                  </span>
                </div>
                {item.svgCode && <QuestionDiagram svg={item.svgCode} />}
                <p className="mt-3 text-foreground">
                  <MathText>{item.question}</MathText>
                </p>
                {!itemReveal ? (
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    הגעת למכסת השאלות החינמית להיום —{" "}
                    <Link to="/pricing" className="underline">
                      שדרג למסלול 700+
                    </Link>{" "}
                    כדי לראות את הפתרון לשאלה הזו.
                  </p>
                ) : (
                  <>
                    <p className="mt-2 text-sm font-semibold text-success">
                      התשובה הנכונה: <MathText>{item.answers[itemReveal.correctIndex] ?? ""}</MathText>
                    </p>
                    <div className="mt-3 space-y-3 border-t border-border pt-3">
                      {itemReveal.explanation
                        .split(/\n{2,}/)
                        .map((p) => p.trim())
                        .filter(Boolean)
                        .map((p, k) => (
                          <p key={k} className="leading-relaxed text-foreground">
                            <MathText>{p}</MathText>
                          </p>
                        ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onExit}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-primary-foreground shadow-md transition-all hover:scale-[1.01]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <RotateCcw className="h-4 w-4" />
          תרגול חדש
        </button>
      </div>
    );
  }

  const currentReveal = reveals[index];

  const optionClass = (i: number) => {
    const base =
      "w-full text-start rounded-2xl border-2 px-5 py-4 font-medium transition-all";
    if (!submitted || !currentReveal) {
      return `${base} ${
        selected === i
          ? "border-primary bg-accent text-foreground shadow-md"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent/40"
      }`;
    }
    if (i === currentReveal.correctIndex) return `${base} border-success bg-success/10 text-foreground`;
    if (i === selected) return `${base} border-destructive bg-destructive/10 text-foreground`;
    return `${base} border-border bg-card opacity-60`;
  };

  const isCorrect = submitted && !!currentReveal?.isCorrect;

  return (
    <div
      className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-border bg-card"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      {reportOpen && (
        <ReportModal questionId={q.id} onClose={() => setReportOpen(false)} />
      )}
      {/* Header */}
      <div className="border-b border-border bg-secondary/60 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {q.topic}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              שאלה {index + 1} מתוך {total}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ${
                config.totalSeconds != null && timeLeft <= 60
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Clock className="h-4 w-4" />
              {fmt(config.totalSeconds != null ? timeLeft : elapsed)}
            </span>
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <Megaphone className="h-3.5 w-3.5" />
              דיווח
            </button>
            <button
              onClick={() => setFinished(true)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              <Flag className="h-3.5 w-3.5" />
              סיום תרגול
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((index + 1) / total) * 100}%`,
              background: "var(--gradient-primary)",
            }}
          />
        </div>
      </div>

      {/* Palette */}
      <div className="flex flex-wrap gap-2 border-b border-border bg-background px-6 py-4">
        {questions.map((_, i) => {
          const answered = answers[i] != null;
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-9 w-9 rounded-lg border-2 text-sm font-bold transition-all ${
                i === index
                  ? "border-primary bg-primary text-primary-foreground"
                  : answered
                  ? "border-success bg-success/15 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="p-6 md:p-8">
        {q.svgCode && <QuestionDiagram svg={q.svgCode} />}

        <p className="text-lg leading-relaxed text-foreground">
          <MathText>{q.question}</MathText>
        </p>

        <div className="mt-6 grid gap-3">
          {q.answers.map((opt, i) => (
            <button
              key={i}
              onClick={() =>
                !submitted && setAnswers((prev) => ({ ...prev, [index]: i }))
              }
              disabled={submitted}
              className={optionClass(i)}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                    submitted && currentReveal && i === currentReveal.correctIndex
                      ? "border-success bg-success text-success-foreground"
                      : submitted && currentReveal && i === selected
                      ? "border-destructive bg-destructive text-destructive-foreground"
                      : selected === i
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {submitted && currentReveal && i === currentReveal.correctIndex ? (
                    <Check className="h-4 w-4" />
                  ) : submitted && currentReveal && i === selected ? (
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

        {/* Study-mode feedback */}
        {config.mode === "study" && (
          <div className="mt-6">
            {limitReached && !currentReveal ? (
              <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-amber-500/50 bg-amber-500/5 px-5 py-4">
                <Lock className="h-5 w-5 text-amber-600" />
                <span className="font-bold text-amber-700">
                  הגעת למכסת השאלות החינמית להיום —{" "}
                  <Link to="/pricing" className="underline">
                    שדרג למסלול 700+
                  </Link>{" "}
                  לגישה ללא הגבלה.
                </span>
              </div>
            ) : !submitted ? (
              <button
                onClick={() => selected !== null && void reveal([index])}
                disabled={selected === null || revealing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-primary-foreground shadow-md transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: "var(--gradient-primary)" }}
              >
                {revealing && <Loader2 className="h-4 w-4 animate-spin" />}
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
                  {isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  <span className="font-bold">
                    {isCorrect ? "כל הכבוד! תשובה נכונה." : "תשובה שגויה. בוא נבין למה."}
                  </span>
                </div>

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
                {showSolution && currentReveal && (
                  <div className="space-y-4 rounded-2xl border border-border bg-background p-5">
                    {currentReveal.explanation
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
        )}

        {/* Navigation */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => goTo(Math.max(0, index - 1))}
            disabled={index === 0}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-base font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
            הקודם
          </button>
          {index < total - 1 ? (
            <button
              onClick={() => goTo(Math.min(total - 1, index + 1))}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-primary-foreground shadow-md transition-all hover:scale-[1.01]"
              style={{ background: "var(--gradient-primary)" }}
            >
              לשאלה הבאה
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setFinished(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-primary-foreground shadow-md transition-all hover:scale-[1.01]"
              style={{ background: "var(--gradient-primary)" }}
            >
              סיום וצפייה בסיכום
              <Flag className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
