import { Brain, ListChecks, LineChart, Library } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI מותאם אישית",
    desc: "המערכת מזהה את נקודות החוזק והחולשה שלך ומייצרת מסלול תרגול מותאם — כדי שכל דקה תעבוד בשבילך.",
  },
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
  return (
    <section id="why" className="py-24" style={{ background: "var(--gradient-subtle)" }}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
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

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-[20px] border border-border bg-card p-6 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-[16px] text-primary-foreground transition-transform duration-200 ease-out group-hover:scale-110"
                style={{ background: "var(--gradient-primary)" }}
              >
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
