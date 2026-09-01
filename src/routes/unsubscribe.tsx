import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sigma, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { unsubscribeMarketing } from "@/lib/marketing.functions";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (search: Record<string, unknown>): { uid?: string } => ({
    uid: typeof search.uid === "string" ? search.uid : undefined,
  }),
  head: () => ({
    meta: [{ title: "הסרה מרשימת התפוצה — ScoreUp" }],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { uid } = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "done" | "error">(uid ? "loading" : "error");

  useEffect(() => {
    if (!uid) return;
    unsubscribeMarketing({ data: { userId: uid } })
      .then((res) => setStatus(res.ok ? "done" : "error"))
      .catch(() => setStatus("error"));
  }, [uid]);

  return (
    <div className="su-theme-v2 flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <Link to="/" className="mb-6 flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sigma className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <span className="font-display text-xl font-bold tracking-tight text-foreground">
          Score
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-text)" }}>
            Up
          </span>
        </span>
      </Link>

      <div
        className="w-full max-w-md rounded-[20px] border border-border bg-card p-8 text-center"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">מעדכן את ההעדפות שלך...</p>
          </>
        )}
        {status === "done" && (
          <>
            <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
            <h1 className="mt-4 text-lg font-bold text-foreground">הוסרת בהצלחה מרשימת התפוצה</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              לא תקבל/י יותר עדכונים ותזכורות תרגול בדוא"ל. הודעות שירות (כגון אישורי הרשמה או
              עדכונים על החשבון שלך) ימשיכו להישלח כרגיל.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto h-8 w-8 text-destructive" />
            <h1 className="mt-4 text-lg font-bold text-foreground">משהו השתבש</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              לא הצלחנו לעדכן את ההעדפות שלך. אפשר לנסות שוב מהלינק במייל, או לפנות אלינו ישירות.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
