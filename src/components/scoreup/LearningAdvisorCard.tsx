import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { getLearningAdvice } from "@/lib/advisor.functions";
import type { PracticeConfig } from "@/data/questions";

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

  if (isPending || !data) return null;

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
    <div
      className="mt-8 rounded-[20px] border border-border bg-card p-6"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            יועץ הלימודים שלך
          </p>
          <p className="mt-1 text-xl font-extrabold text-foreground">{data.headline}</p>
          <p className="mt-1 text-sm text-muted-foreground">{data.detail}</p>
        </div>
        <button
          onClick={handleClick}
          className="flex shrink-0 items-center gap-2 rounded-[10px] px-5 py-3 text-sm font-bold text-white shadow-md transition-transform duration-150 ease-snappy hover:scale-[1.01] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{ background: "var(--gradient-primary)" }}
        >
          {data.tone === "no-data" ? "בואו נתחיל" : "תרגל את זה עכשיו"}
        </button>
      </div>
    </div>
  );
}
