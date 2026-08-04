# תיקון: "Unsupported provider: provider is not enabled"

## מה מצאתי (מאומת בקוד)

- כפתור "התחברות מהירה באמצעות Google" ב-`src/routes/auth.tsx` קורא ל-`supabase.auth.signInWithOAuth({ provider: "google" })` מול **פרויקט ה-Supabase החיצוני שלך** (הלקוח מ-`src/lib/extAuthClient.ts`, שמשתמש ב-`EXT_SUPABASE_URL` / `EXT_SUPABASE_ANON_KEY`).
- ההודעה `validation_failed / Unsupported provider: provider is not enabled` מגיעה משרת האימות של אותו פרויקט: ספק Google פשוט לא מופעל שם.
- הכלי המנוהל של Lovable להפעלת Google עובד רק על ה-backend המובנה, ולא על הפרויקט החיצוני — אין לי גישת ניהול אליו, ולכן ההפעלה חייבת להתבצע על ידך.
- אימייל + סיסמה ממשיך לעבוד כרגיל; רק Google נכשל.

## מה צריך לעשות (בצד שלך, פעם אחת)

בפרויקט החיצוני, תחת Authentication → Providers → Google:
1. להפעיל את הספק.
2. להזין Client ID ו-Client Secret מ-Google Cloud (OAuth Client מסוג Web application).
3. ב-Google Cloud, להוסיף כ-Authorized redirect URI את כתובת ה-callback שמוצגת שם: `https://<project-ref>.supabase.co/auth/v1/callback`.
4. תחת URL Configuration להוסיף ל-Redirect URLs את כתובות האפליקציה (כתובת התצוגה המקדימה וכתובת הפרסום העתידית).

## מה אני אעשה בקוד

1. **טיפול שגיאות ברור** ב-`src/routes/auth.tsx`: כשהשרת מחזיר `provider is not enabled`, להציג הודעה מובנת בעברית ("התחברות עם Google עדיין לא מופעלת — התחבר עם אימייל וסיסמה") במקום שגיאה גולמית.
2. **הסתרה אוטומטית של כפתור Google** כשהספק אינו מופעל — בדיקה חד-פעמית מול נקודת ה-settings של הפרויקט החיצוני, כדי שלא יוצג כפתור שנכשל.
3. **תיקון ה-redirect**: כרגע ה-OAuth חוזר ישירות ל-`/dashboard`. אחליף ל-`window.location.origin` ואשמור את היעד בנפרד, כדי שהחזרה מגוגל לא תיפול לפני שהסשן נטען.

## אחרי שתפעיל את הספק

אריץ בדיקה מקצה לקצה ואוודא שהכפתור חוזר להופיע ושההתחברות מסתיימת בדשבורד.
