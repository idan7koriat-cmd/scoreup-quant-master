import { Check, X, ChevronDown } from "lucide-react";
import type { Question } from "@/data/questions";
import { MathText } from "./MathText";
import { QuestionDiagram } from "./QuestionDiagram";

type DemoQuestionCardProps = {
  question: Question;
  selected: number | null;
  submitted: boolean;
  showSolution: boolean;
  onSelect: (index: number) => void;
  onCheck: () => void;
  onToggleSolution: () => void;
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** הליבה האינטראקטיבית של שאלת דמו — שאלה, אפשרויות, בדיקה ופתרון. משותפת בין ה-Hero ל-DemoPractice; כל צד מספק צ'ראם משלו (כותרת, ניווט, paywall). */
export function DemoQuestionCard({
  question: q,
  selected,
  submitted,
  showSolution,
  onSelect,
  onCheck,
  onToggleSolution,
}: DemoQuestionCardProps) {
  const isCorrect = submitted && selected === q.correctIndex;

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

  return (
    <>
      {q.svgCode && <QuestionDiagram svg={q.svgCode} />}

      <p className="text-lg leading-relaxed text-foreground">
        <MathText>{q.question}</MathText>
      </p>

      <div className="mt-6 grid gap-3">
        {q.answers.map((opt, i) => (
          <button
            key={i}
            onClick={() => !submitted && onSelect(i)}
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
            onClick={onCheck}
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
              onClick={onToggleSolution}
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
    </>
  );
}
