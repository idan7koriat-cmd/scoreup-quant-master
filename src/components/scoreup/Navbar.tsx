import { useState } from "react";
import { Sigma, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="glass-panel relative w-full max-w-md rounded-3xl p-8">
        <button
          onClick={onClose}
          aria-label="סגור"
          className="absolute end-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-2xl font-extrabold text-foreground">צור קשר</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          השאר פרטים ונחזור אליך בהקדם.
        </p>
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
            toast.success("תודה! קיבלנו את הפרטים ונחזור אליך בהקדם");
          }}
        >
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="שם מלא"
            className="w-full rounded-2xl border border-input bg-background/60 px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="אימייל או טלפון"
            className="w-full rounded-2xl border border-input bg-background/60 px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="w-full rounded-2xl py-3.5 text-base font-bold text-white shadow-md transition-transform hover:scale-[1.01]"
            style={{ background: "var(--gradient-cta)" }}
          >
            שלח
          </button>
        </form>
      </div>
    </div>
  );
}

export function Navbar() {
  const [contact, setContact] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      {contact && <ContactModal onClose={() => setContact(false)} />}
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
          <button
            onClick={() => setContact(true)}
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            צור קשר
          </button>
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
