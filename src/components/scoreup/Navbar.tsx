import { GraduationCap } from "lucide-react";

const links = [
  { href: "#practice", label: "תרגול" },
  { href: "#why", label: "יתרונות" },
  { href: "#how", label: "איך זה עובד" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="#" className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-md"
            style={{ background: "var(--gradient-primary)" }}
          >
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            Score<span className="text-primary">Up</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#practice"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.03]"
          style={{ background: "var(--gradient-primary)" }}
        >
          התחל עכשיו
        </a>
      </div>
    </header>
  );
}
