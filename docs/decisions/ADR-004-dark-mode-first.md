# ADR-004: Dark Mode First

**Status:** Accepted  
**Date:** 2026-05-05

## Context

Most developer portfolio visitors (EMs, engineers) use dark system themes. Designing dark-first and light-second means the primary audience sees the intended design; the fallback is built for completeness.

## Decision

Dark mode is the primary design direction. Light mode is provided via `class="dark"` on `<html>`, toggled by user preference or `prefers-color-scheme` system detection.

Design tokens (`--color-surface`, `--color-primary`, etc.) are defined once in `tailwind.config.ts` targeting dark values. Light mode uses `dark:` prefix in Tailwind to override.

## Rationale

The near-black `#0A0A0F` surface reduces eye strain for technical evaluators spending 5–10 minutes in the portfolio. High-contrast text (`#F8FAFC` on `#0A0A0F`) comfortably exceeds WCAG AA at 16.75:1 ratio.

Light mode respects users who prefer it without compromising the primary experience.

## Consequences

- `localStorage` preference takes priority over system preference on repeat visits
- All color decisions are made in dark context; light variants are secondary
- Images (thumbnails, OG) are designed against dark backgrounds
