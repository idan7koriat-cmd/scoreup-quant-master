/**
 * בהרשמה דרך OAuth (Google) אין נקודת קוד ייעודית אחרי ה-redirect בחזרה לאתר, אז
 * מזהים "משתמש טרי" לפי הפרש קטן בין created_at ל-last_sign_in_at. חלון של 2 דקות
 * משאיר מרווח בטוח בלי לסכן false positive על משתמש חוזר.
 *
 * שימוש: אך ורק למעקב אירועי פיקסל חד-פעמיים (Meta CompleteRegistration) — לא מתאים
 * לחסימת גישה, כי משתמש שסוגר את מסך complete-signup וחוזר אחרי שהחלון חלף כבר לא
 * ייחשב "טרי" יותר. לחסימת גישה משתמשים ב-CONSENT_FLOW_LAUNCH_DATE למטה.
 */
export function isFreshOAuthSignup(user: {
  created_at: string;
  last_sign_in_at?: string | null;
}): boolean {
  const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
  const lastSignInAt = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
  return createdAt > 0 && Math.abs(lastSignInAt - createdAt) < 120_000;
}

/**
 * כל משתמש עם created_at מוקדם יותר נרשם לפני שמסך הסכמת ה-OAuth (complete-signup)
 * הופעל, ולכן לא היה לו אף פעם סיכוי לעבור אותו — לא ניתן/צריך לחסום אותו רטרואקטיבית
 * (טיפול נפרד בדיעבד, מחוץ לסקופ). זהו הקריטריון שמשמש את ה-guards ב-dashboard/practice/
 * profile — תאריך הרשמה מוחלט, לא חלון זמן יחסי כמו isFreshOAuthSignup.
 */
export const CONSENT_FLOW_LAUNCH_DATE = new Date("2026-09-01T00:00:00Z");
