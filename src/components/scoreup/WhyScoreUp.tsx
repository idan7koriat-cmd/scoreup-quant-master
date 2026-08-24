import { Brain, ListChecks, LineChart, Library } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { QuantMotif } from "./QuantMotif";

const supportingFeatures = [
  {
    icon: ListChecks,
    title: "פתרונות שלב-אחר-שלב",
    desc: "כל שאלה כוללת פתרון מלא, ברור ומפורק — כך שתבין לא רק את התשובה אלא גם את הדרך אליה.",
  },
  {
    icon: LineChart,
    title: "ניתוח ביצועים בזמן אמת",
    desc: "עקוב אחרי הדיוק, המהירות וההתקדמות שלך בכל נושא, וקבל המלצות למה כדאי להתמקד בהמשך.",
  },
  {
    icon: Library,
    title: "מאגר שאלות מעודכן",
    desc: "מאות שאלות אמיתיות מסגנון הפסיכומטרי — אחוזים, אלגברה, גיאומטריה, בעיות מילוליות והסקה כמותית.",
  },
];

export function WhyScoreUp() {
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>();
  const { ref: gridRef, inView: gridInView } = useInView<HTMLDivElement>();
  const StepIcon = supportingFeatures[0]!.icon;
  const ChartIcon = supportingFeatures[1]!.icon;
  const LibIcon = supportingFeatures[2]!.icon;

  return (
    <section id="why" className="py-24" style={{ background: "var(--gradient-subtle)" }}>
      <div className="container mx-auto px-4">
        <div
          ref={headerRef}
          className={`mx-auto max-w-2xl text-center ${headerInView ? "su-rise-in" : "opacity-0"}`}
        >
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
            למה ScoreUp?
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            כל מה שצריך כדי להעלות ציון — במקום אחד
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            שילוב של טכנולוגיה חכמה, פדגוגיה מדויקת ותרגול ממוקד — כדי לתת לך יתרון אמיתי ביום
            המבחן.
          </p>
        </div>

        <div ref={gridRef} className="mt-14 grid gap-6 lg:grid-cols-3">
          {/* כרטיס דגל — ה-AI המותאם אישית הוא הבידול האמיתי (ראה PRODUCT.md, Positioning) */}
          <div
            className={`su-flagship-card group relative overflow-hidden rounded-[20px] border border-border bg-card p-8 hover:-translate-y-1 lg:col-span-2 ${
              gridInView ? "su-rise-in" : "opacity-0"
            }`}
            style={{ animationDelay: "0ms" }}
          >
            <QuantMotif className="pointer-events-none absolute -bottom-6 -end-6 h-48 w-48 text-primary/10" />
            <div className="relative">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-[16px] text-primary-foreground transition-transform duration-200 ease-out group-hover:scale-110"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Brain className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
                AI מותאם אישית
              </h3>
              <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
                המערכת מזהה את נקודות החוזק והחולשה שלך ומייצרת מסלול תרגול מותאם — כדי שכל דקה
                תעבוד בשבילך.
              </p>
            </div>
          </div>

          <div
            className={`group rounded-[20px] border border-border bg-card p-6 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 ${
              gridInView ? "su-rise-in" : "opacity-0"
            }`}
            style={{ boxShadow: "var(--shadow-card)", animationDelay: "80ms" }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[16px] text-primary-foreground transition-transform duration-200 ease-out group-hover:scale-110"
              style={{ background: "var(--gradient-primary)" }}
            >
              <StepIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-foreground">
              {supportingFeatures[0].title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {supportingFeatures[0].desc}
            </p>
          </div>

          <div
            className={`group rounded-[20px] border border-border bg-card p-6 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 ${
              gridInView ? "su-rise-in" : "opacity-0"
            }`}
            style={{ boxShadow: "var(--shadow-card)", animationDelay: "160ms" }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[16px] text-primary-foreground transition-transform duration-200 ease-out group-hover:scale-110"
              style={{ background: "var(--gradient-primary)" }}
            >
              <ChartIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-foreground">
              {supportingFeatures[1].title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {supportingFeatures[1].desc}
            </p>
          </div>

          <div
            className={`group flex flex-col gap-4 rounded-[20px] border border-border bg-card p-6 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 sm:flex-row sm:items-center lg:col-span-2 ${
              gridInView ? "su-rise-in" : "opacity-0"
            }`}
            style={{ boxShadow: "var(--shadow-card)", animationDelay: "240ms" }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-primary-foreground transition-transform duration-200 ease-out group-hover:scale-110"
              style={{ background: "var(--gradient-primary)" }}
            >
              <LibIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{supportingFeatures[2].title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {supportingFeatures[2].desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
