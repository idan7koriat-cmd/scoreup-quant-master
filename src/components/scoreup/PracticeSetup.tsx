import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, Timer, Sparkles, Lock } from "lucide-react";
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

export function PracticeSetup({
  topics,
  onStart,
  isPremium = true,
  quickLocked = false,
  onUpgrade,
}: {
  topics?: string[];
  onStart: (config: PracticeConfig) => void;
  isPremium?: boolean;
  quickLocked?: boolean;
  onUpgrade?: () => void;
}) {
  const { data: liveTopics } = useQuery({
    queryKey: ["topics"],
    queryFn: () => getTopics(),
    staleTime: 5 * 60 * 1000,
  });
  const allTopics: string[] = topics ?? liveTopics ?? [];
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [level, setLevel] = useState<number | null>(null);
  const [timed, setTimed] = useState(false);
  const [mode, setMode] = useState<PracticeMode>("study");
  const [byId, setById] = useState("");

  const toggleTopic = (t: string) =>
    setSelectedTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const startById = () => {
    const id = byId.trim();
    if (!id) return;
    onStart({
      topics: [],
      count: 1,
      difficultyLevel: null,
      totalSeconds: null,
      mode: "study",
      launch: "custom",
      questionId: id,
    });
  };

  const startCustom = () =>
    onStart({
      topics: selectedTopics,
      count,
      difficultyLevel: level,
      totalSeconds: timed ? count * 60 : null,
      mode,
      launch: "custom",
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
          onClick={() => {
            if (!isPremium && quickLocked) return;
            onStart({
              topics: [],
              count: 3,
              difficultyLevel: null,
              totalSeconds: null,
              mode: "study",
              quick: true,
              launch: "warmup",
            });
          }}
          disabled={!isPremium && quickLocked}
          className="rounded-2xl border-2 border-border bg-secondary/50 p-5 text-start transition-all hover:border-primary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex items-center gap-2 text-lg font-extrabold text-foreground">
            <Zap className="h-5 w-5 text-primary" />
            חימום מהיר
          </span>
          <p className="mt-2 text-sm text-muted-foreground">
            {!isPremium && quickLocked
              ? "השתמשת בחימום המהיר היומי שלך — חזור מחר או שדרג למסלול 700+"
              : "3 שאלות אקראיות · ללא הגבלת זמן · פתרון מיד אחרי כל שאלה"}
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!isPremium) {
              onUpgrade?.();
              return;
            }
            onStart({
              topics: [],
              count: 20,
              difficultyLevel: null,
              totalSeconds: 20 * 60,
              mode: "exam",
              simulation: true,
              launch: "simulation",
            });
          }}
          className="rounded-2xl border-2 border-border bg-secondary/50 p-5 text-start transition-all hover:border-primary hover:shadow-md"
        >
          <span className="flex items-center gap-2 text-lg font-extrabold text-foreground">
            {isPremium ? <Timer className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
            סימולציית פרק מלאה
          </span>
          <p className="mt-2 text-sm text-muted-foreground">20 שאלות · טיימר פרק כולל 20:00 · פתרונות רק בסיכום</p>
        </button>
      </div>

      {/* כלי בדיקה זמני — להסרה לפני ההשקה */}
      <div className="mt-6 rounded-2xl border-2 border-dashed border-amber-500/50 bg-amber-500/5 p-4">
        <p className="mb-2 text-xs font-bold text-amber-600">🔧 כלי בדיקה זמני — טעינת שאלה לפי ID</p>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={byId}
            onChange={(e) => setById(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startById()}
            placeholder="הדבק כאן id של שאלה מ-Supabase"
            dir="ltr"
            className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={startById}
            disabled={!byId.trim()}
            className="rounded-xl border-2 border-amber-500/50 px-4 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            טען שאלה
          </button>
        </div>
      </div>

      <div className="my-8 h-px w-full bg-border" />

      <h3 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-foreground">
        <Sparkles className="h-5 w-5 text-primary" />
        בניית תרגול מותאם אישית
      </h3>

      <div className="relative">
        {!isPremium && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center p-4">
            <span className="pointer-events-auto sticky top-24 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/85 px-6 py-5 text-center shadow-lg">
              <Lock className="h-8 w-8 text-primary" />
              <p className="max-w-xs text-base font-extrabold text-foreground">
                תרגול מותאם אישית פתוח למנויי מסלול 700+ בלבד 🔒
              </p>
              <button
                type="button"
                onClick={onUpgrade}
                className="rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.03]"
                style={{ background: "var(--gradient-cta)" }}
              >
                שדרג למסלול 700+ ⚡
              </button>
            </span>
          </div>
        )}
        <div
          aria-hidden={!isPremium}
          {...(!isPremium ? { inert: "" as unknown as boolean } : {})}
          className={!isPremium ? "pointer-events-none select-none" : undefined}
        >


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
      </div>
    </div>
  );
}

