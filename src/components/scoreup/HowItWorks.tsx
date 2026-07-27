const steps = [
  {
    n: "01",
    title: "הרשמה ואבחון ראשוני",
    desc: "אבחון קצר מזהה את הרמה הנוכחית שלך ומגדיר לך מסלול לימוד אישי.",
  },
  {
    n: "02",
    title: "תרגול ממוקד עם AI",
    desc: "המערכת מגישה לך שאלות בקצב ובקושי המתאימים לך, עם הסברים מלאים.",
  },
  {
    n: "03",
    title: "מעקב, שיפור וציון גבוה",
    desc: "דוחות התקדמות שבועיים והמלצות ממוקדות עד שאתה מגיע ליעד.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
            איך זה עובד
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            שלושה שלבים לציון טוב יותר
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-8"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <span
                className="absolute -top-4 -end-2 text-8xl font-black opacity-10"
                style={{ color: "var(--primary)" }}
              >
                {s.n}
              </span>
              <div className="relative">
                <span
                  className="inline-block rounded-xl px-3 py-1 text-sm font-bold text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  שלב {s.n}
                </span>
                <h3 className="mt-4 text-xl font-bold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
