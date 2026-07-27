# ScoreUp — Plan

Hebrew RTL landing page with a working quantitative practice engine, inspired by the LexiBoost layout in the uploaded references.

## Scope
Frontend-only, single route (`/`). No backend, no auth. Mock questions in-memory.

## Structure
Rewrite `src/routes/index.tsx` (the placeholder) as the ScoreUp home. Set `<html lang="he" dir="rtl">` in `src/routes/__root.tsx`. Update root `head()` with ScoreUp title/description/OG (Hebrew).

New components under `src/components/scoreup/`:
- `Navbar.tsx` — right-aligned logo "ScoreUp", nav links (איך זה עובד, יתרונות, תרגול, מחירים), CTA button.
- `Hero.tsx` — big headline, subtitle, two CTAs ("התחל לתרגל חינם" scrolls to `#practice`, "למה ScoreUp?" scrolls to `#why`), 3 stat badges.
- `WhyScoreUp.tsx` (#why) — 3–4 feature cards (AI מותאם, פתרונות שלב-אחר-שלב, ניתוח ביצועים, מאגר מעודכן).
- `PracticeEngine.tsx` (#practice) — core interactive card (details below).
- `Footer.tsx` — brand + minimal links.

## Practice Engine behavior
- State: `currentIndex`, `selected`, `submitted`, `timeLeft`, `solutionOpen`.
- Timer: starts at 60s per question, counts down each second; auto-submits (no answer) at 0.
- 4 options rendered as buttons. On submit: correct option = green, wrong selected = red, correct highlighted green.
- After submit: "פתרון מפורט" accordion reveals step-by-step KaTeX-rendered solution; "השאלה הבאה" advances (wraps around), resets timer/state.
- Progress indicator "שאלה X מתוך 3" and small progress bar.

## Math rendering
Add deps: `katex` + `react-katex`. Load KaTeX CSS via `<link>` in `__root.tsx` head (CDN, jsdelivr) — per Tailwind v4 remote-CSS rule, do not `@import` a URL in styles.css.
Use `<InlineMath>` / `<BlockMath>` from `react-katex` for expressions.

## Mock questions (3)
Realistic Hebrew psychometric quantitative items with KaTeX:
1. Percentages — "מחיר מוצר עלה ב-20% ואז ירד ב-25%. מה השינוי הכולל?" (answer: ירידה של 10%).
2. Algebra — solve `\frac{2x+3}{5} = \frac{x-1}{2}`, find x (answer: x = -11).
3. Geometry — area of right triangle given legs / or circle sector; include a diagram description in the solution using KaTeX.

Each question object: `{ id, topic, prompt, latex?, options[4], correctIndex, solutionSteps: string[] (KaTeX allowed) }`.

## Design tokens (edit `src/styles.css`)
Rewrite `:root` palette to ScoreUp brand:
- background: near-white `oklch(0.99 0.005 260)`
- foreground: deep ink `oklch(0.18 0.03 265)`
- primary: deep tech blue-purple `oklch(0.45 0.18 275)`
- primary-foreground: white
- accent: vibrant success green `oklch(0.72 0.18 145)` (used for correct answers)
- destructive: red for wrong answers (keep existing)
- add `--gradient-hero: linear-gradient(135deg, oklch(0.35 0.18 275), oklch(0.55 0.22 290))`
- add `--shadow-elegant`, `--shadow-glow` tokens
Register new tokens in `@theme inline` so `bg-hero-gradient` etc. work; or apply via `style={{ background: 'var(--gradient-hero)' }}`.
Add Heebo (Hebrew-friendly) via `<link>` in `__root.tsx` head; set `--font-sans: "Heebo", system-ui, sans-serif` in `@theme`.

## RTL specifics
- `<html dir="rtl" lang="he">`.
- Use logical Tailwind utilities (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`) where direction matters; otherwise standard flex works.
- Nav order visually right-to-left naturally with `dir=rtl`.

## Files touched
- `src/routes/__root.tsx` — lang/dir, KaTeX + Heebo `<link>`s, updated meta.
- `src/routes/index.tsx` — compose ScoreUp page.
- `src/styles.css` — brand tokens + font family.
- `src/components/scoreup/{Navbar,Hero,WhyScoreUp,PracticeEngine,Footer}.tsx`
- `src/data/questions.ts` — 3 mock questions.
- `package.json` — add `katex`, `react-katex`, `@types/react-katex`.

## Out of scope (not building unless asked)
Pricing page, contact form, real question bank, accounts, payments, backend.
