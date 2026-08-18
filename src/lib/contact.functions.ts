import { createServerFn } from "@tanstack/react-start";

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

    const apiKey = process.env["RESEND_API_KEY"];
    const supportEmail = process.env["VITE_SUPPORT_EMAIL"];
    if (!apiKey || !supportEmail) {
      console.error("[sendContactMessage] RESEND_API_KEY or VITE_SUPPORT_EMAIL missing");
      return { ok: false, reason: "not_configured" };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ScoreUp <onboarding@resend.dev>",
        to: [supportEmail],
        reply_to: email,
        subject: `פנייה חדשה מ-${name || email} — ScoreUp`,
        text: `מאת: ${name || "(לא צוין שם)"} <${email}>\n\n${message}`,
      }),
    });

    if (!res.ok) {
      console.error("[sendContactMessage] Resend error:", res.status, await res.text());
      return { ok: false, reason: "send_failed" };
    }

    return { ok: true };
  });
