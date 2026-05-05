import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { fetchProjectBySlug } from '@/lib/api/projects'
import { STATIC_PROJECTS } from '@/data/projects'

const USE_STATIC_DATA = !import.meta.env.VITE_API_BASE_URL

export function useProjectBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(slug),
    queryFn: USE_STATIC_DATA
      ? () => {
          const p = STATIC_PROJECTS.find((p) => p.slug === slug)
          if (!p) throw new Error('Project not found')
          return p
        }
      : () => fetchProjectBySlug(slug),
    enabled: !!slug,
  })
}
