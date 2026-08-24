import { useEffect, useState } from "react";
import { SignalHigh, Wifi, BatteryFull, ChevronLeft } from "lucide-react";
import { demoQuestions } from "@/data/demoQuestions";
import { DemoQuestionCard } from "./DemoQuestionCard";

/** תת-קבוצה של שאלות הדמו שמתאימות לתצוגה קטנה בתוך מסגרת טלפון — בלי דיאגרמת SVG ובלי שאלת מילים ארוכה מדי. */
const previewQuestions = [demoQuestions[0]!, demoQuestions[1]!, demoQuestions[3]!];

const CYCLE_MS = 6000;

/** ויטרינת "המוצר בפעולה" — טלפון עם שאלת תרגול אמיתית ואינטראקטיבית (אותם כפתורי "בדוק תשובה"/"השאלה הבאה" כמו בתרגול האמיתי), שמתקדמת לבד אם אף אחד לא נוגע בה. */
export function PhoneMockup() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
    setShowSolution(false);
  }, [index]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (selected !== null) return; // המבקר בחר תשובה — הפסק להתקדם לבד, חכה לו
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % previewQuestions.length);
    }, CYCLE_MS);
    return () => clearTimeout(id);
  }, [index, selected]);

  const q = previewQuestions[index]!;

  return (
    <div className="su-rise-in mx-auto w-[260px] sm:w-[280px]" style={{ animationDelay: "260ms" }}>
      <div className="rounded-[46px] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl">
        <div className="relative min-h-[420px] overflow-hidden rounded-[36px] bg-card">
          <div className="absolute inset-x-0 top-0 flex justify-center pt-2">
            <div className="h-6 w-28 rounded-full bg-neutral-900" />
          </div>

          <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-foreground">
            <span>9:41</span>
            <div className="flex items-center gap-1 text-foreground/80">
              <SignalHigh className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <BatteryFull className="h-3 w-3" />
            </div>
          </div>

          <div key={index} className="su-rise-in px-4 pt-6 pb-6">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                {q.topic}
              </span>
              {q.difficulty && (
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {q.difficulty}
                </span>
              )}
            </div>

            <div className="mt-4 text-sm [&_button]:text-sm [&_button]:py-3 [&_p]:text-sm">
              <DemoQuestionCard
                question={q}
                selected={selected}
                submitted={submitted}
                showSolution={showSolution}
                onSelect={setSelected}
                onCheck={() => setSubmitted(true)}
                onToggleSolution={() => setShowSolution((s) => !s)}
              />
            </div>

            {submitted && (
              <button
                onClick={() => setIndex((i) => (i + 1) % previewQuestions.length)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] py-3 text-sm font-bold text-primary-foreground shadow-md transition-transform duration-150 ease-snappy hover:scale-[1.01] active:scale-[0.97]"
                style={{ background: "var(--gradient-primary)" }}
              >
                השאלה הבאה
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
