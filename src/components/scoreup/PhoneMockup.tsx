import { useEffect, useState } from "react";
import { SignalHigh, Wifi, BatteryFull } from "lucide-react";
import { demoQuestions } from "@/data/demoQuestions";
import { MathText } from "./MathText";

/** תת-קבוצה של שאלות הדמו שמתאימות לתצוגה קטנה בתוך מסגרת טלפון — בלי דיאגרמת SVG ובלי שאלת מילים ארוכה מדי. */
const previewQuestions = [demoQuestions[0]!, demoQuestions[1]!, demoQuestions[3]!];

const CYCLE_MS = 4200;

/** ויטרינה פסיבית ומונפשת — לא אינטראקטיבית בכוונה: הרכיב הזה "מציג", הרכיב האינטראקטיבי האמיתי נמצא ב-DemoPractice למטה. */
export function PhoneMockup() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % previewQuestions.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const q = previewQuestions[index]!;

  return (
    <div className="su-rise-in mx-auto w-[260px] sm:w-[280px]" style={{ animationDelay: "260ms" }}>
      <div className="rounded-[46px] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl">
        <div className="relative overflow-hidden rounded-[36px] bg-card" style={{ aspectRatio: "9 / 18.5" }}>
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

            <p className="mt-4 text-sm leading-relaxed text-foreground">
              <MathText>{q.question}</MathText>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {q.answers.map((opt, i) => (
                <div
                  key={i}
                  className="relative rounded-[10px] border border-border bg-background px-3 py-3 text-center text-sm font-semibold text-foreground"
                >
                  <span className="absolute top-1 end-1.5 text-[10px] font-bold text-muted-foreground">
                    {String.fromCharCode(0x05d0 + i)}
                  </span>
                  <MathText>{opt}</MathText>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
