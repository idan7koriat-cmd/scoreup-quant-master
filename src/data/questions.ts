export type Question = {
  id: string;
  topic: string;
  difficulty: string | null;
  question: string;
  answers: string[];
  correctIndex: number;
  explanation: string;
};
