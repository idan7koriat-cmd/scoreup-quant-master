import type { Question } from "./questions";

/** 5 שאלות דמו קבועות ל"טעימה חינם" — ללא קריאה למסד הנתונים. */
export const demoQuestions: Question[] = [
  {
    id: "demo-1",
    topic: "אחוזים",
    difficulty: "קל",
    difficultyLevel: 1,
    question:
      "מחיר מעיל הוא 400 ש\"ח. המחיר הועלה ב-25% ולאחר מכן הוזל ב-20%. מה המחיר הסופי?",
    answers: ["380 ש\"ח", "400 ש\"ח", "420 ש\"ח", "440 ש\"ח"],
    correctIndex: 1,
    explanation:
      "העלאה ב-25%: $400 \\times 1.25 = 500$\n\nהוזלה ב-20%: $500 \\times 0.8 = 400$\n\nלכן המחיר הסופי זהה למחיר המקורי: 400 ש\"ח.",
    svgCode: null,
  },
  {
    id: "demo-2",
    topic: "אלגברה",
    difficulty: "בינוני",
    difficultyLevel: 2,
    question: "אם $3x + 5 = 2x + 12$, מהו הערך של $x^2 - 4$?",
    answers: ["21", "45", "49", "53"],
    correctIndex: 1,
    explanation:
      "נעביר אגפים: $3x - 2x = 12 - 5$ ולכן $x = 7$.\n\nנציב: $x^2 - 4 = 49 - 4 = 45$.",
    svgCode: null,
  },
  {
    id: "demo-3",
    topic: "גיאומטריה",
    difficulty: "בינוני",
    difficultyLevel: 2,
    question:
      "במלבן ABCD אורך הצלע הארוכה 8 ס\"מ ואורך הצלע הקצרה 6 ס\"מ. מהו אורך האלכסון AC?",
    answers: ["9 ס\"מ", "10 ס\"מ", "12 ס\"מ", "14 ס\"מ"],
    correctIndex: 1,
    explanation:
      "לפי משפט פיתגורס: $AC^2 = 8^2 + 6^2 = 64 + 36 = 100$\n\nלכן $AC = 10$ ס\"מ.",
    svgCode: `<svg viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg" width="220" height="170">
  <rect x="30" y="30" width="160" height="120" fill="none" stroke="#0F172A" stroke-width="2"/>
  <line x1="30" y1="30" x2="190" y2="150" stroke="#06B6D4" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="24" y="24" font-size="13" fill="#0F172A">A</text>
  <text x="192" y="24" font-size="13" fill="#0F172A">B</text>
  <text x="192" y="164" font-size="13" fill="#0F172A">C</text>
  <text x="20" y="164" font-size="13" fill="#0F172A">D</text>
  <text x="98" y="22" font-size="13" fill="#0F172A">8</text>
  <text x="198" y="95" font-size="13" fill="#0F172A">6</text>
</svg>`,
  },
  {
    id: "demo-4",
    topic: "הסתברות",
    difficulty: "בינוני",
    difficultyLevel: 2,
    question:
      "בכד 4 כדורים אדומים ו-6 כדורים כחולים. מוציאים כדור אחד באקראי. מה ההסתברות שהוא אדום?",
    answers: ["$\\frac{1}{5}$", "$\\frac{2}{5}$", "$\\frac{3}{5}$", "$\\frac{1}{2}$"],
    correctIndex: 1,
    explanation:
      "סך הכדורים: $4 + 6 = 10$.\n\nההסתברות: $\\frac{4}{10} = \\frac{2}{5}$.",
    svgCode: null,
  },
  {
    id: "demo-5",
    topic: "בעיות מילוליות",
    difficulty: "קשה",
    difficultyLevel: 3,
    question:
      "רכבת נוסעת 180 ק\"מ במהירות קבועה. אילו הייתה מגבירה את מהירותה ב-15 קמ\"ש, הייתה מגיעה שעה מוקדם יותר. מהי מהירותה המקורית?",
    answers: ["40 קמ\"ש", "45 קמ\"ש", "50 קמ\"ש", "60 קמ\"ש"],
    correctIndex: 1,
    explanation:
      "נסמן את המהירות המקורית ב-$v$. אז $\\frac{180}{v} - \\frac{180}{v+15} = 1$.\n\nנכפול ב-$v(v+15)$: $180(v+15) - 180v = v^2 + 15v$\n\nמכאן $2700 = v^2 + 15v$, כלומר $v^2 + 15v - 2700 = 0$.\n\nהפתרון החיובי: $v = 45$ קמ\"ש.",
    svgCode: null,
  },
];
