import { Sigma } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { SUPPORT_EMAIL } from "@/lib/support";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="#" className="flex items-center gap-2.5">
          <span
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg"
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
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          <button
            onClick={() =>
              toast("המדריך המלא יעלה בקרוב — נעדכן אותך במייל 📘")
            }
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            איך ללמוד
          </button>
          <Link
            to="/pricing"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            תכניות ומנויים
          </Link>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            צור קשר
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            search={{ mode: "signin" as const }}
            className="rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            התחברות
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" as const }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.03]"
            style={{ background: "var(--gradient-cta)" }}
          >
            התחל לתרגל
          </Link>
        </div>
      </div>
    </header>
  );
}
