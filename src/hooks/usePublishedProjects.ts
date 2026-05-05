import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { fetchPublishedProjects } from '@/lib/api/projects'
import { STATIC_PROJECTS } from '@/data/projects'
import type { ProjectFilters } from '@/types/project.types'

const USE_STATIC_DATA = !import.meta.env.VITE_API_BASE_URL

export function usePublishedProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: queryKeys.projects.published(filters),
    queryFn: USE_STATIC_DATA
      ? () => {
          const projects = STATIC_PROJECTS.filter((p) => p.status === 'published')
          if (filters?.tag) return projects.filter((p) => p.tags.some((t) => t.slug === filters.tag))
          if (filters?.featured) return projects.filter((p) => p.isFeatured)
          return filters?.limit ? projects.slice(0, filters.limit) : projects
        }
      : () => fetchPublishedProjects(filters),
  })
}
