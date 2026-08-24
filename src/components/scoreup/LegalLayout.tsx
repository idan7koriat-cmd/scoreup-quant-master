import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function LegalLayout({
  title,
  updatedAt,
  sections,
  children,
}: {
  title: string;
  updatedAt: string;
  sections: { id: string; title: string }[];
  children: ReactNode;
}) {
  return (
    <div className="su-theme-v2 min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">עדכון אחרון: {updatedAt}</p>

        <nav
          aria-label="תוכן העניינים"
          className="mt-8 rounded-[16px] border border-border bg-card p-5"
        >
          <p className="text-sm font-bold text-foreground">תוכן העניינים</p>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm font-semibold text-muted-foreground sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="transition-colors duration-150 hover:text-primary">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-8 space-y-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-[20px] border border-border bg-card p-6 md:p-8"
    >
      <h2 className="text-xl font-extrabold text-foreground md:text-2xl">{title}</h2>
      <div className="mt-4 space-y-3 text-base leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}
