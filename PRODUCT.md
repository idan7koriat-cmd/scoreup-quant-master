# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are Israeli test-takers preparing for the Quantitative Reasoning section of the Psychometric Entrance Test (הפסיכומטרי), the exam that gates university admission in Israel. They are typically studying under real deadline pressure (an upcoming exam date that determines degree eligibility), practicing in Hebrew, and reading dense math-notation questions for extended stretches. The interface is RTL Hebrew throughout.

## Product Purpose

ScoreUp helps users raise their Quantitative score through focused, personalized practice: adaptive question sets by topic and difficulty, step-by-step worked explanations (not just answers), timed exam simulations, and progress/streak tracking. Success is measured by score improvement (marketing currently claims +20-40 points) and by the user returning to practice consistently rather than abandoning prep.

## Positioning

Users choose ScoreUp over a private tutor, an old paper practice book, or a competing app for roughly two combined reasons, in about equal weight: (1) price/convenience — full access costs less than a single private lesson and is available on-demand, and (2) genuinely personalized feedback — practice adapts by topic/difficulty and every question ships with a full step-by-step explanation, not just a correct-answer key.

## Operating Context

- Practice happens in long, focused sessions — this is the highest-time-spent surface in the product and must stay comfortable to read for extended stretches (see PracticeSession.tsx).
- Questions contain LaTeX-rendered math (KaTeX) and occasionally inline SVG diagrams; both must render legibly at practice-question scale.
- Two practice modes exist: "study" mode (immediate per-question feedback + explanation) and timed exam-simulation mode (20 questions / 20 minutes, feedback withheld until the end).
- Free tier has a daily question-reveal quota enforced server-side; hitting it surfaces an upgrade prompt inline rather than blocking navigation.
- Users can flag a question as broken (wrong answer, bad wording, wrong difficulty) via an in-session report modal — this is a trust-building mechanism and should stay low-friction.

## Capabilities and Constraints

- Stack: TanStack Start (React 19) + TanStack Router, Tailwind v4, Radix-based shadcn-style UI primitives, Supabase (auth + data), KaTeX/react-katex for math rendering.
- RTL Hebrew is a hard constraint on every surface, including icon mirroring/logical properties (start/end, not left/right).
- Font currently loaded is Heebo (Google Fonts) for Hebrew support; no other typeface is wired in yet.
- No graphic logo exists today — brand mark is text-only ("ScoreUp"). A fresh textual wordmark treatment is in scope for this design pass; no image-based logo is required.
- Auth, payments (₪99/month or ₪149/60-day "marathon" plan), and question-bank/AI-generation backend are out of scope for this design pass — this work is visual/UX only, not new functionality.

## Brand Commitments

- Product name "ScoreUp" is fixed and must remain a text wordmark (no graphic logo to preserve, none to invent as an image mark).
- Support contact is scoreup.support@gmail.com (in-app contact form, no mailto links).

## Evidence on Hand

- Real pricing/plan copy exists in `src/routes/pricing.tsx` (₪99/month, ₪149/60-day marathon) — usable as-is.
- Marketing stat "+20-40 נקודות לשיפור" (points of improvement) is existing copy already live on the site; treat as an existing claim to preserve, not a new one to fabricate or expand.
- No testimonials, case studies, press mentions, or customer logos exist anywhere in the codebase — future work must not invent them.

## Product Principles

1. The practice screen is the product — most user time is spent inside a single question, so legibility and calm over long sessions outrank decorative flourish there.
2. Feel like a confident guide, not a stern textbook and not a gamified app — tone sits between "serious exam" and "friendly product," never fully either.
3. Every design decision should read as deliberate for a high-stakes academic exam context — nothing that reads as generic AI-startup or as a casual consumer app.
4. Math content (KaTeX, diagrams) is first-class content, not an edge case — layouts must accommodate long-form mathematical text gracefully.
5. Preserve existing functional behavior and real copy/pricing; this pass changes look and feel, not information architecture or business logic.

## Accessibility & Inclusion

No formal accessibility standard has been confirmed as required. RTL correctness (logical CSS properties, mirrored icons where semantically directional) is a functional requirement, not an optional accessibility nicety, given 100% of the audience reads Hebrew right-to-left.
