// Phase 1 static data — replaced by TanStack Query hooks in Phase 2
import type { Project, Tag } from '@/types/project.types'

export const STATIC_TAGS: Tag[] = [
  { id: '1', name: 'React', slug: 'react', color: '#61DAFB' },
  { id: '2', name: 'NestJS', slug: 'nestjs', color: '#E0234E' },
  { id: '3', name: 'TypeScript', slug: 'typescript', color: '#3178C6' },
  { id: '4', name: 'PostgreSQL', slug: 'postgresql', color: '#336791' },
  { id: '5', name: 'Claude AI', slug: 'claude-ai', color: '#6366F1' },
]

export const STATIC_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'SMC Edge — Trading Journal & Analytics Platform',
    slug: 'smc-edge',
    summary:
      'A full-stack trading journal with Claude AI-powered Smart Money Concepts analysis. Tracks entries, generates confluence scores, and surfaces pattern insights across sessions.',
    problem:
      'Retail traders following SMC methodology have no structured way to journal trades with confluence tagging, replay analysis, or AI-assisted pattern recognition — leaving improvement dependent on memory and intuition.',
    solution:
      'Built a full-stack platform where every trade entry captures structure context, timeframe alignment, and entry grade. Claude AI processes journals nightly to surface recurring pattern failures and generate improvement recommendations.',
    techStack: ['React', 'NestJS', 'PostgreSQL', 'TypeScript', 'Claude AI', 'Tailwind CSS'],
    metrics: [
      { label: 'Journal entries processed', value: '500+' },
      { label: 'AI analysis latency', value: '<3s' },
      { label: 'Trade confluence accuracy', value: '78%' },
    ],
    loomUrl: undefined,
    demoUrl: undefined,
    githubUrl: 'https://github.com/ynpbright/smc-edge',
    thumbnailUrl: undefined,
    sortOrder: 1,
    isFeatured: true,
    status: 'published',
    publishedAt: '2026-05-01T00:00:00Z',
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
    tags: [STATIC_TAGS[0], STATIC_TAGS[1], STATIC_TAGS[2], STATIC_TAGS[3], STATIC_TAGS[4]],
    caseStudy: {
      id: 'cs-1',
      projectId: '1',
      architectureDecisions: [
        {
          context:
            'Needed AI-powered pattern analysis without exposing raw trade data to a general-purpose API in an uncontrolled way.',
          decision: 'Built a structured prompt layer that serializes trade context into a typed schema before sending to Claude.',
          rationale:
            'Structured prompts produce deterministic output shapes, making the AI a typed service dependency rather than a text generator.',
          consequences:
            'Adds a serialization layer. Benefit: AI output can be validated against a Zod schema; failures are caught before storage.',
        },
      ],
      content: [
        {
          type: 'text',
          content:
            'The core challenge was not technical — it was designing a data model that captures the full SMC context of a trade: which structure was broken, where the order block formed, whether there was a previous day high/low in play. Generic trade journals do not model this.',
        },
        {
          type: 'callout',
          content:
            'Architecture decision: separate the "what happened" (journal entry) from the "what it means" (AI analysis). Analysis runs asynchronously so journaling is never blocked by AI latency.',
        },
      ],
    },
  },
  {
    id: '2',
    title: 'Bright Portfolio — This Website',
    slug: 'bright-portfolio',
    summary:
      'A CMS-backed portfolio built with React SPA + NestJS + PostgreSQL + Clean Architecture. The backend is the portfolio piece — demonstrating the same architectural patterns used in production.',
    problem:
      'Most developer portfolios are static sites that claim backend skill without demonstrating it. The portfolio itself becomes an implicit proof artifact when it runs a real backend.',
    solution:
      'Built a decoupled React SPA backed by a NestJS API with Clean Architecture layers. Projects are CMS-managed without code deployments. The architecture ADRs document every tradeoff explicitly.',
    techStack: ['React', 'NestJS', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'TanStack Query'],
    metrics: [
      { label: 'Lighthouse performance', value: '95+' },
      { label: 'Admin panel bundle', value: '0 KB (public)' },
      { label: 'ADR documents', value: '9' },
    ],
    loomUrl: undefined,
    demoUrl: 'https://bright.dev',
    githubUrl: 'https://github.com/ynpbright/bright-portfolio',
    thumbnailUrl: undefined,
    sortOrder: 2,
    isFeatured: false,
    status: 'published',
    publishedAt: '2026-05-05T00:00:00Z',
    createdAt: '2026-05-05T00:00:00Z',
    updatedAt: '2026-05-05T00:00:00Z',
    tags: [STATIC_TAGS[0], STATIC_TAGS[1], STATIC_TAGS[2], STATIC_TAGS[3]],
  },
]
