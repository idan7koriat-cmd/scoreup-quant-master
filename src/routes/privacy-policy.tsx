import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/scoreup/LegalLayout";
import { SUPPORT_EMAIL } from "@/lib/support";

export const Route = createFileRoute("/privacy-policy")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "מדיניות פרטיות — ScoreUp" },
      {
        name: "description",
        content: "מדיניות הפרטיות של ScoreUp — אילו נתונים נאספים, כיצד הם נשמרים ומשמשים אותנו.",
      },
      { property: "og:title", content: "מדיניות פרטיות — ScoreUp" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PrivacyPolicyPage,
});

const SECTIONS = [
  { id: "general", title: "1. כללי" },
  { id: "data-collected", title: "2. איזה מידע נאסף" },
  { id: "signup-messages", title: "3. הרשמה ושליחת הודעות" },
  { id: "data-use", title: "4. כיצד אנו משתמשים במידע" },
  { id: "payments", title: "5. מדיניות תשלומים והחזרים" },
  { id: "sharing-security", title: "6. שיתוף מידע וצדדים שלישיים ואבטחת מידע" },
  { id: "cookies", title: "7. Cookies וטכנולוגיות מעקב" },
  { id: "rights", title: "8. זכויות המשתמש" },
  { id: "minors", title: "9. פרטיות קטינים" },
  { id: "changes", title: "10. שינויים במדיניות הפרטיות" },
  { id: "contact", title: "11. יצירת קשר" },
];

const PROVIDERS = [
  { name: "Supabase", role: "אחסון בסיס הנתונים והזדהות משתמשים" },
  { name: "Vercel", role: "אחסון והרצת האתר (hosting)" },
  { name: "Google", role: "התחברות (OAuth)" },
  { name: "Resend", role: 'שליחת הודעות דוא"ל' },
  { name: "PostHog", role: "ניתוח שימוש והקלטת מסך אנונימית" },
];

function PrivacyPolicyPage() {
  return (
    <LegalLayout title="מדיניות פרטיות – ScoreUp" updatedAt="22 באוגוסט 2026" sections={SECTIONS}>
      <LegalSection id="general" title="1. כללי">
        <p>
          1.1 מדיניות פרטיות זו מסבירה כיצד עידן קוריאט, עוסק פטור ("החברה", "אנחנו"), המפעילה את
          אתר ScoreUp ("האתר"), אוספת, משתמשת, שומרת ומגנה על המידע האישי שלך.
        </p>
        <p>
          1.2 השימוש באתר מהווה הסכמה למדיניות פרטיות זו. אם אינך מסכימ/ה לתנאיה, אנא הימנע/י משימוש
          באתר.
        </p>
        <p>
          1.3 החברה מכבדת את פרטיות המשתמשים ופועלת בהתאם לחוק הגנת הפרטיות, התשמ"א-1981, ותקנותיו.
        </p>
      </LegalSection>

      <LegalSection id="data-collected" title="2. איזה מידע נאסף">
        <p className="font-semibold text-foreground">2.1 מידע שאת/ה מוסר/ת ביודעין:</p>
        <ul className="list-disc space-y-1.5 ps-5">
          <li>כתובת אימייל, שם מלא (במסגרת הרשמה או התחברות עם Google)</li>
          <li>תאריך מבחן משוער, יעד תואר/פקולטה (ככל שנמסר)</li>
          <li>תשובות לשאלות תרגול והתקדמות בלימוד</li>
        </ul>

        <p className="pt-2 font-semibold text-foreground">
          2.2 מידע הנאסף אוטומטית בעת השימוש באתר:
        </p>
        <ul className="list-disc space-y-1.5 ps-5">
          <li>
            נתוני שימוש כלליים (עמודים שנצפו, פעולות שבוצעו) באמצעות כלי אנליטיקס (PostHog), לרבות
            הקלטת מסך אנונימית (session recording) לצורך שיפור חוויית המשתמש
          </li>
          <li>כתובת IP, סוג דפדפן ומכשיר, ומידע טכני דומה</li>
        </ul>

        <p className="pt-2">
          <span className="font-semibold text-foreground">2.3 מידע ממקורות צד שלישי: </span>
          בעת התחברות עם חשבון Google, אנו מקבלים מהחשבון את השם המלא וכתובת האימייל המשויכים
          לחשבון, בהתאם להרשאות שנתת בעת ההתחברות.
        </p>
      </LegalSection>

      <LegalSection id="signup-messages" title="3. הרשמה ושליחת הודעות">
        <p>3.1 בעת ההרשמה, המשתמש מתבקש לספק פרטים מזהים (שם, אימייל וכיו"ב).</p>
        <p>
          3.2 עצם ההרשמה לאתר כוללת הסכמה לקבלת הודעות שירות – לרבות אישור הרשמה, עדכונים
          טכניים על החשבון, ותקשורת הנחוצה לתפעול השירות – בדוא"ל, הודעות טקסט או אמצעים
          דיגיטליים אחרים. הודעות שירות אלו אינן תלויות בסימון תיבת סימון נפרדת והן חלק בלתי
          נפרד מהשימוש באתר.
        </p>
        <p>
          3.3 לעומת זאת, שליחת עדכוני תוכן ותזכורות תרגול בדוא"ל מותנית בהסכמה מפורשת ונפרדת של
          המשתמש, הניתנת מרצון באמצעות תיבת סימון ייעודית שאינה מסומנת כברירת מחדל – בטופס
          ההרשמה, או במסך אישור נפרד לאחר הרשמה עם חשבון Google. אי-סימון התיבה אינו מונע השלמת
          הרשמה ואינו פוגע בגישה לשירות.
        </p>
        <p>
          3.4 המשתמש יכול לבקש בכל עת להסיר עצמו מרשימת התפוצה של עדכוני התוכן והתזכורות דרך
          לחיצה על קישור הסרה בתחתית כל הודעה כאמור, או פנייה ישירה לצוות התמיכה. הסרה כאמור
          אינה משפיעה על הודעות השירות הנשלחות בהתאם לסעיף 3.2.
        </p>
      </LegalSection>

      <LegalSection id="data-use" title="4. כיצד אנו משתמשים במידע">
        <p>אנו משתמשים במידע שנאסף לצרכים הבאים:</p>
        <ul className="list-disc space-y-1.5 ps-5">
          <li>מתן ותפעול השירות (שמירת התקדמות, התאמת תכנים)</li>
          <li>
            תקשורת עם המשתמש (הודעות שירות, מענה לפניות דרך{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} dir="ltr" className="underline">
              {SUPPORT_EMAIL}
            </a>
            , באמצעות שירות המייל Resend)
          </li>
          <li>שיפור השירות וניתוח דפוסי שימוש (PostHog)</li>
          <li>עמידה בדרישות חוק ומענה לרשויות מוסמכות, ככל שיידרש</li>
        </ul>
      </LegalSection>

      <LegalSection id="payments" title="5. מדיניות תשלומים והחזרים">
        <p>
          5.1 המנוי באתר הינו מנוי מתחדש אוטומטית. כל תשלום באתר הוא סופי ואינו ניתן להחזר אלא
          במקרים חריגים ועל פי שיקול דעת הנהלת האתר, ובכפוף לזכויות הביטול הקבועות בדין ובתקנון
          השימוש (ראו סעיפים 4-5 בתקנון השימוש).
        </p>
        <p>5.2 המשתמש אחראי לוודא כי פרטי אמצעי התשלום שלו מתאימים ומדויקים בטרם ביצוע התשלום.</p>
        <p>5.3 רכישה באתר מהווה הסכמה מלאה למדיניות זו.</p>
      </LegalSection>

      <LegalSection id="sharing-security" title="6. שיתוף מידע עם צדדים שלישיים ואבטחת מידע">
        <p>
          6.1 האתר שומר על סודיות המידע הנמסר ע"י המשתמשים, ואינו מעביר אותו לצדדים שלישיים אלא
          לצורך תפעול האתר או עפ"י דרישת רשויות החוק.
        </p>
        <p>
          6.2 האתר עושה שימוש באמצעים טכנולוגיים סבירים להגנה על הנתונים, אך אינו מתחייב לחסינות
          מוחלטת בפני פריצות, גישה בלתי מורשית או תקלות.
        </p>
        <p>
          6.3 האתר עושה שימוש בכלי ניתוח ותיעוד פעילות גולשים, ובכלל זה PostHog, על מנת לשפר את
          חוויית המשתמש, לאבחן בעיות טכניות ולנתח דפוסי שימוש כגון: אינטראקציות עם האתר (גלילה,
          הקלקות, תנועת עכבר), נתוני מכשיר ודפדפן, וזמן שהייה בדפים.
        </p>

        <p className="pt-2 font-semibold text-foreground">
          6.4 להלן ספקי השירות החיצוניים המסייעים לנו בתפעול האתר:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pe-4 text-start font-bold text-foreground">ספק</th>
                <th className="py-2 text-start font-bold text-foreground">תפקיד</th>
              </tr>
            </thead>
            <tbody>
              {PROVIDERS.map((p) => (
                <tr key={p.name} className="border-b border-border/60">
                  <td className="py-2 pe-4 font-semibold text-foreground" dir="ltr">
                    {p.name}
                  </td>
                  <td className="py-2 text-foreground/90">{p.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="pt-2">
          <span className="font-semibold text-foreground">6.5 פיקסלים שיווקיים: </span>
          האתר עושה שימוש בפיקסלים של פלטפורמות פרסום (כגון Meta ו-TikTok) לצורך מדידת יעילות
          פרסום ויחוס רכישות. פיקסלים אלו אוספים מידע על פעילות המשתמש באתר, כולל דפים שנצפו
          ופעולות שננקטו (כגון הרשמה או רכישות), המועבר לפלטפורמות הפרסום הרלוונטיות לצורך
          אופטימיזציה של קמפיינים פרסומיים.
        </p>
        <p>
          6.6 המידע הנאסף הוא סטטיסטי ואנונימי ואינו מיועד לזיהוי אישי מכוון של המשתמש. במידה וכזה
          מידע יעבור לצדדים שלישיים, הדבר יתבצע רק לצורך מתן השירותים האמורים ובהתאם לדין.
        </p>
        <p>
          6.7 אנו איננו מוכרים ואיננו משכירים מידע אישי של משתמשים לצדדים שלישיים למטרות שיווק שאינן
          שלנו.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="7. Cookies וטכנולוגיות מעקב">
        <p>
          7.1 האתר עושה שימוש בעוגיות (Cookies) ובטכנולוגיות דומות לצורך תפעול השירות (כגון שמירת
          session התחברות) וניתוח שימוש.
        </p>
        <p>
          7.2 ניתן לשלוט בהגדרות העוגיות דרך הגדרות הדפדפן, אם כי חסימת עוגיות מסוימות עלולה לפגוע
          בתפקוד האתר.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="8. זכויות המשתמש">
        <p>בהתאם לחוק הגנת הפרטיות, בידך הזכות:</p>
        <ul className="list-disc space-y-1.5 ps-5">
          <li>לעיין במידע האישי שלך השמור אצלנו</li>
          <li>לבקש תיקון של מידע שגוי או לא מעודכן</li>
          <li>
            לבקש מחיקת המידע וסגירת חשבונך, בכפוף לחובות שימור מידע לפי דין (למשל, מסמכים חשבונאיים)
          </li>
        </ul>
        <p>
          לצורך מימוש זכויות אלה, ניתן לפנות אלינו בכתובת{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} dir="ltr" className="underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="minors" title="9. פרטיות קטינים">
        <p>
          השירות עשוי לשמש גם משתמשים קטינים (מתחת לגיל 18), בעיקר תלמידי תיכון המתכוננים לבחינה
          הפסיכומטרית. אנו אוספים מקטינים רק את המידע המינימלי הנדרש לתפעול השירות (אימייל, התקדמות
          בתרגול). הורה או אפוטרופוס המעוניין לעיין, לתקן או למחוק מידע של קטין הנתון לאחריותו,
          מוזמן לפנות אלינו בכתובת{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} dir="ltr" className="underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="changes" title="10. שינויים במדיניות הפרטיות">
        <p>
          הנהלת האתר שומרת לעצמה את הזכות לעדכן מדיניות זו מעת לעת, ללא הודעה מוקדמת. תוקף העדכונים
          החל מיום פרסומם באתר. שימוש מתמשך באתר מהווה הסכמה למדיניות הפרטיות המעודכנת.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="11. יצירת קשר">
        <p>
          ניתן ליצור קשר דרך טופס יצירת הקשר באתר, או בדוא"ל:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} dir="ltr" className="underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
