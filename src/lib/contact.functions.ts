import { createServerFn } from "@tanstack/react-start";
import { sendServiceEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SendContactMessageResult = { ok: true } | { ok: false; reason: "invalid" | "not_configured" | "send_failed" };

/** שולח הודעת "צור קשר" למייל התמיכה דרך Resend. פתוח לכולם (גם לא מחוברים) — אין requireExtAuth. */
export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; email: string; message: string }) => input)
  .handler(async ({ data }): Promise<SendContactMessageResult> => {
    const payload = (data as any)?.data ?? data;
    const name = String(payload.name ?? "").trim().slice(0, 100);
    const email = String(payload.email ?? "").trim().slice(0, 200);
    const message = String(payload.message ?? "").trim().slice(0, 5000);

    if (!EMAIL_RE.test(email) || !message) {
      return { ok: false, reason: "invalid" };
    }

    const supportEmail = process.env["VITE_SUPPORT_EMAIL"];
    if (!supportEmail) {
      console.error("[sendContactMessage] VITE_SUPPORT_EMAIL missing");
      return { ok: false, reason: "not_configured" };
    }

    const result = await sendServiceEmail({
      to: supportEmail,
      replyTo: email,
      subject: `פנייה חדשה מ-${name || email} — ScoreUp`,
      text: `מאת: ${name || "(לא צוין שם)"} <${email}>\n\n${message}`,
    });

    if (!result.ok) return result;
    return { ok: true };
  });
