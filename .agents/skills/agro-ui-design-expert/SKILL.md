---
name: agro-ui-design-expert
description: Use for any UI, layout, component, Tailwind, Radix, accessibility, or Spanish copy work in Ciruela Certificada. Triggers on "UI", "design", "component", "screen", "layout", "CSS", "Tailwind", "Radix", "copy", "accessibility", "WCAG", "mobile".
---

# Agro UI Design Expert

## When to Use

Any new screen, component, style system change, copy review, accessibility audit, or mobile-layout work.

## What I Do

Enforce the project's design voice (Spanish, farmer-friendly, mobile-first) and defer to Tier 1 official skills for general UI-quality guardrails.

## Delegation

- Invokes Tier 1 `frontend-design` for anti-slop visual baseline.
- Invokes Tier 1 `web-design-guidelines` for a11y/perf/UX rule enforcement.
- Invokes Tier 1 `composition-patterns` when building compound components.
- Invokes Tier 1 `react-best-practices` for React/Next.js performance hygiene.
- Dispatches `Explore` on `components/`, `app/globals.css`, and `tailwind.config.ts` to learn the current design system before advising.

## Project Context

**Component library:** Radix UI primitives + custom components in `components/`. Styled with Tailwind.

**Voice (Spanish):**
- Formal `usted`, warm, no tech jargon.
- Target: Chilean fruit producers, varied tech literacy.
- Common terms: `autodiagnóstico`, `certificación`, `auditoría`, `plan de implementación`, `hallazgo`, `acción correctiva`.
- Error messages: explain, don't blame. "No pudimos guardar tus cambios, inténtalo de nuevo." not "Error 500."

**Mobile-first:**
- Rural connectivity is unreliable. Keep bundles small; defer non-critical JS.
- Target interaction size ≥ 44px (touch-friendly).
- Tap targets: spacing > density.

**Accessibility floor:** WCAG AA. Spanish screen readers (NVDA es-ES, VoiceOver es-CL). Label every interactive control. Use semantic HTML (form elements, landmarks).

## Subagents

Dispatch `Explore` with: "Read `tailwind.config.ts`, `app/globals.css`, and list every file under `components/ui/`. Summarize: palette, typography scale, common component patterns (Button, Form, Card), and any design tokens in use."

## Verification

- Before proposing a new pattern, confirm it doesn't already exist in `components/ui/`.
- Before writing Spanish copy, read 2-3 adjacent screens to match register.
- Test any screen change at 375px width (iPhone SE baseline).

## Anti-Patterns

- Using `<div onClick>` instead of `<button>`.
- Inline styles that break the Tailwind palette.
- Direct English strings in UI copy.
- Designing for desktop and adapting to mobile ("adaptive" retrofit).
- Generic "AI slop" aesthetics — defer to `frontend-design` guidance.
