import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sigma, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

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
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setMsg("נשלח אליך מייל אימות — אשר אותו כדי להשלים את ההרשמה.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMsg("התחברת בהצלחה!");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "אירעה שגיאה, נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-card p-8"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <Link to="/" className="flex items-center justify-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sigma className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-xl font-black tracking-tight text-foreground">
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
          {mode === "signup" ? "הרשמה ל-ScoreUp" : "התחברות לחשבון"}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          גישה למאגר השאלות המלא, פתרונות מפורטים וניתוח ביצועים ב-AI.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              אימייל
            </label>
            <input
              type="email"
              required
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              סיסמה
            </label>
            <input
              type="password"
              required
              minLength={6}
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          {err && (
            <p className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
              {err}
            </p>
          )}
          {msg && (
            <p className="rounded-xl border border-success bg-success/10 px-4 py-3 text-sm font-semibold text-success">
              {msg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-slate-950 shadow-md transition-transform hover:scale-[1.01] disabled:opacity-50"
            style={{ background: "var(--gradient-cta)" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signup" ? "הירשם עכשיו" : "התחבר"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setErr(null);
            setMsg(null);
          }}
          className="mt-5 w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          {mode === "signup"
            ? "כבר יש לך חשבון? התחברות"
            : "אין לך חשבון? הרשמה"}
        </button>
      </div>
    </div>
  );
}
