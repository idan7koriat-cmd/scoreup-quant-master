CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'בינוני',
  prompt TEXT NOT NULL,
  latex TEXT,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  solution_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.questions TO anon;
GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are publicly readable"
  ON public.questions FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.questions (topic, difficulty, prompt, latex, options, correct_index, solution_steps) VALUES
('אחוזים', 'בינוני', 'מחיר של מוצר עלה תחילה ב-20%, ולאחר מכן ירד ב-25%. מהו השינוי הכולל במחיר המוצר ביחס למחיר ההתחלתי?', NULL,
 '["עלייה של 5%","ירידה של 5%","ירידה של 10%","אין שינוי"]'::jsonb, 2,
 '[{"text":"נסמן את המחיר ההתחלתי כ-P. לאחר עלייה של 20%:"},{"math":"P_1 = P \\cdot 1.20"},{"text":"לאחר ירידה של 25% מהמחיר החדש:"},{"math":"P_2 = P_1 \\cdot 0.75 = P \\cdot 1.20 \\cdot 0.75 = 0.90 \\, P"},{"text":"כלומר המחיר הסופי הוא 90% מהמחיר ההתחלתי — ירידה כוללת של 10%."}]'::jsonb),
('אלגברה', 'קל', 'פתרו את המשוואה הבאה ומצאו את ערכו של x:', '\frac{2x + 3}{5} = \frac{x - 1}{2}',
 '["x = 11","x = -11","x = 7","x = -7"]'::jsonb, 0,
 '[{"text":"נכפיל את שני האגפים במכנה משותף 10:"},{"math":"2(2x + 3) = 5(x - 1)"},{"text":"נפתח סוגריים:"},{"math":"4x + 6 = 5x - 5"},{"text":"נעביר אגפים:"},{"math":"6 + 5 = 5x - 4x \\;\\Rightarrow\\; x = 11"},{"text":"בבדיקה: הצבת x = 11 מקיימת את שוויון שני האגפים."}]'::jsonb),
('גיאומטריה', 'בינוני', 'במשולש ישר זווית ניצב אחד באורך 6 והיתר באורך 10. מהו שטח המשולש?', NULL,
 '["24","30","48","60"]'::jsonb, 0,
 '[{"text":"לפי משפט פיתגורס, הניצב השני:"},{"math":"b = \\sqrt{10^2 - 6^2} = \\sqrt{100 - 36} = \\sqrt{64} = 8"},{"text":"שטח משולש ישר זווית הוא מכפלת הניצבים חלקי 2:"},{"math":"S = \\frac{6 \\cdot 8}{2} = 24"}]'::jsonb);