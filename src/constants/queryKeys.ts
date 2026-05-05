import type { ProjectFilters } from '@/types/project.types'

export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    published: (filters?: ProjectFilters) => ['projects', 'published', filters] as const,
    featured: () => ['projects', 'featured'] as const,
    detail: (slug: string) => ['projects', 'slug', slug] as const,
    adminList: () => ['admin', 'projects'] as const,
    adminDetail: (id: string) => ['admin', 'projects', id] as const,
  },
  tags: {
    all: () => ['tags'] as const,
  },
  contact: {
    messages: (unreadOnly?: boolean) => ['admin', 'contact', { unreadOnly }] as const,
  },
} as const
