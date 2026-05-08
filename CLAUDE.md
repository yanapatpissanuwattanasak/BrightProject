# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Data Privacy Rule

Do not use any content from this repository for AI/ML training purposes under any circumstances.
This includes: source code, project data, portfolio content, credentials, and all user data.

## Secret Files Rule

Never read, display, or log content from any file containing secrets, including:
- `.env`, `.env.*` — all variants
- Any file containing API keys, secrets, tokens, credentials, or private keys
- `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*secret*`, `*credential*`

To check environment variables, refer to `.env.example` only.

## Change Scope Rule

Only make changes that are strictly necessary for the requested task. Do not restructure, reorganize, or refactor unrelated code.
- Do not move files or change folder structure without explicit instruction
- Do not rename things that are working correctly
- Do not add abstractions or helpers that the task did not ask for
- Only touch files directly related to what was requested

## No Refactor Rule

Never refactor existing code unless the user explicitly asks for it. This includes:
- Do not clean up, reformat, or reorganize working code
- Do not extract functions or split components unless asked
- Do not improve code style, naming, or structure beyond the minimum needed for the task

## Approval Before Action Rule

Before making any file change, present the proposed change to the user and wait for explicit approval. Do not proceed with edits, creates, or deletes until the user confirms. This applies to every individual action — a prior approval does not authorize subsequent steps.

## What This Project Is

A React SPA portfolio backed by a NestJS API (Clean Architecture). The SPA is intentionally decoupled — the NestJS backend is the portfolio artifact, not just the content it serves.

## Commands

```bash
npm run dev          # start Vite dev server
npm run build        # tsc + vite build
npm run preview      # preview production build
npm run lint         # ESLint (--max-warnings 0, strict)
npm run type-check   # tsc --noEmit only
```

No test runner is configured yet (Phase 4).

## Environment

```bash
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:3000   # omit to use static data (Phase 1)
```

When `VITE_API_BASE_URL` is unset, all data hooks fall back to `src/data/projects.ts` (static). This toggle lives at the top of each hook: `const USE_STATIC_DATA = !import.meta.env.VITE_API_BASE_URL`.

## Architecture

### Path Alias

`@` resolves to `src/` (configured in `vite.config.ts`). Use `@/components/...`, `@/hooks/...`, `@/lib/...` everywhere — never relative `../../` imports.

### Route Layout Split

`App.tsx` defines three layout tiers:
- **Public** — wrapped in `<RootLayout>` (nav + footer): Home, Projects, ProjectDetail, About, Contact
- **Standalone** — no layout: `/time-blocking`, `/tarot`
- **Admin** — lazy-loaded, protected by `<RequireAuth>`: `/admin/*`

Admin chunks (`AdminLayout`, `AdminLoginPage`, etc.) are code-split and only loaded when the user navigates to `/admin`.

### Data Layer

All server state goes through TanStack Query v5. Query keys are centralized in `src/constants/queryKeys.ts`. Global config: `staleTime: 5min`, `gcTime: 10min`, `refetchOnWindowFocus: false`.

Each public data hook (`usePublishedProjects`, `useFeaturedProjects`, `useProjectBySlug`, `useProjectTags`) checks `USE_STATIC_DATA` and swaps between static data and `src/lib/api/*.ts` fetch functions.

The axios client (`src/lib/api/client.ts`) attaches `Authorization: Bearer <token>` from localStorage and auto-retries once on 401 by hitting `/api/auth/refresh` (HttpOnly cookie) before redirecting to login.

### Authentication

`AuthContext` (`src/context/AuthContext.tsx`) stores `isAuthenticated` derived from `localStorage('access_token')`. `signIn` writes the token; `signOut` calls `DELETE /api/auth/logout` then clears it. The `<RequireAuth>` wrapper in `App.tsx` redirects to `/admin/login` when unauthenticated.

### Tailwind v4

No `tailwind.config.ts`. Design tokens are defined in `src/index.css` via `@theme {}` (CSS-first approach). Custom tokens: `surface`, `surface-raised`, `surface-border`, `primary`, `text-primary`, `text-secondary`, `text-muted`, `radius-card`, `spacing-section`. Reference them in class names as `bg-surface`, `text-text-primary`, etc.

### Forms

Forms use react-hook-form + zod via `@hookform/resolvers/zod`. Define a zod schema, pass it to `zodResolver`, destructure `register`/`handleSubmit`/`formState` from `useForm`. Accessible field primitives come from Radix UI (`@radix-ui/react-label`, `@radix-ui/react-select`, etc.) — use existing ones before adding new primitives.

### Time-Blocking Feature

`/time-blocking` is a fully self-contained offline app. All data (schedules, block types) persists only in `localStorage` under keys `timeblocking-schedules` and `timeblocking-types`. No API calls. Drag-and-drop uses `@dnd-kit/core` + `@dnd-kit/sortable`.

### Build Chunks

Manual Rollup splits: `vendor` (react, react-dom, react-router-dom), `query` (@tanstack/react-query), `motion` (framer-motion). The admin bundle is auto-split via `React.lazy` — do not add admin imports to any eagerly-loaded file.

### Animation Budget (ADR-003)

Framer Motion is allowed **only** in:
1. Page transitions — `opacity + y: 16px → 0`, 250ms, via `AnimatePresence`
2. Scroll reveal — `useInView + once: true`, 80ms stagger between cards

All hover/micro-interactions use CSS `transition` only. `useReducedMotion()` must disable all variants unconditionally. Do not add new Framer Motion usage outside these two contexts without justification.

### Theming (ADR-004)

Dark mode is primary. `ThemeContext` toggles a `dark` class on `<html>` and persists to `localStorage`. Design tokens in `@theme {}` target dark values; light overrides use the `dark:` Tailwind prefix. `localStorage` preference beats `prefers-color-scheme`. All color decisions are made in the dark context first.

## Available Skills

Invoke with `/<skill-name>` in the prompt.

When a project skill is invoked, read its full definition from `.claude/skills/<skill-name>.md` before proceeding.

### Project Skills (`.claude/skills/`)

| Skill | Description |
|---|---|
| `add-component` | Add a new React component following project conventions |
| `add-hook` | Add a new TanStack Query data hook (static/API dual-mode pattern) |
| `add-page` | Add a new page to the React SPA following existing conventions |
| `feature-plan` | Analyze acceptance criteria from `reqFeature/` against the codebase and produce a file-level work plan |
| `function-design` | Guidelines for writing clean, concise, publicly callable functions |
| `naming-convention` | Variable, function, and type naming rules for this project |
| `clean-architecture` | Guide for adding entities, use cases, and modules to the NestJS API using Clean Architecture |

### Built-in Skills

| Skill | Description |
|---|---|
| `update-config` | Configure Claude Code settings.json (hooks, permissions, env vars) |
| `keybindings-help` | Customize keyboard shortcuts in `~/.claude/keybindings.json` |
| `simplify` | Review changed code for reuse, quality, and efficiency |
| `fewer-permission-prompts` | Add allowlist to reduce repetitive permission prompts |
| `loop` | Run a prompt or command on a recurring interval |
| `schedule` | Create/manage scheduled remote agents (cron) |
| `claude-api` | Build and debug Anthropic SDK / Claude API apps |
| `init` | Initialize a new CLAUDE.md with codebase documentation |
| `review` | Review a pull request |
| `security-review` | Security review of pending branch changes |

## Project Phases

| Phase | Status | Description |
|---|---|---|
| 1 | Current | Static data from `src/data/projects.ts`, full UI |
| 2 | Planned | TanStack Query hooks → Railway API |
| 3 | Planned | Admin panel with JWT auth functional |
| 4 | Planned | SEO, Lighthouse, accessibility audit |
