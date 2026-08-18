import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { sendContactMessage } from "@/lib/contact.functions";
import { SUPPORT_EMAIL } from "@/lib/support";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** מחליף את קישורי ה-mailto: פותח מודאל ששולח הודעה בפועל למייל התמיכה דרך השרת. */
export function ContactButton({ className, children }: { className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && <ContactModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    try {
      const res = await sendContactMessage({ data: { name, email, message } });
      if (!res.ok) {
        toast.error(
          res.reason === "invalid"
            ? "בדוק שהזנת מייל תקין והודעה"
            : "לא הצלחנו לשלוח את ההודעה כרגע — אפשר גם לפנות ישירות למייל למטה",
        );
        setSending(false);
        return;
      }
      toast.success("ההודעה נשלחה! נחזור אליך בהקדם");
      onClose();
    } catch {
      toast.error("לא הצלחנו לשלוח את ההודעה כרגע, נסה שוב");
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-3xl p-7">
        <h3 className="text-xl font-extrabold text-foreground">צור קשר</h3>
        <p className="mt-1 text-sm text-muted-foreground">נשמח לעזור — נחזור אליך במייל בהקדם.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-foreground">
              שם (לא חובה)
            </label>
            <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="השם שלך" />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-foreground">
              אימייל
            </label>
            <Input
              id="contact-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-foreground">
              הודעה
            </label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="איך נוכל לעזור?"
              className="min-h-[120px] resize-none"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-bold text-foreground hover:bg-secondary"
          >
            ביטול
          </button>
          <button
            onClick={submit}
            disabled={sending || !email.trim() || !message.trim()}
            className="flex-1 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: "var(--gradient-cta)" }}
          >
            {sending ? "שולח…" : "שלח הודעה"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          אפשר גם ישירות ל-
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline" dir="ltr">
            {SUPPORT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}
