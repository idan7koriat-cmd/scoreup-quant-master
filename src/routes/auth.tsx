import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sigma, Loader2 } from "lucide-react";
import { getExtSupabase } from "@/lib/extAuthClient";
import { useSession } from "@/hooks/useSession";
import { ContactButton } from "@/components/scoreup/ContactButton";

type AuthMode = "signin" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode: AuthMode } => ({
    mode: search.mode === "signin" ? "signin" : "signup",
  }),
  head: () => ({
    meta: [
      { title: "הרשמה והתחברות — ScoreUp" },
      {
        name: "description",
        content:
          "הצטרף ל-ScoreUp וקבל גישה למאגר השאלות המלא בחשיבה כמותית, פתרונות מפורטים וניתוח ביצועים ב-AI.",
      },
      { property: "og:title", content: "הרשמה והתחברות — ScoreUp" },
      {
        property: "og:description",
        content: "גישה מלאה למאגר השאלות בפסיכומטרי כמותי וניתוח ביצועים ב-AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();

  useEffect(() => {
    if (!session) return;
    let dest = "/dashboard";
    try {
      const saved = window.sessionStorage.getItem("scoreup-post-auth");
      if (saved && saved.startsWith("/") && !saved.startsWith("//")) dest = saved;
      window.sessionStorage.removeItem("scoreup-post-auth");
    } catch {
      /* ללא אחסון — יעד ברירת המחדל */
    }
    navigate({ to: dest, replace: true });
  }, [session, navigate]);
  const setMode = (m: AuthMode) => navigate({ to: "/auth", search: { mode: m } });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [examDate, setExamDate] = useState("");
  const [targetDegree, setTargetDegree] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const googleSignIn = async () => {
    setErr(null);
    setMsg(null);
    setGoogleLoading(true);
    try {
      window.sessionStorage.setItem("scoreup-post-auth", "/dashboard");
    } catch {
      /* אחסון חסום — נמשיך ליעד ברירת המחדל */
    }
    const supabase = await getExtSupabase();
    // חוזרים לכתובת ציבורית ולא ישירות למסך מוגן, כדי שהסשן יספיק להיטען.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth?mode=signin` },
    });
    if (error) {
      const raw = error.message ?? "";
      setErr(
        /provider is not enabled|Unsupported provider/i.test(raw)
          ? "התחברות עם Google אינה מופעלת כרגע. אפשר להתחבר עם אימייל וסיסמה."
          : "ההתחברות עם Google נכשלה. נסה שוב או התחבר עם אימייל וסיסמה.",
      );
      setGoogleLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const supabase = await getExtSupabase();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { exam_date: examDate, target_degree: targetDegree },
          },
        });

        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMsg("התחברת בהצלחה!");
        navigate({ to: "/dashboard" });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "אירעה שגיאה, נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="su-theme-v2 flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-end gap-2 px-4">
          <Link
            to="/pricing"
            className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            תכניות ומנויים
          </Link>
          <ContactButton className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            צור קשר
          </ContactButton>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div
          className="w-full max-w-md rounded-[20px] border border-border bg-card p-8"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <Link
            to="/"
            className="flex items-center justify-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sigma className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Score
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-text)" }}
              >
                Up
              </span>
            </span>
          </Link>

          <h1 className="mt-6 text-center text-2xl font-extrabold text-foreground">
            {mode === "signup" ? "הרשמה ל-ScoreUp" : "התחברות ל-ScoreUp"}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            גישה למאגר השאלות המלא, פתרונות מפורטים וניתוח ביצועים ב-AI.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-[10px] bg-secondary p-1">
            {(["signup", "signin"] as AuthMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setErr(null);
                  setMsg(null);
                }}
                className={`rounded-[8px] py-2.5 text-sm font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  mode === m
                    ? "bg-card text-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signup" ? "הרשמה" : "התחברות"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={googleSignIn}
            disabled={googleLoading}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-[10px] border-2 border-border bg-background py-3.5 text-sm font-bold text-foreground transition-colors duration-150 hover:bg-secondary disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.28a12 12 0 0 0 0 10.76l4.01-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z"
                />
              </svg>
            )}
            התחברות מהירה באמצעות Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground">או</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label
                htmlFor="auth-email"
                className="mb-1.5 block text-sm font-semibold text-foreground"
              >
                אימייל
              </label>
              <input
                id="auth-email"
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[10px] border-2 border-border bg-background px-4 py-3 text-foreground outline-none transition-colors duration-150 focus:border-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="auth-password"
                className="mb-1.5 block text-sm font-semibold text-foreground"
              >
                סיסמה
              </label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[10px] border-2 border-border bg-background px-4 py-3 text-foreground outline-none transition-colors duration-150 focus:border-primary"
                placeholder="••••••••"
              />
            </div>

            {mode === "signup" && (
              <>
                <div>
                  <label
                    htmlFor="auth-exam-date"
                    className="mb-1.5 block text-sm font-semibold text-foreground"
                  >
                    תאריך בחינה מתוכנן
                  </label>
                  <input
                    id="auth-exam-date"
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full rounded-[10px] border-2 border-border bg-background px-4 py-3 text-foreground outline-none transition-colors duration-150 focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="auth-target-degree"
                    className="mb-1.5 block text-sm font-semibold text-foreground"
                  >
                    תחום לימודים מבוקש
                  </label>
                  <input
                    id="auth-target-degree"
                    type="text"
                    required
                    value={targetDegree}
                    onChange={(e) => setTargetDegree(e.target.value)}
                    className="w-full rounded-[10px] border-2 border-border bg-background px-4 py-3 text-foreground outline-none transition-colors duration-150 focus:border-primary"
                    placeholder="הנדסה, רפואה, מדעי המחשב…"
                  />
                </div>
              </>
            )}

            {err && (
              <p className="rounded-[10px] border border-destructive bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
                {err}
              </p>
            )}
            {msg && (
              <p className="rounded-[10px] border border-success bg-success/10 px-4 py-3 text-sm font-semibold text-success">
                {msg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-[10px] py-4 text-base font-bold text-white shadow-md transition-transform duration-150 ease-snappy hover:scale-[1.01] active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{ background: "var(--gradient-cta)" }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "ההרשמה עכשיו" : "התחבר"}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setErr(null);
              setMsg(null);
            }}
            className="mt-5 w-full rounded-md text-center text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {mode === "signup" ? "כבר יש לך חשבון? התחברות" : "אין לך חשבון? הרשמה"}
          </button>
        </div>
      </div>
    </div>
  );
}
