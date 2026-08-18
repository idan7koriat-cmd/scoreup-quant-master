import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Sigma,
  ArrowRight,
  Check,
  X,
  Sparkles,
  Zap,
  Loader2,
  Brain,
  Database,
  BookOpen,
  LineChart,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { getMyProfile } from "@/lib/profile.functions";
import { ContactButton } from "@/components/scoreup/ContactButton";

const valueCards = [
  {
    icon: Brain,
    title: "למידה מותאמת אישית",
    text: "אלגוריתם חכם המתאים את קצב השאלות לפי נקודות התורפה שלך בחשיבה כמותית.",
  },
  {
    icon: Database,
    title: "בנק שאלות עצום",
    text: "מאות שאלות ברמת המבחן הפסיכומטרי האמיתי, מחולקות לפי נושאים (גיאומטריה, אלגברה, בעיות, תרשימים).",
  },
  {
    icon: BookOpen,
    title: "הסברים מפורטים",
    text: "פתרון מלא, מובנה ושלב-אחר-שלב לכל שאלה — כדי שתבין את השיטה, לא רק את התשובה.",
  },
  {
    icon: LineChart,
    title: "מעקב התקדמות וסטטיסטיקה",
    text: "ניתוח מדויק של זמנים, אחוזי דיוק ורמות קושי כדי להבטיח שיפור מתמיד.",
  },
];

export const Route = createFileRoute("/pricing")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "מסלולים ומחירים — ScoreUp" },
      {
        name: "description",
        content:
          "בחר את המסלול שלך ל-700+: מנוי חודשי גמיש ב-₪99 או חבילת מרתון 60 יום ב-₪149 — תרגול מותאם, סימולציות וניתוח ביצועים.",
      },
      { property: "og:title", content: "מסלולים ומחירים — ScoreUp" },
      {
        property: "og:description",
        content: "כל הכלים, התרגולים והסימולציות במחיר של פחות משיעור פרטי אחד.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

type Plan = "monthly" | "marathon";

const premiumFeatures = [
  "גישה בלתי מוגבלת לכל מאגר השאלות",
  "בניית תרגול מותאם אישית לפי נושאים ורמות קושי",
  "סימולציות פרק מלאות — 20 שאלות ב-20 דקות",
  "פלטפורמת ניתוח ביצועים מתקדמת",
];

function LeadModal({ onClose, plan }: { onClose: () => void; plan: Plan }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <button
          onClick={onClose}
          aria-label="סגור"
          className="absolute end-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {sent ? (
          <div className="text-center">
            <span
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Check className="h-7 w-7" />
            </span>
            <h3 className="mt-5 text-2xl font-extrabold text-foreground">
              הפרטים נשמרו
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              ניצור איתך קשר תוך 24 שעות עם קישור לתשלום ופתיחת הגישה המלאה.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-secondary py-3.5 text-sm font-bold text-secondary-foreground"
            >
              סגור
            </button>
          </div>
        ) : (
          <>
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-7 w-7" />
            </span>
            <h3 className="mt-5 text-2xl font-extrabold text-foreground">
              שדרוג למסלול 700+
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {plan === "monthly"
                ? "מנוי חודשי גמיש — ₪99 לחודש, ביטול בכל עת."
                : "חבילת מרתון 60 יום — ₪149 בתשלום חד-פעמי."}{" "}
              השאר פרטים והסליקה תישלח אליך.
            </p>
            <form
              className="mt-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="אימייל"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="טלפון"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="w-full rounded-2xl py-4 text-base font-bold text-white shadow-md transition-transform hover:scale-[1.01]"
                style={{ background: "var(--gradient-cta)" }}
              >
                שלח ופתח גישה
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function PricingPage() {
  const { session, loading } = useSession();
  const [plan, setPlan] = useState<Plan>("marathon");
  const [modal, setModal] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getMyProfile(),
    enabled: !!session,
    staleTime: 60 * 1000,
  });

  const isPremium = profile?.isPremium ?? false;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {modal && <LeadModal plan={plan} onClose={() => setModal(false)} />}

      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg"
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

          <div className="flex items-center gap-2">
            <ContactButton className="hidden rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline">
              צור קשר
            </ContactButton>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4" />
              חזרה לדשבורד
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            בחר את המסלול שלך ל-
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-text)" }}
            >
              700+
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            כל הכלים, התרגולים והסימולציות במחיר של פחות משיעור פרטי אחד
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-[1fr_1.25fr]">
          {/* Free */}
          <div className="rounded-3xl border border-border bg-card p-8">
            <p className="text-sm font-bold text-muted-foreground">מסלול חינמי</p>
            <p className="mt-3 text-4xl font-extrabold text-foreground">₪0</p>
            <p className="mt-1 text-sm text-muted-foreground">
              להתחלה ולהיכרות עם המערכת
            </p>
            <ul className="mt-6 space-y-3 text-sm font-semibold text-foreground">
              {["חימום מהיר — 3 שאלות ביום", "ניתוח ביצועים בסיסי"].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
            <button
              disabled={!isPremium}
              className="mt-8 w-full cursor-default rounded-2xl border border-border bg-secondary py-3.5 text-sm font-bold text-muted-foreground disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : isPremium ? (
                "מסלול חינמי"
              ) : (
                "המסלול הנוכחי שלך"
              )}
            </button>
          </div>

          {/* Premium */}
          <div
            className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-card p-8"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <span
              className="absolute start-8 top-0 rounded-b-xl px-3 py-1 text-xs font-bold text-white"
              style={{ background: "var(--gradient-cta)" }}
            >
              המסלול המומלץ
            </span>

            <p className="mt-4 text-sm font-bold text-primary">מסלול 700+</p>

            {/* Plan selector */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setPlan("monthly")}
                className={`rounded-2xl border p-4 text-start transition-colors ${
                  plan === "monthly"
                    ? "border-primary bg-accent"
                    : "border-border hover:bg-secondary"
                }`}
              >
                <p className="text-sm font-bold text-foreground">מנוי חודשי גמיש</p>
                <p className="mt-1 text-2xl font-extrabold text-foreground">
                  ₪99
                  <span className="text-sm font-semibold text-muted-foreground">
                    {" "}
                    / חודש
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ללא התחייבות, ביטול בכל עת
                </p>
              </button>

              <button
                onClick={() => setPlan("marathon")}
                className={`relative rounded-2xl border p-4 text-start transition-colors ${
                  plan === "marathon"
                    ? "border-primary bg-accent"
                    : "border-border hover:bg-secondary"
                }`}
              >
                <span className="absolute end-3 top-3 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-success-foreground">
                  חיסכון 25%
                </span>
                <p className="text-sm font-bold text-foreground">מרתון 60 יום</p>
                <p className="mt-1 text-2xl font-extrabold text-foreground">
                  ₪149
                  <span className="text-sm font-semibold text-muted-foreground">
                    {" "}
                    חד-פעמי
                  </span>
                </p>
                <p className="mt-1 text-xs font-semibold text-primary">
                  המסלול הכי פופולרי
                </p>
              </button>
            </div>

            <ul className="mt-6 space-y-3 text-sm font-semibold text-foreground">
              {premiumFeatures.map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>

            {isPremium ? (
              <div className="mt-8 w-full rounded-2xl bg-accent py-4 text-center text-sm font-bold text-accent-foreground">
                המנוי שלך פעיל — גישה מלאה פתוחה 🎉
              </div>
            ) : (
              <button
                onClick={() => setModal(true)}
                className="mt-8 w-full rounded-2xl py-4 text-base font-bold text-white shadow-md transition-transform hover:scale-[1.01]"
                style={{ background: "var(--gradient-cta)" }}
              >
                שדרג עכשיו ל-700+
              </button>
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">
              תשלום מאובטח • ביטול בכל עת • תמיכה אישית בוואטסאפ
            </p>
          </div>
        </div>

        {/* Value grid */}
        <section className="mx-auto mt-20 max-w-5xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            מה בדיוק אתה מקבל במנוי ל-
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-text)" }}
            >
              700+
            </span>
            ?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {valueCards.map((c) => (
              <div
                key={c.title}
                className="glass-panel rounded-3xl p-7 transition-transform hover:-translate-y-1"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <c.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold text-foreground">
                  {c.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
