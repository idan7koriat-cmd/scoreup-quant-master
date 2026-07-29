export type SolutionStep = { text?: string; math?: string };

export type Question = {
  id: string;
  topic: string;
  difficulty?: string | null;
  prompt: string;
  latex?: string | null;
  options: string[];
  correctIndex: number;
  solutionSteps: SolutionStep[];
};
