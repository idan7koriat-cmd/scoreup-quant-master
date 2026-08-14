import { Sigma } from "lucide-react";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL as string;

export function Footer() {
  return (
    <footer
      className="border-t py-10 text-slate-300"
      style={{ background: "#0B1120", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sigma className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-black tracking-tight text-white">
            Score
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-text)" }}
            >
              Up
            </span>
          </span>
        </div>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-sm font-semibold text-slate-300 transition-colors hover:text-white"
        >
          צור קשר
        </a>
        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} ScoreUp — כל הזכויות שמורות.
        </p>
      </div>
    </footer>
  );
}
