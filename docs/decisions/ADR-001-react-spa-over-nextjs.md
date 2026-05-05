# ADR-001: React SPA Over Next.js

**Status:** Accepted  
**Date:** 2026-05-05

## Context

This portfolio needs a frontend. Two viable options:

1. **Next.js** — SSR/SSG, image optimisation, built-in SEO features, widely deployed
2. **React SPA (Vite)** — CSR only, no built-in SSR, requires explicit SEO work

Next.js is the obvious default for portfolio sites due to better Lighthouse scores out of the box.

## Decision

React SPA (Vite + React Router v7).

## Rationale

The NestJS backend with Clean Architecture is the portfolio's primary proof artifact. A Next.js frontend makes the backend optional: project data could be pulled into `getStaticProps` and the API would become redundant. A decoupled SPA forces the API to exist and be production-grade.

The portfolio **is** the backend demonstration. Removing that constraint removes the demonstration.

## Consequences

**Negative:**
- FCP ~300ms slower than SSR equivalent
- Requires `react-helmet-async` for meta tags; less automatic than Next.js
- No built-in image optimisation (mitigated by Cloudinary)

**Positive:**
- NestJS API is load-bearing — cannot be cut without breaking the portfolio
- Demonstrates the exact decoupled architecture used in production APIs
- Admin panel is a separate lazy-loaded chunk with zero cost to public visitors
- Simpler deployment: Vercel static + Railway API, no hybrid rendering edge cases

**Tradeoff acknowledged:** Worse SEO baseline in exchange for a live demonstration of backend architectural judgment.
