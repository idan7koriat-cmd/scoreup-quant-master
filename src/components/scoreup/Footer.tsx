import { Sigma } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="border-t py-10 text-white/75"
      style={{ background: "var(--petrol-deep)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sigma className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-display font-bold tracking-tight text-white">
            Score
            <span style={{ color: "var(--petrol-tint)" }}>Up</span>
          </span>
        </div>
        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} ScoreUp — כל הזכויות שמורות.
        </p>
      </div>
    </footer>
  );
}
