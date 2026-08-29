declare global {
  interface Window {
    ttq?: {
      identify: (info: Record<string, string>) => void;
      track: (event: string, params?: Record<string, unknown>) => void;
    };
  }
}

/**
 * TikTok Advanced Matching (AAM) דורש PII לא-גלוי: SHA-256 hex, על ערך ה-email אחרי
 * trim+lowercase (כפי שמסמכי TikTok מפרטים — אחרת ה-hash לא יתאים לזה שבצד השרת שלהם).
 */
async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * מזהה את המשתמש מול הפיקסל (email מוצפן) לפני שליחת אירוע ההרשמה, כדי ש-TikTok יוכל
 * לשייך את ה-conversion למשתמש האמיתי (Advanced Matching) ולא רק לעוגיית הדפדפן.
 */
export async function identifyTikTokUser(email: string) {
  if (typeof window === "undefined" || !window.ttq) return;
  try {
    const hashedEmail = await sha256Hex(email);
    window.ttq.identify({ email: hashedEmail });
  } catch (e) {
    console.error("[tiktokPixel] identify failed", e);
  }
}

export function trackTikTokEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.ttq) return;
  window.ttq.track(event, params);
}
