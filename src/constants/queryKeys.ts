import type { ProjectFilters } from '@/types/project.types'
import type { AttractionFilter } from '@/types/thailand.types'

export const queryKeys = {
  pokemon: {
    listInfinite: (limit: number) => ['pokemon', 'list', limit] as const,
    detail: (nameOrId: string | number) => ['pokemon', 'detail', String(nameOrId)] as const,
    byType: (type: string) => ['pokemon', 'type', type] as const,
  },
  attractions: {
    byProvince: (provinceId: string, filter: AttractionFilter) =>
      ['attractions', provinceId, filter] as const,
  },
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
