import { getRequest } from "@tanstack/react-start/server";

export type SendEmailResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };

type SendEmailInput = { to: string; subject: string; text: string; replyTo?: string };

/** שולח מייל דרך Resend. שימוש ישיר רק ל"הודעות שירות" — למיילי דיוור יש להשתמש ב-sendMarketingEmail. */
export async function sendServiceEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.error("[sendServiceEmail] RESEND_API_KEY missing");
    return { ok: false, reason: "not_configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "ScoreUp <onboarding@resend.dev>",
      to: [input.to],
      subject: input.subject,
      text: input.text,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    console.error("[sendServiceEmail] Resend error:", res.status, await res.text());
    return { ok: false, reason: "send_failed" };
  }
  return { ok: true };
}

/** בונה את ה-origin של הבקשה הנוכחית (אין env var לדומיין הציבורי כרגע). */
function getSiteOrigin(): string {
  const request = getRequest();
  const url = request?.url ? new URL(request.url) : null;
  return url?.origin ?? "";
}

export type SendMarketingEmailResult =
  | { ok: true }
  | { ok: false; reason: "no_consent" | "not_configured" | "send_failed" };

type SendMarketingEmailInput = {
  userId: string;
  to: string;
  subject: string;
  text: string;
  supabase: any;
};

/**
 * מייל "דיוור/תזכורת": נבדק מול marketing_consent בפועל בכל שליחה (לא רק בזמן
 * ההרשמה), ומקבל אוטומטית פוטר הסרה עם לינק unsubscribe.
 */
export async function sendMarketingEmail(input: SendMarketingEmailInput): Promise<SendMarketingEmailResult> {
  const { data } = await input.supabase
    .from("profiles")
    .select("marketing_consent")
    .eq("id", input.userId)
    .maybeSingle();

  if (!(data as any)?.marketing_consent) {
    return { ok: false, reason: "no_consent" };
  }

  const unsubscribeUrl = `${getSiteOrigin()}/unsubscribe?uid=${input.userId}`;
  const text = `${input.text}\n\n---\nלא מעוניין/ת לקבל עדכונים נוספים? הסרה מרשימת התפוצה: ${unsubscribeUrl}`;

  const result = await sendServiceEmail({ to: input.to, subject: input.subject, text });
  return result;
}
