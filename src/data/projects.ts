// Phase 1 static data — replaced by TanStack Query hooks in Phase 2
import type { Project, Tag } from '@/types/project.types'

export const STATIC_TAGS: Tag[] = [
  { id: '1', name: 'React', slug: 'react', color: '#61DAFB' },
  { id: '2', name: 'NestJS', slug: 'nestjs', color: '#E0234E' },
  { id: '3', name: 'TypeScript', slug: 'typescript', color: '#3178C6' },
  { id: '4', name: 'PostgreSQL', slug: 'postgresql', color: '#336791' },
  { id: '5', name: 'Claude AI', slug: 'claude-ai', color: '#6366F1' },
  { id: '6', name: 'Framer Motion', slug: 'framer-motion', color: '#FF4154' },
  { id: '7', name: 'TanStack Query', slug: 'tanstack-query', color: '#FF4154' },
  { id: '8', name: 'react-simple-maps', slug: 'react-simple-maps', color: '#22C55E' },
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
    thumbnailUrl: '/thumbnails/time-blocking.svg',
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
    thumbnailUrl: '/thumbnails/tarot.svg',
    sortOrder: 4,
    isFeatured: false,
    status: 'published',
    publishedAt: '2026-05-06T00:00:00Z',
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    tags: [STATIC_TAGS[0], STATIC_TAGS[2], STATIC_TAGS[5]],
  },
  {
    id: '6',
    title: 'Bangkok AQI',
    slug: 'bangkok-aqi',
    summary:
      'Real-time Bangkok air quality dashboard — live AQI, PM2.5, temperature, humidity, wind, and a 5-day forecast. Particle animations shift with pollution level, auto-refreshing every 5 minutes.',
    problem:
      'Bangkok residents have no quick, visual way to check whether the air is safe for outdoor activities without navigating complex government portals.',
    solution:
      'Built a standalone page that fetches live data from the WAQI API, maps AQI to six health-level tiers, and drives canvas-based particle animations and health advice dynamically from the reading.',
    techStack: ['React', 'TypeScript', 'Canvas API', 'WAQI API'],
    metrics: [
      { label: 'Refresh interval', value: '5 min' },
      { label: 'AQI tiers', value: '6 levels' },
      { label: 'Forecast', value: '5-day PM2.5' },
    ],
    loomUrl: undefined,
    demoUrl: '/bangkok-aqi',
    githubUrl: undefined,
    thumbnailUrl: '/thumbnails/bangkok-aqi.svg',
    sortOrder: 6,
    isFeatured: false,
    status: 'published',
    publishedAt: '2026-05-15T00:00:00Z',
    createdAt: '2026-05-15T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z',
    tags: [STATIC_TAGS[0], STATIC_TAGS[2]],
  },
  {
    id: '7',
    title: 'Pokédex',
    slug: 'pokedex',
    summary:
      'A full-featured Pokédex powered by PokéAPI. Browse all Pokémon, filter by type, search by name, and view detailed stats, abilities, and official artwork for any entry.',
    problem:
      'Wanted a clean, responsive Pokémon browser that demonstrates real-world API integration with TanStack Query — infinite scroll pagination, type-based filtering, and per-entry detail fetching.',
    solution:
      'Built a standalone React page that combines useInfiniteQuery for paginated browsing with per-card detail queries (cached 24 h). Type filtering queries the PokéAPI type endpoint; search filters client-side across loaded results.',
    techStack: ['React', 'TypeScript', 'TanStack Query', 'PokéAPI'],
    metrics: [
      { label: 'Pokémon', value: '1000+' },
      { label: 'Types', value: '18' },
      { label: 'API', value: 'PokéAPI' },
    ],
    loomUrl: undefined,
    demoUrl: '/pokedex',
    githubUrl: undefined,
    thumbnailUrl: '/thumbnails/pokedex.svg',
    sortOrder: 7,
    isFeatured: false,
    status: 'published',
    publishedAt: '2026-05-15T00:00:00Z',
    createdAt: '2026-05-15T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z',
    tags: [STATIC_TAGS[0], STATIC_TAGS[2], STATIC_TAGS[6]],
  },
  {
    id: '8',
    title: 'Rock Paper Scissors — RPG Battle',
    slug: 'rps',
    summary:
      'An otherworld RPG spin on rock-paper-scissors. Pick one of 15 animated heroes, face a random enemy, and cast elemental spells — Stone, Arcane, or Blades — in a best-of-3 HP battle.',
    problem:
      'Wanted a game project that combines character selection, real-time battle state, and heavy visual atmosphere — all without a backend.',
    solution:
      'Built a standalone React page with three screens (select → battle → gameover). Characters are animated SVGs loaded via import.meta.glob. Battle logic uses timed state transitions for shake, HP drain, and victory animations.',
    techStack: ['React', 'TypeScript', 'Framer Motion', 'SVG Animation'],
    metrics: [
      { label: 'Heroes', value: '15' },
      { label: 'HP per side', value: '3' },
      { label: 'Spell types', value: '3' },
    ],
    loomUrl: undefined,
    demoUrl: '/rps-game',
    githubUrl: undefined,
    thumbnailUrl: '/thumbnails/rps.svg',
    sortOrder: 8,
    isFeatured: false,
    status: 'published',
    publishedAt: '2026-05-15T00:00:00Z',
    createdAt: '2026-05-15T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z',
    tags: [STATIC_TAGS[0], STATIC_TAGS[2], STATIC_TAGS[5]],
  },
  {
    id: '5',
    title: 'Explore Thailand',
    slug: 'thailand',
    summary:
      'Interactive choropleth map of Thailand — click any province to browse top-rated tourist attractions by category, powered by the TAT Data API.',
    problem:
      'Wanted a way to visually explore Thai provinces and their tourist attractions without digging through long lists.',
    solution:
      'Built an interactive SVG map from TopoJSON data. Clicking a province fetches live attraction data from the TAT API, filtered by category with a silent static fallback.',
    techStack: ['React', 'TypeScript', 'TanStack Query', 'react-simple-maps', 'TopoJSON'],
    metrics: [
      { label: 'Provinces', value: '77' },
      { label: 'Categories', value: '8' },
      { label: 'Data source', value: 'TAT API' },
    ],
    loomUrl: undefined,
    demoUrl: '/thailand',
    githubUrl: undefined,
    thumbnailUrl: '/thumbnails/thailand.svg',
    sortOrder: 5,
    isFeatured: false,
    status: 'published',
    publishedAt: '2026-05-06T00:00:00Z',
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    tags: [STATIC_TAGS[0], STATIC_TAGS[2], STATIC_TAGS[6], STATIC_TAGS[7]],
  },
]
