import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { fetchFeaturedProjects } from '@/lib/api/projects'
import { STATIC_PROJECTS } from '@/data/projects'

const USE_STATIC_DATA = !import.meta.env.VITE_API_BASE_URL

export function useFeaturedProjects() {
  return useQuery({
    queryKey: queryKeys.projects.featured(),
    queryFn: USE_STATIC_DATA
      ? () => STATIC_PROJECTS.filter((p) => p.isFeatured && p.status === 'published')
      : fetchFeaturedProjects,
  })
}
