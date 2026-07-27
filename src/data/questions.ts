export type Question = {
  id: number;
  topic: string;
  prompt: string;
  latex?: string;
  options: string[];
  correctIndex: number;
  solutionSteps: { text?: string; math?: string }[];
};

export const questions: Question[] = [
  {
    id: 1,
    topic: "אחוזים",
    prompt:
      "מחיר של מוצר עלה תחילה ב-20%, ולאחר מכן ירד ב-25%. מהו השינוי הכולל במחיר המוצר ביחס למחיר ההתחלתי?",
    options: ["עלייה של 5%", "ירידה של 5%", "ירידה של 10%", "אין שינוי"],
    correctIndex: 2,
    solutionSteps: [
      { text: "נסמן את המחיר ההתחלתי כ-P. לאחר עלייה של 20%:" },
      { math: "P_1 = P \\cdot 1.20" },
      { text: "לאחר ירידה של 25% מהמחיר החדש:" },
      { math: "P_2 = P_1 \\cdot 0.75 = P \\cdot 1.20 \\cdot 0.75 = 0.90 \\, P" },
      { text: "כלומר המחיר הסופי הוא 90% מהמחיר ההתחלתי — ירידה כוללת של 10%." },
    ],
  },
  {
    id: 2,
    topic: "אלגברה",
    prompt: "פתרו את המשוואה הבאה ומצאו את ערכו של x:",
    latex: "\\frac{2x + 3}{5} = \\frac{x - 1}{2}",
    options: ["x = 11", "x = -11", "x = 7", "x = -7"],
    correctIndex: 1,
    solutionSteps: [
      { text: "נכפיל את שני האגפים במכנה משותף 10:" },
      { math: "2(2x + 3) = 5(x - 1)" },
      { text: "נפתח סוגריים:" },
      { math: "4x + 6 = 5x - 5" },
      { text: "נעביר אגפים:" },
      { math: "6 + 5 = 5x - 4x \\;\\Rightarrow\\; x = 11" },
      { text: "בבדיקה: 11 מקיים את המשוואה, כך שהתשובה הנכונה מבין האפשרויות היא x = 11. (שים לב לסימן!)" },
    ],
  },
  {
    id: 3,
    topic: "גיאומטריה",
    prompt:
      "במשולש ישר זווית ניצב אחד באורך 6 והיתר באורך 10. מהו שטח המשולש?",
    options: ["24", "30", "48", "60"],
    correctIndex: 0,
    solutionSteps: [
      { text: "לפי משפט פיתגורס, הניצב השני:" },
      { math: "b = \\sqrt{10^2 - 6^2} = \\sqrt{100 - 36} = \\sqrt{64} = 8" },
      { text: "שטח משולש ישר זווית הוא מכפלת הניצבים חלקי 2:" },
      { math: "S = \\frac{6 \\cdot 8}{2} = 24" },
    ],
  },
];
