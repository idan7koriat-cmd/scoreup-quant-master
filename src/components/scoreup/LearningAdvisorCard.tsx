import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Rocket, Sparkles, Target, TrendingUp } from "lucide-react";
import { getLearningAdvice } from "@/lib/advisor.functions";
import type { AdvisorTone } from "@/lib/learningAdvisorRules";
import type { PracticeConfig } from "@/data/questions";

const TONE_ICON: Record<AdvisorTone, typeof Sparkles> = {
  "no-data": Rocket,
  "partial-data": Sparkles,
  strong: TrendingUp,
  mixed: Sparkles,
  weak: Target,
};

const TYPING_SEEN_KEY = "advisor-typing-shown";
const TYPING_DURATION_MS = 750;

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="su-typing-dot h-2 w-2 rounded-full"
          style={{ background: "var(--primary)", animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function LearningAdvisorCard({
  isPremium,
  onStart,
  onUpgrade,
}: {
  isPremium: boolean;
  onStart: (config: PracticeConfig) => void;
  onUpgrade: () => void;
}) {
  const { data, isPending } = useQuery({
    queryKey: ["learning-advice"],
    queryFn: () => getLearningAdvice(),
    staleTime: 60 * 1000,
    retry: false,
  });

  const [phase, setPhase] = useState<"typing" | "reveal">("reveal");

  useEffect(() => {
    if (!data) return;
    const alreadySeen = sessionStorage.getItem(TYPING_SEEN_KEY);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (alreadySeen || reducedMotion) {
      setPhase("reveal");
      return;
    }
    setPhase("typing");
    const timer = setTimeout(() => {
      setPhase("reveal");
      sessionStorage.setItem(TYPING_SEEN_KEY, "1");
    }, TYPING_DURATION_MS);
    return () => clearTimeout(timer);
  }, [data]);

  if (isPending || !data) return null;

  const Icon = TONE_ICON[data.tone];

  const handleClick = () => {
    if (data.tone === "no-data" || !data.recommendedTopic) {
      onStart({
        topics: [],
        count: 3,
        difficultyLevel: null,
        totalSeconds: null,
        mode: "study",
        quick: true,
        launch: "warmup",
      });
      return;
    }
    if (!isPremium) {
      onUpgrade();
      return;
    }
    onStart({
      topics: [data.recommendedTopic],
      count: 10,
      difficultyLevel: data.recommendedDifficulty,
      totalSeconds: null,
      mode: "study",
      launch: "custom",
    });
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 ps-1">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-bold text-muted-foreground">היועץ שלך</span>
      </div>

      <div className="mt-1.5 flex items-end gap-2">
        <div className="w-7 shrink-0" />
        <div
          className="su-rise-in max-w-[92%] rounded-[18px] rounded-ss-[4px] border border-border px-4 py-3 sm:max-w-[80%]"
          style={{ background: "var(--accent)" }}
        >
          {phase === "typing" ? (
            <TypingDots />
          ) : (
            <>
              <p className="text-base font-extrabold text-foreground">{data.headline}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{data.detail}</p>
              {data.topicSignals.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {data.topicSignals.map((s) => (
                    <span
                      key={s.topic}
                      className="rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{ background: "var(--card)", color: "var(--primary)" }}
                    >
                      {s.topic} · {Math.round(s.accuracy * 100)}%
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {phase === "reveal" && (
        <div className="su-rise-in mt-2 flex justify-end ps-9">
          <button
            onClick={handleClick}
            className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-md transition-transform duration-150 ease-snappy hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            style={{ background: "var(--gradient-cta)" }}
          >
            {data.tone === "no-data" ? "בואו נתחיל" : "תרגל את זה עכשיו"}
          </button>
        </div>
      )}
    </div>
  );
}
