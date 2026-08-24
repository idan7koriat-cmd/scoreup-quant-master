import { useEffect, useState } from "react";

type TopicBarProps = {
  topic: string;
  correct: number;
  total: number;
  delayMs: number;
};

/** פס התקדמות לפי נושא — ממלא בהדרגה מ-0 עד היעד בכניסה. משותף בין Profile (סטטיסטיקה כוללת) ל-PracticeSession (סיכום סשן בודד). */
export function TopicBar({ topic, correct, total, delayMs }: TopicBarProps) {
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setWidth(pct);
      return;
    }
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="rounded-[16px] border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold text-foreground">{topic}</span>
        <span className="text-sm font-semibold text-muted-foreground">
          {correct}/{total} · {pct}%
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${width}%`,
            background: "var(--gradient-primary)",
            transitionDelay: `${delayMs}ms`,
          }}
        />
      </div>
    </div>
  );
}
