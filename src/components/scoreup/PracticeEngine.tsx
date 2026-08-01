import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { getTopics } from "@/lib/questions.functions";
import type { PracticeConfig } from "@/data/questions";
import { PracticeSetup } from "./PracticeSetup";
import { PracticeSession } from "./PracticeSession";

export function PracticeEngine() {
  const [config, setConfig] = useState<PracticeConfig | null>(null);
  const { data: topics } = useQuery({
    queryKey: ["topics"],
    queryFn: () => getTopics(),
    staleTime: 5 * 60_000,
  });

  return (
    <section id="practice" className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
            <Sparkles className="h-4 w-4" />
            מנוע התרגול
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {config ? "בהצלחה בתרגול!" : "בנה את התרגול שלך — עכשיו"}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            {config
              ? "נווט בין השאלות בחופשיות, וסיים כשאתה מוכן."
              : "בחר נושאים, כמות שאלות, רמת קושי ומצב תרגול — או התחל עם פריסט מוכן."}
          </p>
        </div>

        {config ? (
          <PracticeSession config={config} onExit={() => setConfig(null)} />
        ) : (
          <PracticeSetup topics={topics} onStart={setConfig} />
        )}
      </div>
    </section>
  );
}
