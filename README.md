# bright-portfolio

> Portfolio frontend — React SPA demonstrating the NestJS + Clean Architecture backend as a live proof artifact.
> [Live demo](https://bright.dev) · [API](https://api.bright.dev)

## What This Is

A React single-page application backed by a NestJS API with Clean Architecture. Projects are CMS-managed without code deployments. The architecture is the portfolio piece — not just the projects it displays.

## Why I Built It This Way

The key decision is documented in [ADR-001](./docs/decisions/ADR-001-react-spa-over-nextjs.md): **React SPA over Next.js**. Next.js would give better SEO and faster FCP, but it would also make the NestJS backend optional. A decoupled SPA forces the API to be load-bearing — and the API is what this portfolio demonstrates.

See all frontend ADRs in [`docs/decisions/`](./docs/decisions/).

## Tech Stack

| Technology | Version | Why |
|---|---|---|
| React | 19 | Domain expertise |
| TypeScript | 5.6 | Type-safe API responses |
| Vite | 5 | Fast dev server, route-based code splitting |
| TanStack Query | 5 | `prefetchQuery` on hover, 5-min staleTime |
| Tailwind CSS | 4 | Design token system, zero runtime CSS |
| Framer Motion | 11 | Page transitions + scroll reveal only |
| React Router | 7 | Nested layouts, loader prefetch |

## Local Development

```bash
npm install
cp .env.example .env
# Set VITE_API_BASE_URL= to point at local API (or leave empty for Phase 1 static data)
npm run dev
```

## Environment Variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | Backend API URL; omit to use static data | `http://localhost:3000` |

## Project Status

**Phase 1 (current):** Static data from `src/data/projects.ts`. All UI complete.  
**Phase 2:** Swap static data → TanStack Query hooks hitting Railway API.  
**Phase 3:** Admin panel functional with JWT auth.  
**Phase 4:** SEO, Lighthouse audit, accessibility.
# BrightProject
