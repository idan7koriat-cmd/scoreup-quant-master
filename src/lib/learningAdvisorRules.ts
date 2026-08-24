export type TopicStat = { topic: string; total: number; correct: number };

export type AdvisorTone = "no-data" | "partial-data" | "strong" | "mixed" | "weak";

export type TopicSignal = { topic: string; accuracy: number };

export type AdvisorResult = {
  headline: string;
  detail: string;
  recommendedTopic: string | null;
  recommendedDifficulty: number | null;
  tone: AdvisorTone;
  /** נושאים שהאבחנה מתייחסת אליהם בפועל, עם הדיוק שלהם — לתצוגה ויזואלית שמגבה את המשפט. */
  topicSignals: TopicSignal[];
};

const MIN_RELIABLE_SAMPLES = 5;
const STRONG_OVERALL_THRESHOLD = 0.8;
const WEAK_TOPIC_THRESHOLD = 0.5;
const EXAM_URGENCY_DAYS = 14;

/** בוחר תבנית באופן דטרמיניסטי לפי seed, כדי שאותו חישוב תמיד יחזיר את אותה תבנית עד לחישוב הבא. */
function pick<T>(templates: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return templates[hash % templates.length];
}

function pct(stat: TopicStat): number {
  return stat.total ? stat.correct / stat.total : 0;
}

const NO_DATA_TEMPLATES = [
  { headline: "בואו נתחיל לבנות תמונה 🎯", detail: "עוד לא פתרת שאלות — כמה שאלות ראשונות וכבר נדע לכוון אותך." },
  { headline: "המסע רק מתחיל 🚀", detail: "תרגול ראשון קטן, ומכאן נתחיל להכיר את החוזקות שלך." },
  { headline: "בוא נכיר אותך קצת 👋", detail: "אחרי כמה שאלות נדע בדיוק איפה כדאי להתמקד." },
];

const PARTIAL_DATA_TEMPLATES = [
  { headline: "כמעט שם — עוד קצת נתונים 📊", detail: "עוד כמה שאלות בכל נושא ונוכל לתת לך המלצה מדויקת." },
  { headline: "בונים תמונה מדויקת יותר 🔍", detail: "ממשיכים לתרגל משולב, ובקרוב נדע בדיוק איפה להתמקד." },
];

const STRONG_TEMPLATES = [
  (strong: string[]) => `${strong.join(" נפץ, ")} נפץ 💪`,
  (strong: string[]) => `${strong.join(" ו")} פשוט פצצה 🔥`,
  (strong: string[]) => `${strong[0]} כבר בכיס 😎`,
];

const MIXED_TEMPLATES = [
  (strong: string, weak: string) => `ב${strong} אתה נפץ, ${weak} עוד מחכה לך`,
  (strong: string, weak: string) => `${strong} פצצה — עכשיו התור של ${weak}`,
  (strong: string, weak: string) => `חזק ב${strong}, ובוא ניקח את ${weak} לאותה רמה`,
];

const WEAK_TEMPLATES = [
  (weak: string) => `בוא נעלה הילוך ב${weak} 💪`,
  (weak: string) => `${weak} — הזמן להתמקד ולסגור פערים`,
  (weak: string) => `עוד קצת תרגול ו${weak} יהיה בכיס`,
];

/**
 * בנק ניסוחים לתגובה המיידית "עכשיו הרגע" בסיום תרגול — הופעל הרבה יותר תדיר מהאבחנה
 * המצטברת (כל תרגול, לא כל 3 ימים), אז נדרש מגוון רחב כדי שלא ירגיש כמו "כל הכבוד" קבוע.
 * הניסוח נשען על עידוד ממוקד-מאמץ/התקדמות (ולא שבח גנרי) — בהשראת הממצא של Duolingo
 * שניסוח "growth mindset" מנצח שבח גנרי בשימור משתמשים.
 */
type SessionTemplate = (score: number, total: number, topic: string) => string;

const SESSION_PERFECT: SessionTemplate[] = [
  (s, t, topic) => `${s}/${t} ב${topic} — נקי לגמרי, ממש מרשים 🎯`,
  (s, t, topic) => `לא פספסת אף שאלה ב${topic} (${s}/${t}) — ברמה הזו`,
  (s, t) => `${s} מתוך ${t} — סבב מושלם, ככה עושים את זה`,
  (s, t, topic) => `${topic} בלי אף טעות (${s}/${t}) — תרגיש את זה`,
];

const SESSION_GREAT: SessionTemplate[] = [
  (s, t, topic) => `${s}/${t} ב${topic} — קצב מצוין, ממשיכים ככה`,
  (s, t) => `${s} מתוך ${t} — ניכר שהעבודה משתלמת`,
  (s, t, topic) => `רוב התשובות ב${topic} נכונות (${s}/${t}) — יפה מאוד`,
  (s, t) => `${s}/${t} — כיוון ממש טוב בתרגול הזה`,
  (s, t, topic) => `${topic}: ${s} מתוך ${t} — הביטחון שלך בנושא הזה עולה`,
];

const SESSION_GOOD: SessionTemplate[] = [
  (s, t, topic) => `${s}/${t} ב${topic} — התקדמות אמיתית, המשך לתרגל`,
  (s, t) => `${s} מתוך ${t} — לא רע בכלל, ויש עוד לאן לגדול`,
  (s, t, topic) => `חצי מהדרך ב${topic} כבר בכיס (${s}/${t})`,
  (s, t) => `${s}/${t} — כל תרגול כזה מקרב אותך`,
];

const SESSION_ROUGH: SessionTemplate[] = [
  (s, t, topic) => `${s}/${t} ב${topic} הפעם — בדיוק בשביל זה מתרגלים, נתמקד בזה`,
  (s, t) => `${s} מתוך ${t} — סבב מאתגר, אבל ככה מזהים בדיוק מה לחזק`,
  (s, t, topic) => `${topic} דרש מאמץ הפעם (${s}/${t}) — בוא נחזור עליו ברמה נוחה יותר`,
  (s, t) => `${s}/${t} — לא הסבב הכי חלק, וזה בסדר גמור. ממשיכים`,
];

function pickSessionTemplate(bank: SessionTemplate[]): SessionTemplate {
  return bank[Math.floor(Math.random() * bank.length)]!;
}

/**
 * תגובה מיידית וממוקדת-הישג לתרגול שהרגע הסתיים — נפרדת מהאבחנה המצטברת (buildAdvice),
 * מחושבת כולה בצד הלקוח (אין צורך בשרת: score/total כבר ידועים ברגע שהתרגול נגמר).
 * topic: שם הנושא אם התרגול היה ממוקד נושא יחיד, אחרת "בתרגול האחרון".
 */
export function buildSessionReaction(score: number, total: number, topic: string | null): string {
  if (total <= 0) return "";
  const ratio = score / total;
  // שם-עצם "גולמי" (בלי מילת יחס) — כל התבניות למעלה מוסיפות "ב" בעצמן, למשל ב${topicLabel}.
  const topicLabel = topic ?? "תרגול האחרון";
  const bank =
    ratio === 1 && total >= 3
      ? SESSION_PERFECT
      : ratio >= 0.8
        ? SESSION_GREAT
        : ratio >= 0.5
          ? SESSION_GOOD
          : SESSION_ROUGH;
  return pickSessionTemplate(bank)(score, total, topicLabel);
}

/**
 * מנוע חוקים טהור (ללא I/O) שהופך פילוח דיוק לפי נושא לתובנה אנושית + המלצת תרגול.
 * seed קובע איזו תבנית ניסוח נבחרת, כדי שהניסוח לא ישתנה בכל רינדור אך יתחלף בין חישובים.
 */
export function buildAdvice(
  byTopic: TopicStat[],
  daysToExam: number | null,
  seed: string,
): AdvisorResult {
  const totalSolved = byTopic.reduce((sum, t) => sum + t.total, 0);

  if (totalSolved === 0) {
    const t = pick(NO_DATA_TEMPLATES, seed);
    return { ...t, recommendedTopic: null, recommendedDifficulty: null, tone: "no-data", topicSignals: [] };
  }

  const reliable = byTopic.filter((t) => t.total >= MIN_RELIABLE_SAMPLES);
  if (reliable.length === 0) {
    const t = pick(PARTIAL_DATA_TEMPLATES, seed);
    return {
      ...t,
      recommendedTopic: null,
      recommendedDifficulty: null,
      tone: "partial-data",
      topicSignals: [],
    };
  }

  const withUrgency = (detail: string) => {
    if (daysToExam == null || daysToExam > EXAM_URGENCY_DAYS || daysToExam < 0) return detail;
    return `${detail} עוד ${daysToExam} ימים לבחינה — כדאי לנצל את הזמן.`;
  };

  const sorted = [...reliable].sort((a, b) => pct(b) - pct(a));
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const overallAccuracy =
    reliable.reduce((s, t) => s + t.correct, 0) / reliable.reduce((s, t) => s + t.total, 0);

  if (overallAccuracy >= STRONG_OVERALL_THRESHOLD) {
    const strongStats = sorted.slice(0, Math.min(2, sorted.length));
    const headline = pick(STRONG_TEMPLATES, seed)(strongStats.map((t) => t.topic));
    return {
      headline,
      detail: withUrgency("אתה שולט בחומר ברמה גבוהה — הזמן לעלות רמת קושי או לנסות סימולציית פרק מלאה."),
      recommendedTopic: strongest.topic,
      recommendedDifficulty: null,
      tone: "strong",
      topicSignals: strongStats.map((t) => ({ topic: t.topic, accuracy: pct(t) })),
    };
  }

  if (pct(weakest) < WEAK_TOPIC_THRESHOLD) {
    const headline = pick(WEAK_TEMPLATES, seed)(weakest.topic);
    const hasStrong = sorted.length > 1 && pct(strongest) >= 0.7;
    const detail = hasStrong
      ? `ב${strongest.topic} אתה כבר מוכיח שאתה מסוגל — בוא ניקח את אותה גישה ל${weakest.topic}.`
      : `נתמקד ב${weakest.topic} עם שאלות ברמה נוחה יותר, ונבנה משם ביטחון.`;
    const topicSignals: TopicSignal[] = [{ topic: weakest.topic, accuracy: pct(weakest) }];
    if (hasStrong) topicSignals.push({ topic: strongest.topic, accuracy: pct(strongest) });
    return {
      headline,
      detail: withUrgency(detail),
      recommendedTopic: weakest.topic,
      recommendedDifficulty: 1,
      tone: "weak",
      topicSignals,
    };
  }

  const headline = pick(MIXED_TEMPLATES, seed)(strongest.topic, weakest.topic);
  return {
    headline,
    detail: withUrgency(`יש לך תמונה מאוזנת — קצת תרגול ממוקד ב${weakest.topic} וההתקדמות תהיה מהירה.`),
    recommendedTopic: weakest.topic,
    recommendedDifficulty: null,
    tone: "mixed",
    topicSignals: [
      { topic: strongest.topic, accuracy: pct(strongest) },
      { topic: weakest.topic, accuracy: pct(weakest) },
    ],
  };
}
