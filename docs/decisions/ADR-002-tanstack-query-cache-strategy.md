# ADR-002: TanStack Query Cache Strategy

**Status:** Accepted  
**Date:** 2026-05-05

## Context

Portfolio CMS content (projects, tags) changes infrequently — at most a few times per week. Contact form submissions are fire-and-forget. Admin operations are low-frequency.

Two caching libraries considered:
- **TanStack Query v5** — `prefetchQuery`, structured query keys, `staleTime` control, devtools
- **SWR** — simpler API, similar caching but lacks `prefetchQuery`

## Decision

TanStack Query v5 with `staleTime: 5 minutes` for all public queries.

## Rationale

`prefetchQuery` on `<ProjectCard>` hover provides instant navigation for EMs who open multiple projects. This is the primary interaction pattern for the highest-value audience.

5-minute `staleTime` is appropriate: a recruiter visiting three pages in two minutes will never trigger a re-fetch. The portfolio operator (me) updates content via admin panel which invalidates the relevant query keys.

SWR would require a workaround for prefetching.

## Consequences

- Second and subsequent page visits are instant (cache hit)
- Stale content visible for up to 5 minutes after admin update — acceptable for a portfolio
- Admin mutations explicitly call `invalidateQueries` to push updates immediately
- Devtools visible in development for query inspection
