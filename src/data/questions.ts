export type Question = {
  id: string;
  topic: string;
  difficulty: string | null;
  difficultyLevel: number | null;
  question: string;
  answers: string[];
  correctIndex: number;
  explanation: string;
  svgCode: string | null;
};

export type PracticeMode = "study" | "exam";

export type LauncherMode = "warmup" | "custom" | "simulation";

export type PracticeConfig = {
  /** מאיזו כרטיסייה בדשבורד הופעל התרגול */
  launch?: LauncherMode;
  topics: string[];
  count: number;
  /** null = משולב */
  difficultyLevel: number | null;
  /** total block seconds, null = untimed */
  totalSeconds: number | null;
  mode: PracticeMode;
  /** חימום מהיר (מוגבל לפעם ביום למשתמש חינמי) */
  quick?: boolean;
  /** סימולציית פרק מלאה (20 שאלות במבנה בחינה) */
  simulation?: boolean;
};
