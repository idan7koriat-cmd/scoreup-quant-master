import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useInView } from "@/hooks/useInView";

const faqs = [
  {
    q: "מה ההבדל בין תרגול רגיל לסימולציית מבחן?",
    a: "בתרגול רגיל אתה מקבל משוב ופתרון מלא מיד אחרי כל שאלה. בסימולציית מבחן אתה עונה על 20 שאלות ב-20 דקות בדיוק כמו ביום האמת, והמשוב מתגלה רק בסוף — כדי לתרגל גם את ניהול הזמן והלחץ, לא רק את החומר.",
  },
  {
    q: "איך המערכת מחליטה על מה לתרגל אותי?",
    a: "המערכת עוקבת אחרי הדיוק והמהירות שלך בכל נושא, ובונה מסלול תרגול שמתמקד בדיוק בנקודות שבהן אתה מתקשה — במקום לתת לכולם את אותה חוברת תרגילים.",
  },
  {
    q: "כמה זה עולה, ומה אפשר לעשות בחינם?",
    a: "בחינם: 3 שאלות ביום עם ניתוח ביצועים בסיסי. מנוי חודשי גמיש עולה ₪99 וניתן לבטל בכל עת. יש גם חבילת מרתון של 60 יום ב-₪149 בתשלום חד-פעמי, בלי חיוב חוזר.",
  },
  {
    q: "מצאתי שאלה שגויה או מנוסחת בצורה מוזרה — מה עושים?",
    a: 'כל שאלה בתרגול כוללת כפתור "דווח על שאלה" — פשוט מסמנים מה הבעיה (תשובה שגויה, ניסוח לא ברור, רמת קושי לא מתאימה) ואנחנו בודקים את זה. ככה המאגר משתפר עם הזמן.',
  },
  {
    q: "אני עדיין צריך מורה פרטי או קורס הכנה?",
    a: "תלוי בך — יש כאלה שמשלבים ScoreUp עם מורה פרטי, ויש כאלה שמסתפקים בתרגול עצמאי כי כל שאלה מגיעה עם פתרון מלא שלב-אחר-שלב, לא רק תשובה סופית. ScoreUp לא מבטיח תוצאה, אבל נותן לך תרגול ממוקד במקום לנחש לבד מה לתרגל.",
  },
  {
    q: "זה עובד גם מהנייד?",
    a: "כן — ScoreUp הוא אתר, לא צריך להתקין כלום. הוא עובד מהדפדפן בנייד, בטאבלט ובמחשב, ואפשר להמשיך תרגול בדיוק מאיפה שעצרת.",
  },
];

export function Faq() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="py-24" style={{ background: "var(--gradient-subtle)" }}>
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`mx-auto max-w-2xl text-center ${inView ? "su-rise-in" : "opacity-0"}`}
        >
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
            שאלות נפוצות
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            כל מה שרצית לדעת לפני שמתחילים
          </h2>
        </div>

        <div
          className={`mx-auto mt-12 max-w-2xl rounded-[20px] border border-border bg-card px-6 ${inView ? "su-rise-in" : "opacity-0"}`}
          style={{ boxShadow: "var(--shadow-card)", animationDelay: "80ms" }}
        >
          <Accordion type="single" collapsible>
            {faqs.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="text-base font-bold text-foreground">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
