# יצירת שאלות תרגול — pipeline אוטומטי

מחליף את התהליך הידני ב-Claude.ai Projects: שני סוכני Claude (יצירה → בדיקת איכות), עם JSON schema קשיח לסוכן היוצר ופענוח טקסט חופשי לסוכן ה-QA (שהוא dual-mode: "הכל תקין" קצר, או תיקונים + JSON מלא).

**יצירה תמיד dry-run.** `generate-questions` לא כותב ל-Supabase — הוא רק מפיק קובץ JSON וקובץ SQL ב-`scripts/output/`. העלאה בפועל היא שלב נפרד ומפורש, ראה "העלאה ל-Supabase" למטה.

## הרצה ראשונה

1. `npm install` / `bun install` — כדי להתקין את `@anthropic-ai/sdk` שנוסף ל-package.json.
2. ודא ש-`ANTHROPIC_API_KEY` קיים ב-`.env.local` בשורש הפרויקט (bun טוען אותו אוטומטית).
3. העתק את `scripts/input/source-questions.example.txt` ל-`scripts/input/source-questions.txt` ומלא שאלות מקור אמיתיות (הקובץ הזה מוגן מ-git). הכמות גמישה — פחות אם יש הרבה איורים/גיאומטריה, יותר (גם 8-9) אם זה בעיקר טקסט פשוט.
4. הרץ:

```bash
bun run generate-questions
```

או עם קובץ מקור אחר: `bun scripts/generate-questions.ts path/to/other-file.txt`

## מה קורה בכל הרצה

1. **סוכן 1** מקבל את קובץ השאלות, מייצר batch חדש. הפלט מוגבל ב-structured output ל-JSON schema קבוע — זה מבטיח שהמבנה (שמות שדות, טיפוסים, ערכי topic חוקיים) תקין, **לא** שהמתמטיקה/הניסוח נכונים.
2. **סוכן 2** מקבל את הפלט, בודק לעומק (מתמטיקה, מסיחים, LaTeX, SVG). אם הכל תקין — מחזיר משפט אישור קצר בלבד; אם לא — מחזיר תיקונים + JSON מתוקן מלא.
3. הסקריפט מזהה איזה משני המצבים חזר, ומריץ אימות סכימה מקומי נוסף (רשת ביטחון) על כל שאלה בנפרד.
4. פלט: `scripts/output/batch-<timestamp>.json` ו-`.sql` (שניהם מוגנים מ-git — מכילים תוכן שנוצר מתוכן מבחנים).
5. סיכום מודפס לקונסולה: כמה שאלות נוצרו, האם היו תיקוני QA, כמה עברו/נכשלו אימות מקומי ולמה.

## עלות/מודל

שני הסוכנים רצים על `claude-opus-5` עם `effort: high` — לאיכות מתמטית מקסימלית. אם תרצה לחסוך עלות בעתיד, אפשר להוריד את סוכן היצירה ל-`claude-sonnet-5` ולהשאיר את הבודק על Opus (שער האיכות הקריטי).

## העלאה ל-Supabase

`upload-questions` מעלה קובץ batch (JSON) שכבר נוצר, ישירות לטבלת `questions` — בלי מפתח `service_role` ובלי הדבקה ידנית ב-SQL Editor. שאלות בלי `id` נוספות כחדשות; שאלות עם `id` (למשל תיקון שאלה קיימת) מעדכנות את השורה הקיימת במקום, ונכשלות בבירור אם ה-id לא קיים.

**גישה מוגבלת בכוונה:** ההעלאה עוברת דרך פונקציית Postgres יחידה (`upsert_questions`, ב-`supabase/migrations/20260813230407_upsert_questions_rpc.sql`) שמוגנת בסוד (`QUESTION_WRITER_SECRET`) — לא ב-`service_role` ולא ב-policy שפותח INSERT/UPDATE למפתח ה-anon הציבורי. גם אם הסוד דולף, אפשר רק להכניס/לעדכן שורות בטבלת `questions` — שום טבלה אחרת, שום SELECT/DELETE.

### הרצה ראשונה (חד-פעמי)

1. פתח את `supabase/migrations/20260813230407_upsert_questions_rpc.sql`.
2. החלף את `<value from .env.local QUESTION_WRITER_SECRET>` בערך האמיתי מ-`.env.local`.
3. הדבק את כל הקובץ ב-SQL Editor של Supabase והרץ (Run).
4. זהו — `QUESTION_WRITER_SECRET` כבר נמצא ב-`.env.local` (נוצר אוטומטית) ולא צריך לגעת בו.

### שימוש

```bash
bun run upload-questions scripts/output/batch-<timestamp>.json            # dry-run — מדפיס תוכנית בלבד
bun run upload-questions scripts/output/batch-<timestamp>.json --confirm  # מעלה בפועל
```

בלי `--confirm` שום דבר לא נשלח לרשת — תמיד אפשר (וכדאי) לבדוק את התוכנית המודפסת קודם.
