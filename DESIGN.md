<!-- SEED: established with the user before implementation, from an approved visual comp (published artifact, direction "ריכוז בטוח" / Confident Focus, confirmed 2026-08-19). Re-run /impeccable document once the redesign lands in code to capture the actual rendered tokens and components. -->

---

name: ScoreUp
description: Confident, calm exam-prep practice platform for the Israeli Psychometric quantitative section
colors:
bg: "#F5F2ED"
surface: "#FFFFFF"
surface-2: "#FBF8F3"
ink: "#1D2624"
ink-muted: "#6B6459"
ink-muted-2: "#8A8375"
border: "#E4DED2"
petrol: "#1F4C4E"
petrol-deep: "#153536"
petrol-tint: "#E4EDEC"
coral: "#DD6B42"
coral-deep: "#A64E2E"
coral-tint: "#FBEAE0"
success: "#2F7A5C"
success-tint: "#E4F0EA"
danger: "#BE4A39"
danger-tint: "#FBEAE6"
typography:
wordmark:
fontFamily: "'Frank Ruhl Libre', Georgia, serif"
fontSize: "1.25rem"
fontWeight: 700
lineHeight: 1
letterSpacing: normal
heading-page:
fontFamily: "Heebo, system-ui, -apple-system, 'Segoe UI', sans-serif"
fontSize: "1.875rem"
fontWeight: 800
lineHeight: 1.2
letterSpacing: normal
heading-section:
fontFamily: "Heebo, system-ui, -apple-system, 'Segoe UI', sans-serif"
fontSize: "1.5rem"
fontWeight: 800
lineHeight: 1.3
letterSpacing: normal
body:
fontFamily: "Heebo, system-ui, -apple-system, 'Segoe UI', sans-serif"
fontSize: "1rem"
fontWeight: 400
lineHeight: 1.75
letterSpacing: normal
label:
fontFamily: "Heebo, system-ui, -apple-system, 'Segoe UI', sans-serif"
fontSize: "0.8125rem"
fontWeight: 500
lineHeight: 1.4
letterSpacing: "0.02em"
numeral:
fontFamily: "Heebo, system-ui, -apple-system, 'Segoe UI', sans-serif"
fontSize: "0.875rem"
fontWeight: 500
lineHeight: 1.2
letterSpacing: "0.02em"
rounded:
sm: "8px"
md: "10px"
lg: "16px"
xl: "20px"
pill: "999px"
spacing:
xs: "8px"
sm: "12px"
md: "20px"
lg: "32px"
xl: "56px"
components:
button-primary:
backgroundColor: "{colors.petrol}"
textColor: "#FFFFFF"
rounded: "{rounded.md}"
padding: "16px 24px"
button-primary-hover:
backgroundColor: "{colors.petrol-deep}"
button-cta:
backgroundColor: "{colors.coral}"
textColor: "#FFFFFF"
rounded: "{rounded.md}"
padding: "16px 24px"
button-cta-hover:
backgroundColor: "{colors.coral-deep}"
button-secondary:
backgroundColor: "{colors.surface}"
textColor: "{colors.ink}"
rounded: "{rounded.md}"
padding: "16px 24px"
card:
backgroundColor: "{colors.surface}"
textColor: "{colors.ink}"
rounded: "{rounded.lg}"
padding: "24px"
badge-topic:
backgroundColor: "{colors.petrol-tint}"
textColor: "{colors.petrol}"
rounded: "{rounded.pill}"
padding: "5px 12px"
option-default:
backgroundColor: "{colors.surface}"
textColor: "{colors.ink}"
rounded: "{rounded.sm}"
padding: "13px 16px"
option-correct:
backgroundColor: "{colors.success-tint}"
textColor: "{colors.ink}"
rounded: "{rounded.sm}"
padding: "13px 16px"
option-wrong:
backgroundColor: "{colors.danger-tint}"
textColor: "{colors.ink}"
rounded: "{rounded.sm}"
padding: "13px 16px"

---

# Design System: ScoreUp

## Overview

**Creative North Star: "ריכוז בטוח" — Confident Focus**

ScoreUp helps a stressed, time-pressured test-taker feel like they have command of the material in front of them. The system sits deliberately between two failure modes: it must never read as a dry, cold textbook (adds to exam anxiety) and never as a playful, gamified consumer app (undermines the seriousness of a real admissions exam). The rendition is a warm-neutral, structured, quietly confident interface — closer to a well-run instrument panel than to either a study manual or a language-learning app.

This replaces an incumbent "Dark & Neon Tech" identity (near-black background, neon-cyan primary, glowing gradient blobs) that read as generic AI-startup chrome disconnected from the subject. The new system is light-first, warm-neutral, and reserves color for moments that matter — a functional discipline, not a decorative one: color marks the interactive edge (a button, a correct answer, a streak), never the ambient surface.

**Key Characteristics:**

- Warm, light-first ground (never the "near-black + neon accent" AI-startup default)
- One deep, desaturated primary (petrol) carries structure; a warm coral accent is rationed to CTA and success moments only
- A serif display face (Frank Ruhl Libre) marks the ScoreUp wordmark only; every actual heading stays on Heebo, weight-differentiated — Frank Ruhl Libre at heading weights read heavy/blocky in Hebrew and clashed against Heebo body text in practice, so its footprint was deliberately narrowed after shipping (see Named Rules under Typography)
- Numerals that matter (timer, question counter) render as tabular figures — exact, instrument-grade, never "dancing" as digits change
- Generous whitespace and a calmer corner radius than the incumbent system, trading "bubbly consumer app" for "structured and serious"

## Colors

A restrained strategy: warm neutrals carry nearly the whole surface, one deep color (petrol) carries structure and interactive default state, and one warm accent (coral) is rationed strictly to primary actions and success moments.

### Primary

- **Petrol** (#1F4C4E): the system's structural color — primary buttons, active states, links, focus rings, progress fills, badges. Deep and desaturated on purpose: it reads as confident and serious rather than as another "startup blue." Darkens to **Petrol Deep** (#153536) on hover/press. A pale **Petrol Tint** (#E4EDEC) backs topic badges and other quiet informational chips.

### Secondary

- **Coral** (#DD6B42): reserved for the moment something is achieved or asked for — the primary CTA on marketing surfaces, "start practicing," streak/achievement callouts. Never used for structural chrome, nav, or default component states. Darkens to **Coral Deep** (#A64E2E) on hover/press; a soft **Coral Tint** (#FBEAE0) backs badges that specifically flag an upsell or achievement moment.

### Neutral

- **Warm Background** (#F5F2ED): the page ground. Warm gray with a faint beige undertone — deliberately not the cool blue-gray common to SaaS defaults, and not pushed all the way to cream/parchment (that reads bookish, which this product is not).
- **Surface / Card** (#FFFFFF): cards and elevated panels sit on pure white, which reads as a clean lift off the warm ground without needing a shadow to do the separating.
- **Surface Alt** (#FBF8F3): a slightly warmer, quieter white for nested/secondary panels (chip rows, solution panels) that should recede behind the primary card surface.
- **Ink** (#1D2624): body text and headings. A soft warm-charcoal, not pure black — easier on the eye across a long practice session.
- **Ink Muted** (#6B6459) / **Ink Muted 2** (#8A8375): secondary and tertiary text (captions, metadata, disabled states), both warm-toned to match the ground rather than defaulting to cool gray.
- **Border** (#E4DED2): all hairlines and dividers. Warm and quiet, never a cold gray line cutting across a warm surface.

### Semantic (not part of the accent system)

- **Success** (#2F7A5C) / **Success Tint** (#E4F0EA): correct-answer feedback only. Kept as its own deliberately muted green, distinct from Coral, because during a real exam the red/green correctness convention has to read instantly — it is not a place to spend the brand's warmth.
- **Danger** (#BE4A39) / **Danger Tint** (#FBEAE6): incorrect-answer feedback and destructive actions. A warm brick red rather than an alarm red, consistent with the rest of the palette, but still unambiguous.

### Named Rules

**The Rationed Accent Rule.** Coral appears only on a primary call-to-action or a success/achievement moment — never as a structural or decorative color. If more than one element on a screen is coral, one of them is wrong. Two narrow, explicit exceptions on the marketing homepage: (1) the animated background layer in the two dark bookend sections (`.su-gradient-energy`) may carry a faint coral-tinted ambient blob alongside its dominant petrol tones — this is atmosphere, not a competing accent, and stays low-opacity; (2) exactly one flagship element per section may use a coral-tinted shadow **on hover only** (see the No-Glow Rule) as its single "bigger coral moment." Both exceptions are deliberately rare — the rule's spirit (one coral moment pulls the eye, not several) still governs everything else.

**The Warm Neutral Rule.** Every gray in this system (background, borders, muted text) carries a warm/beige bias. A cool or blue-gray value anywhere in the UI is a regression to the old identity, not a stylistic variant.

## Typography

**Display Font:** Frank Ruhl Libre (with Georgia, serif fallback) — wordmark only
**Body Font:** Heebo (with system-ui, -apple-system, "Segoe UI", sans-serif fallback) — everything else, including every heading

**Character:** A warm, highly legible Hebrew-native sans carries the entire interface, including headings — weight and size build hierarchy, not a typeface switch. The serif survives in exactly one place, the "ScoreUp" wordmark, where its literary weight functions as a logotype rather than as running text; shipped, it read heavy and blocky at Hebrew heading sizes and clashed against the Heebo body around it, so it was pulled back from headings after the practice and dashboard screens went live.

### Hierarchy

- **Display** (700, `clamp(2rem, 4.5vw, 3.2rem)`, 1.15 line-height): the "ScoreUp" wordmark only. Frank Ruhl Libre.
- **Marketing Display** (900, `text-6xl`–`text-8xl` responsive, tight/negative tracking, ~1.02–1.1 line-height): the homepage Hero H1 only — not a general heading level, and never used inside the app itself (dashboard, practice, summary). Heebo, still — proof that boldness at this scale comes from weight and tracking discipline, not from reaching for the serif.
- **Heading — page** (800, 1.875rem, 1.2 line-height): page-level headings ("היי {name}", "סיכום התרגול"). Heebo.
- **Heading — section** (800, 1.5rem, 1.3 line-height): section headings and card titles ("בניה עצמית", "בניית תרגול מותאם אישית"). Heebo.
- **Body** (400, 1rem, 1.75 line-height): every piece of reading content — question text, answer options, explanations, marketing copy. Heebo.
- **Label** (500, 0.8125rem, letter-spacing 0.02em): badges, buttons, form labels, metadata. Heebo.
- **Numeral** (500, 0.875rem, letter-spacing 0.02em, `font-variant-numeric: tabular-nums`): the practice timer and question counter specifically. Digits must not shift width as they change — this is a legibility and "instrument-grade precision" requirement, not a decorative choice.

### Named Rules

**The Wordmark-Only Rule.** Frank Ruhl Libre renders the "ScoreUp" logotype and nothing else. Every heading, at every level, is Heebo — hierarchy comes from weight (extrabold vs. medium) and size, never from switching typefaces. A second serif appearance anywhere in the product is a regression, not a stylistic variant.

**The Reading Content Rule.** Question text, answer options, and explanations are always Heebo at body weight — this is math-dense, long-form reading material, and it can least afford a characterful face.

**The Tabular Numeral Rule.** Any digit sequence the user tracks in real time (countdown timer, question X of Y) uses `font-variant-numeric: tabular-nums`. A proportional timer that visibly "jumps" in width every second reads as unfinished.

## Layout

RTL Hebrew throughout (`dir="rtl"` at the document root) — this is a functional requirement, not a locale nicety: 100% of the audience reads right-to-left, so logical CSS properties (`start`/`end`, not `left`/`right`) and mirrored directional icons are mandatory everywhere, not just on text.

Generous whitespace over density: the incumbent implementation is already reasonably spacious (`max-w-3xl` content columns, `p-6 md:p-8` card padding); keep that scale rather than tightening it, and use the spacing scale (8 / 12 / 20 / 32 / 56px) rather than ad hoc values. The practice screen in particular should never feel like it is asking the user to read more densely than the incumbent layout already allows — if anything, err toward more room, since it is the highest-time-spent surface in the product.

Cards and primary content stay center-column on desktop (practice, summary, pricing detail); dashboard-style screens may use wider multi-column layouts once real content warrants it.

## Elevation & Depth

Mostly flat. Cards separate from the warm background primarily through the Surface/Background color contrast (white card on warm-gray ground), not through heavy shadow. Where a shadow is used (the practice card shell), it is a soft, low-contrast ambient shadow — `0 1px 2px rgba(29,38,36,0.04), 0 8px 24px -12px rgba(29,38,36,0.12)` — never the incumbent system's saturated glow shadows (`0 24px 70px -24px oklch(...cyan/blue...)`), which read as neon-tech rather than paper-and-instrument.

### Named Rules

**The No-Glow Rule.** Shadows are neutral warm-black at low opacity at rest. A colored/saturated shadow as a *resting* state (the incumbent cyan/blue glow) is a regression to the old identity, not a legitimate elevation variant. One narrow exception: on the marketing homepage, exactly one flagship element per section may transition to a coral-tinted shadow **on hover/focus only** (resting state stays the same neutral shadow as every other card) — this is interaction feedback, not ambient glow, and it does not license a second one on the same screen.

## Shapes

Corners are calmer than the incumbent system: base radius drops from the incumbent 14px (`rounded-3xl` used almost everywhere, including on data-dense surfaces) to a tighter, more structured range — 8px for small interactive elements (answer options, chips), 10px for buttons and inputs, 16-20px for card shells. The intent is a shift from "bubbly consumer app" to "precise and structured" without going all the way to sharp/square, which would read as too cold for the audience. Pills (`999px`) remain for badges and status chips, where a full pill is the correct affordance for a small tag rather than a corner-language choice.

## Components

### Buttons

- **Shape:** 10px radius (`rounded.md`), never a full pill except for compact status/nav chips.
- **Primary:** Petrol background, white text, used for the default forward action (next question, continue, submit answer).
- **CTA:** Coral background, white text — reserved for the single highest-intent action on a screen (start practicing, upgrade, "check my answer" the first time a session's tone wants to feel like an invitation rather than routine navigation). Do not use both Primary and CTA styling on the same screen for competing actions; pick one.
- **Secondary / Ghost:** white/surface background, Ink text, Border-colored outline; used for "cancel," "back," and any action that should not compete with the screen's primary action.
- **Hover / Focus:** background steps to the `-deep` variant on hover; focus-visible gets a 2px Petrol ring offset from the control, never a color/shadow glow.

### Chips (question palette, topic badges)

- **Style:** topic badges use Petrol Tint background with Petrol text, pill radius. Question-number chips use 8px radius (not pill — they're a data grid, not tags), Border outline by default, Success Tint/Success border once answered, solid Petrol fill for the current item.

### Cards / Containers

- **Corner Style:** 16-20px radius depending on card size (larger shells get more).
- **Background:** Surface (#FFFFFF) on Background (#F5F2ED); nested/secondary panels (chip rows, solution disclosure) use Surface Alt (#FBF8F3) to recede behind the primary card.
- **Shadow Strategy:** see Elevation & Depth — soft neutral ambient shadow on the outer shell only; nested panels stay flat and rely on the Surface/Surface Alt contrast plus a Border hairline.
- **Border:** 1px Border color on every card and nested panel; this is the primary separation device on a mostly-flat, mostly-shadowless system.

### Inputs / Fields (answer options, text areas)

- **Style:** Surface background, 1.5px Border outline, 10px radius (options use 8-10px depending on density), Ink text.
- **Selected (unsubmitted):** Petrol border, Petrol Tint background.
- **Correct (revealed):** Success border, Success Tint background, filled Success circle with a check mark on the option's leading letter badge.
- **Incorrect / selected-and-wrong (revealed):** Danger border, Danger Tint background, filled Danger circle with an X on the leading letter badge.
- **Unselected-after-reveal:** stays on default Border/Surface styling at reduced opacity (~55%), so the eye goes straight to the correct and (if different) chosen options.

### Navigation

Not yet redesigned in this pass — Navbar/Footer inherit the new color and type tokens (Petrol primary, Heebo body, Frank Ruhl Libre for the site wordmark) but their structure is out of scope until the practice screen and dashboard are done.

## Do's and Don'ts

### Do:

- **Do** keep Heebo as the body/reading face everywhere text is meant to be read at length — it is already the right tool, the incumbent system's problem was never this font.
- **Do** use tabular numerals (`font-variant-numeric: tabular-nums`) for the timer and question counter.
- **Do** treat RTL as a hard functional constraint: logical properties (`ps-`/`pe-`/`start`/`end`), mirrored directional icons, no hardcoded `left`/`right`.
- **Do** keep Coral to a single use per screen — the one action or moment that should pull the eye.

### Don't:

- **Don't** reintroduce a saturated glow shadow, gradient blob, or neon-cyan accent anywhere — that is the identity this system explicitly replaces.
- **Don't** set Frank Ruhl Libre (or any serif) as a body/reading face; it is a headline face only.
- **Don't** use a cool/blue-gray for any neutral (background, border, muted text) — every neutral in this system is warm-biased.
- **Don't** invent a second accent color. Petrol (structure) and Coral (action/success moments) are the only two chromatic roles besides the semantic success/danger pair.
