// Phase 1 static data — replaced by TanStack Query hooks in Phase 2
import type { Project, Tag } from '@/types/project.types'

export const STATIC_TAGS: Tag[] = [
  { id: '1', name: 'React', slug: 'react', color: '#61DAFB' },
  { id: '2', name: 'NestJS', slug: 'nestjs', color: '#E0234E' },
  { id: '3', name: 'TypeScript', slug: 'typescript', color: '#3178C6' },
  { id: '4', name: 'PostgreSQL', slug: 'postgresql', color: '#336791' },
  { id: '5', name: 'Claude AI', slug: 'claude-ai', color: '#6366F1' },
  { id: '6', name: 'Framer Motion', slug: 'framer-motion', color: '#FF4154' },
]

export const STATIC_PROJECTS: Project[] = [
  {
    id: '3',
    title: 'Time Blocking — Visual Day Planner',
    slug: 'time-blocking',
    summary:
      'A browser-based time blocking tool with a horizontal 24-hour timeline, custom block types, drag-to-create, and a monthly utilization dashboard. All data persists locally.',
    problem:
      'Generic calendars are too heavy for focused daily time planning. Needed a minimal tool that lets you visualise and fill your day in seconds.',
    solution:
      'Built a standalone React page with a horizontal timeline grid, click-to-create blocks, custom colour-coded block types, and a dashboard that aggregates utilization across any month.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'localStorage'],
    metrics: [
      { label: 'Block types', value: 'Unlimited' },
      { label: 'Storage', value: 'localStorage' },
      { label: 'Dependencies', value: '0 backend' },
    ],
    loomUrl: undefined,
    demoUrl: '/time-blocking',
    githubUrl: undefined,
    thumbnailUrl: undefined,
    sortOrder: 3,
    isFeatured: false,
    status: 'published',
    publishedAt: '2026-05-06T00:00:00Z',
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    tags: [STATIC_TAGS[0], STATIC_TAGS[2]],
  },
  {
    id: '4',
    title: 'ไพ่ยิปซี — Tarot Reading',
    slug: 'tarot',
    summary:
      'A Tarot reading mini-app featuring the full 22 Major Arcana. Pick 3 cards, watch them flip with 3D animation, and receive a Thai-language reading across past, present, and future.',
    problem:
      'Wanted a fun, personal side project that explores animation and state-driven UI in an unconventional context.',
    solution:
      'Built a single-page Tarot experience with shuffled card selection, CSS 3D flip animations, randomised reversed cards, and per-position readings in Thai.',
    techStack: ['React', 'TypeScript', 'Framer Motion', 'Tailwind CSS'],
    metrics: [
      { label: 'Major Arcana', value: '22 cards' },
      { label: 'Positions', value: '3 (past / present / future)' },
      { label: 'Reversed chance', value: '40%' },
    ],
    loomUrl: undefined,
    demoUrl: '/tarot',
    githubUrl: undefined,
    thumbnailUrl: undefined,
    sortOrder: 4,
    isFeatured: false,
    status: 'published',
    publishedAt: '2026-05-06T00:00:00Z',
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    tags: [STATIC_TAGS[0], STATIC_TAGS[2], STATIC_TAGS[5]],
  },
]
