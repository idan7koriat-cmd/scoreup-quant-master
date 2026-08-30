declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] };
  }
}

const META_PIXEL_ID = "2033452064203833";

/**
 * Meta Advanced Matching דורש PII לא-גלוי: SHA-256 hex, על ערך ה-email אחרי
 * trim+lowercase (בדיוק כמו ב-TikTok AAM) — אחרת ה-hash לא יתאים לזה שבצד השרת של Meta.
 */
async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * מזהה את המשתמש מול הפיקסל (Advanced Matching) לפני שליחת אירוע ההרשמה, כדי ש-Meta
 * יוכל לשייך את ה-conversion למשתמש האמיתי ולא רק לעוגיית הדפדפן.
 */
export async function identifyMetaUser(info: { email?: string; phone?: string }) {
  if (typeof window === "undefined" || !window.fbq) return;
  try {
    const matchParams: Record<string, string> = {};
    if (info.email) matchParams.em = await sha256Hex(info.email);
    if (info.phone) matchParams.ph = await sha256Hex(info.phone.replace(/\D/g, ""));
    if (Object.keys(matchParams).length === 0) return;
    window.fbq("init", META_PIXEL_ID, matchParams);
  } catch (e) {
    console.error("[metaPixel] identify failed", e);
  }
}

export function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params);
}

/**
 * דדופ בין נתיב ההרשמה באימייל/סיסמה (מדווח מיד אחרי signUp) לנתיב ה-OAuth (מדווח
 * לפי זיהוי "משתמש טרי" ב-session, כי אין hook ישיר אחרי redirect חזרה מ-Google) —
 * כדי שלא נשלח CompleteRegistration פעמיים לאותו משתמש.
 */
function trackedKey(userId: string) {
  return `scoreup-meta-registration-tracked-${userId}`;
}

export function hasTrackedMetaRegistration(userId: string): boolean {
  try {
    return window.sessionStorage.getItem(trackedKey(userId)) === "1";
  } catch {
    return false;
  }
}

export function markMetaRegistrationTracked(userId: string) {
  try {
    window.sessionStorage.setItem(trackedKey(userId), "1");
  } catch {
    /* אחסון חסום — נוותר על ה-dedup עבור המשתמש הזה */
  }
}
