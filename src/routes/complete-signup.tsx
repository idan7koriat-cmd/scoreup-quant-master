import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sigma, Loader2 } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { getExtSupabase } from "@/lib/extAuthClient";
import { getMyProfile, recordOAuthConsent } from "@/lib/profile.functions";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/complete-signup")({
  ssr: false,
  head: () => ({
    meta: [{ title: "השלמת הרשמה — ScoreUp" }],
  }),
  component: CompleteSignupPage,
});

function readSavedDest(): string {
  try {
    return window.sessionStorage.getItem("scoreup-post-auth") || "/dashboard";
  } catch {
    return "/dashboard";
  }
}

function CompleteSignupPage() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isPending: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getMyProfile(),
    enabled: !!session,
    staleTime: 60 * 1000,
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (loading || (session && profileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    navigate({ to: "/auth", search: { mode: "signin" as const }, replace: true });
    return null;
  }

  // כבר אישר בעבר (למשל ניווט חזרה למסך הזה אחרי שהשלים) — אין מה להציג, ממשיכים ליעד.
  if (profile?.termsAcceptedAt) {
    navigate({ to: readSavedDest(), replace: true });
    return null;
  }

  const submit = async () => {
    if (!agreedToTerms || submitting) return;
    setSubmitting(true);
    setErr(null);
    try {
      await recordOAuthConsent({ data: { marketingConsent } });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      const dest = readSavedDest();
      try {
        window.sessionStorage.removeItem("scoreup-post-auth");
      } catch {
        /* לא קריטי */
      }
      navigate({ to: dest, replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "אירעה שגיאה, נסה שוב.");
      setSubmitting(false);
    }
  };

  const signOut = async () => {
    const supabase = await getExtSupabase();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" as const }, replace: true });
  };

  return (
    <div className="su-theme-v2 flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-foreground">
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
        className="su-rise-in w-full max-w-md rounded-[20px] border border-border bg-card p-8"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <h1 className="text-center text-2xl font-extrabold text-foreground">כמעט סיימנו</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          לפני שממשיכים, נשאר רק לאשר את התקנון ומדיניות הפרטיות.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="complete-terms"
              checked={agreedToTerms}
              onCheckedChange={(v) => setAgreedToTerms(v === true)}
              className="mt-0.5"
            />
            <label htmlFor="complete-terms" className="text-sm leading-relaxed text-foreground">
              קראתי ואני מסכים/ה ל
              <Link to="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                תקנון
              </Link>{" "}
              ול
              <Link
                to="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                מדיניות הפרטיות
              </Link>
            </label>
          </div>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="complete-marketing"
              checked={marketingConsent}
              onCheckedChange={(v) => setMarketingConsent(v === true)}
              className="mt-0.5"
            />
            <label htmlFor="complete-marketing" className="text-sm leading-relaxed text-foreground">
              אני מעוניין/ת לקבל עדכונים ותזכורות תרגול בדוא"ל
            </label>
          </div>
        </div>

        {err && (
          <p className="mt-4 rounded-[10px] border border-destructive bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            {err}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!agreedToTerms || submitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] py-4 text-base font-bold text-white shadow-md transition-transform duration-150 ease-snappy hover:scale-[1.01] active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{ background: "var(--gradient-cta)" }}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          המשך
        </button>

        <button
          type="button"
          onClick={signOut}
          className="mt-4 w-full rounded-md text-center text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          התנתקות
        </button>
      </div>
    </div>
  );
}
