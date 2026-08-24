import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ListChecks, Timer, ClipboardCheck, LineChart, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/scoreup/Navbar";
import { Footer } from "@/components/scoreup/Footer";
import { useSession } from "@/hooks/useSession";
import { useInView } from "@/hooks/useInView";

export const Route = createFileRoute("/how-to-learn")({
  head: () => ({
    meta: [
      { title: "איך ללמוד ב-ScoreUp — השיטה שלנו" },
      {
        name: "description",
        content:
          "בScoreUp לומדים על ידי תרגול — הרבה שאלות ברמת הבחינה האמיתית, במצב מבחן מתוזמן, כדי שביום ה-B לא יהיה שום דבר מפתיע.",
      },
      { property: "og:title", content: "איך ללמוד ב-ScoreUp — השיטה שלנו" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HowToLearnPage,
});

const steps = [
  {
    icon: ListChecks,
    title: "1. תבחרו נושא, או שתתרגלו הכל",
    desc: "מתקשים באחוזים? בגיאומטריה? בבעיות מילוליות? תבחרו נושא ספציפי לתרגול ממוקד, או תשאירו פתוח ותתרגלו מכל הנושאים יחד — כמו שיקרה בפועל בבחינה.",
  },
  {
    icon: Timer,
    title: "2. תתרגלו במצב מבחן",
    desc: "זה הלב של השיטה. במצב מבחן השאלות ברמת הקושי האמיתית של הפסיכומטרי, ועם טיימר אמיתי — כולל סימולציית פרק מלאה של 20 שאלות ב-20 דקות, בדיוק כמו בבחינה עצמה.",
  },
  {
    icon: ClipboardCheck,
    title: "3. תקבלו פתרון מלא לכל שאלה",
    desc: "כל שאלה מגיעה עם פתרון שלב-אחר-שלב וברור, כדי שתבינו לא רק מה הייתה הטעות, אלא גם איך להגיע לתשובה הנכונה בפעם הבאה.",
  },
  {
    icon: LineChart,
    title: "4. תחזרו על הנושאים החלשים",
    desc: "המערכת עוקבת אחרי הדיוק והמהירות שלכם בכל נושא, ומראה בדיוק איפה עוד יש מה לשפר — כדי שכל תרגול יביא אתכם קרוב יותר ל-700+.",
  },
];

function StartPracticeButton({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const { session } = useSession();
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        if (!session) {
          navigate({ to: "/auth", search: { mode: "signup" as const } });
          return;
        }
        navigate({
          to: "/practice",
          search: {
            mode: "simulation",
            topics: [],
            count: 20,
            level: 0,
            seconds: 0,
            style: "exam",
          },
        });
      }}
      className={className}
    >
      {children}
    </button>
  );
}

function HowToLearnPage() {
  const { ref: stepsRef, inView: stepsInView } = useInView<HTMLDivElement>();
  const { ref: examModeRef, inView: examModeInView } = useInView<HTMLDivElement>();
  const { ref: whyRef, inView: whyInView } = useInView<HTMLDivElement>();
  const { ref: ctaRef, inView: ctaInView } = useInView<HTMLDivElement>();

  return (
    <div className="su-theme-v2 min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar />

      <main>
        <section className="relative overflow-hidden text-white">
          <div className="su-gradient-energy" aria-hidden="true" />
          <div className="container relative mx-auto px-4 py-20 md:py-24">
            <div className="su-rise-in mx-auto max-w-3xl text-center">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold backdrop-blur-xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.14)",
                  color: "var(--petrol-tint)",
                }}
              >
                <Timer className="h-4 w-4" />
                השיטה שלנו
              </span>
              <h1 className="mt-6 text-5xl font-black leading-[1.1] tracking-tight text-white md:text-6xl">
                איך באמת משפרים ציון
                <br />
                <span style={{ color: "var(--petrol-tint)" }}>בחלק הכמותי</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
                לא עוד שיעורי תיאוריה אינסופיים. שיפור אמיתי מגיע מתרגול — הרבה שאלות, ברמת הקושי של
                הבחינה עצמה, תחת אותו לחץ זמן.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div ref={stepsRef} className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className={`rounded-[20px] border border-border bg-card p-6 ${stepsInView ? "su-rise-in" : "opacity-0"}`}
                  style={{ boxShadow: "var(--shadow-card)", animationDelay: `${i * 80}ms` }}
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-[16px] text-white"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <s.icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-lg font-extrabold text-foreground">{s.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>

            <div
              ref={examModeRef}
              className={`mx-auto mt-10 max-w-4xl rounded-[20px] border border-primary/20 bg-accent/40 p-7 md:p-8 ${examModeInView ? "su-rise-in" : "opacity-0"}`}
            >
              <h3 className="text-xl font-extrabold text-foreground">למה דווקא מצב מבחן?</h3>
              <p className="mt-3 leading-relaxed text-foreground/90">
                כי ההפתעה הכי גרועה ביום המבחן היא שהשאלות קשות מכפי שציפיתם, והזמן פשוט נגמר. כשאתם
                מתרגלים המון פעמים בתנאים זהים — אותה רמת קושי, אותו טיימר — הגוף והראש כבר מכירים
                את הקצב. אתם לא מגיעים לבחינה בפעם הראשונה שאתם פותרים ברמה הזאת ובזמן הזה, אלא בפעם
                המאה.
              </p>
            </div>

            <div ref={whyRef} className="mx-auto mt-10 max-w-4xl">
              <h3
                className={`text-center text-xl font-extrabold text-foreground ${whyInView ? "su-rise-in" : "opacity-0"}`}
              >
                למה ScoreUp?
              </h3>
              <ul className="mt-6 grid gap-4 text-sm font-semibold text-foreground sm:grid-cols-3">
                {[
                  "מאגר שאלות ברמת הפסיכומטרי האמיתי, לא סתם דומות",
                  "AI שמזהה בדיוק איפה אתם נתקעים ומכוון אתכם לשם",
                  "תרגול זמין תמיד — במצב מבחן אמיתי, מתי שנוח לכם",
                ].map((t, i) => (
                  <li
                    key={t}
                    className={`flex items-start gap-2 rounded-[16px] border border-border bg-card p-4 ${whyInView ? "su-rise-in" : "opacity-0"}`}
                    style={{ animationDelay: `${80 + i * 80}ms` }}
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-20 text-white">
          <div className="su-gradient-energy" aria-hidden="true" />
          <div
            ref={ctaRef}
            className={`container relative mx-auto px-4 text-center ${ctaInView ? "su-rise-in" : "opacity-0"}`}
          >
            <h2 className="mx-auto max-w-2xl text-3xl font-black leading-tight md:text-5xl">
              מוכנים לתרגל <span style={{ color: "var(--petrol-tint)" }}>במצב מבחן?</span>
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <StartPracticeButton className="group inline-flex items-center gap-2 rounded-[10px] px-8 py-4 text-base font-bold text-white shadow-xl transition-transform duration-150 ease-snappy hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--petrol-deep)]">
                התחל סימולציית פרק
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </StartPracticeButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
