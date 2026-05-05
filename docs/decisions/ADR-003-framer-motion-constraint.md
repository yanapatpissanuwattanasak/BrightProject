# ADR-003: Framer Motion Animation Budget

**Status:** Accepted  
**Date:** 2026-05-05

## Context

Animation adds perceived polish but carries real costs: bundle size (~50KB gzipped), main-thread work, motion sensitivity for users with vestibular disorders.

## Decision

Framer Motion is constrained to exactly three contexts:

1. **Page transitions** — `opacity + y: 16px → 0` over 250ms via `AnimatePresence`
2. **Scroll reveal** — `useInView` + `once: true`, 80ms stagger between cards
3. ~~Micro-interactions~~ — CSS `transition` only (hover scale, shadow lift). Framer Motion is not used here.

`useReducedMotion()` disables all variants unconditionally. The component renders but with no motion applied.

## Rationale

Framer Motion added for page transitions and scroll reveals only. Adding it to hover states (micro-interactions) adds ~20KB of JS for effects that CSS transitions handle identically. The constraint is documented to prevent scope creep.

## Consequences

- Bundle includes Framer Motion (~50KB gzip) — justified by the two use cases
- `prefers-reduced-motion: reduce` fully respected — passes WCAG 2.1 AAA for motion
- New animations require explicit justification against this ADR before implementation
