import { useEffect, useState } from "react";

type AccuracyRingProps = {
  percent: number;
  size?: number;
};

/** טבעת דיוק — conic-gradient טהור (בלי SVG/תלות חדשה), ממלא בהדרגה מ-0 עד היעד בפתיחה. */
export function AccuracyRing({ percent, size = 96 }: AccuracyRingProps) {
  const target = Math.max(0, Math.min(100, Math.round(percent)));
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return;
    }
    setDisplay(0);
    let raf = 0;
    const duration = 800;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--primary) ${display}%, var(--secondary) 0)`,
      }}
      role="img"
      aria-label={`אחוז דיוק: ${target}%`}
    >
      <div className="absolute inset-2 flex items-center justify-center rounded-full bg-card">
        <span className="text-2xl font-black text-foreground">{display}%</span>
      </div>
    </div>
  );
}
