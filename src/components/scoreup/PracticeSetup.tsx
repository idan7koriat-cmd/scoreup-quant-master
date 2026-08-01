import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, Timer, Sparkles } from "lucide-react";
import { getTopics } from "@/lib/questions.functions";
import type { PracticeConfig, PracticeMode } from "@/data/questions";

const COUNTS = [5, 10, 15, 20];
const LEVELS: (number | null)[] = [1, 2, 3, 4, null];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all ${
        active
          ? "border-primary bg-accent text-foreground shadow-md"
          : "border-border bg-card text-muted-foreground hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function PracticeSetup({ topics, onStart }: { topics?: string[]; onStart: (config: PracticeConfig) => void }) {
  const allTopics = FALLBACK_TOPICS;
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [level, setLevel] = useState<number | null>(null);
  const [timed, setTimed] = useState(false);
  const [mode, setMode] = useState<PracticeMode>("study");

  const toggleTopic = (t: string) =>
    setSelectedTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const startCustom = () =>
    onStart({
      topics: selectedTopics,
      count,
      difficultyLevel: level,
      totalSeconds: timed ? count * 60 : null,
      mode,
    });

  return (
    <div
      className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      {/* Presets */}
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            onStart({
              topics: [],
              count: 5,
              difficultyLevel: null,
              totalSeconds: null,
              mode: "study",
            })
          }
          className="rounded-2xl border-2 border-border bg-secondary/50 p-5 text-start transition-all hover:border-primary hover:shadow-md"
        >
          <span className="flex items-center gap-2 text-lg font-extrabold text-foreground">
            <Zap className="h-5 w-5 text-primary" />
            חימום מהיר
          </span>
          <p className="mt-2 text-sm text-muted-foreground">5 שאלות אקראיות · ללא הגבלת זמן · פתרון מיד אחרי כל שאלה</p>
        </button>

        <button
          type="button"
          onClick={() =>
            onStart({
              topics: [],
              count: 20,
              difficultyLevel: null,
              totalSeconds: 20 * 60,
              mode: "exam",
            })
          }
          className="rounded-2xl border-2 border-border bg-secondary/50 p-5 text-start transition-all hover:border-primary hover:shadow-md"
        >
          <span className="flex items-center gap-2 text-lg font-extrabold text-foreground">
            <Timer className="h-5 w-5 text-primary" />
            מבחן אמיתי
          </span>
          <p className="mt-2 text-sm text-muted-foreground">20 שאלות · טיימר פרק כולל 20:00 · פתרונות רק בסיכום</p>
        </button>
      </div>

      <div className="my-8 h-px w-full bg-border" />

      <h3 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-foreground">
        <Sparkles className="h-5 w-5 text-primary" />
        בניית תרגול מותאם אישית
      </h3>

      <div className="space-y-6">
        <Field label="נושאים">
          {allTopics.map((t) => (
            <Chip key={t} active={selectedTopics.includes(t)} onClick={() => toggleTopic(t)}>
              {t}
            </Chip>
          ))}
          {selectedTopics.length === 0 && (
            <span className="self-center text-xs text-muted-foreground">(לא נבחר — כל הנושאים)</span>
          )}
        </Field>

        <Field label="מספר שאלות">
          {COUNTS.map((c) => (
            <Chip key={c} active={count === c} onClick={() => setCount(c)}>
              {c}
            </Chip>
          ))}
        </Field>

        <Field label="רמת קושי">
          {LEVELS.map((l) => (
            <Chip key={String(l)} active={level === l} onClick={() => setLevel(l)}>
              {l === null ? "משולב" : `רמה ${l}`}
            </Chip>
          ))}
        </Field>

        <Field label="טיימר">
          <Chip active={!timed} onClick={() => setTimed(false)}>
            ללא הגבלת זמן
          </Chip>
          <Chip active={timed} onClick={() => setTimed(true)}>
            זמן פרק כולל ({count}:00 דקות)
          </Chip>
        </Field>

        <Field label="מצב תרגול">
          <Chip active={mode === "study"} onClick={() => setMode("study")}>
            מצב לימודי
          </Chip>
          <Chip active={mode === "exam"} onClick={() => setMode("exam")}>
            מצב מבחן
          </Chip>
        </Field>
      </div>

      <button
        type="button"
        onClick={startCustom}
        className="mt-8 w-full rounded-2xl py-4 text-base font-bold text-primary-foreground shadow-md transition-all hover:scale-[1.01]"
        style={{ background: "var(--gradient-primary)" }}
      >
        התחל תרגול
      </button>
    </div>
  );
}
