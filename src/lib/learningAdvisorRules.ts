export type TopicStat = { topic: string; total: number; correct: number };

export type AdvisorTone = "no-data" | "partial-data" | "strong" | "mixed" | "weak";

export type AdvisorResult = {
  headline: string;
  detail: string;
  recommendedTopic: string | null;
  recommendedDifficulty: number | null;
  tone: AdvisorTone;
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
    return { ...t, recommendedTopic: null, recommendedDifficulty: null, tone: "no-data" };
  }

  const reliable = byTopic.filter((t) => t.total >= MIN_RELIABLE_SAMPLES);
  if (reliable.length === 0) {
    const t = pick(PARTIAL_DATA_TEMPLATES, seed);
    return { ...t, recommendedTopic: null, recommendedDifficulty: null, tone: "partial-data" };
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
    const strongTopics = sorted.slice(0, Math.min(2, sorted.length)).map((t) => t.topic);
    const headline = pick(STRONG_TEMPLATES, seed)(strongTopics);
    return {
      headline,
      detail: withUrgency("אתה שולט בחומר ברמה גבוהה — הזמן לעלות רמת קושי או לנסות סימולציית פרק מלאה."),
      recommendedTopic: strongest.topic,
      recommendedDifficulty: null,
      tone: "strong",
    };
  }

  if (pct(weakest) < WEAK_TOPIC_THRESHOLD) {
    const headline = pick(WEAK_TEMPLATES, seed)(weakest.topic);
    const hasStrong = sorted.length > 1 && pct(strongest) >= 0.7;
    const detail = hasStrong
      ? `ב${strongest.topic} אתה כבר מוכיח שאתה מסוגל — בוא ניקח את אותה גישה ל${weakest.topic}.`
      : `נתמקד ב${weakest.topic} עם שאלות ברמה נוחה יותר, ונבנה משם ביטחון.`;
    return {
      headline,
      detail: withUrgency(detail),
      recommendedTopic: weakest.topic,
      recommendedDifficulty: 1,
      tone: "weak",
    };
  }

  const headline = pick(MIXED_TEMPLATES, seed)(strongest.topic, weakest.topic);
  return {
    headline,
    detail: withUrgency(`יש לך תמונה מאוזנת — קצת תרגול ממוקד ב${weakest.topic} וההתקדמות תהיה מהירה.`),
    recommendedTopic: weakest.topic,
    recommendedDifficulty: null,
    tone: "mixed",
  };
}
