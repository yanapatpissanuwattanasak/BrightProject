import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { fetchTags } from '@/lib/api/tags'
import { STATIC_TAGS } from '@/data/projects'

const USE_STATIC_DATA = !import.meta.env.VITE_API_BASE_URL

export function useProjectTags() {
  return useQuery({
    queryKey: queryKeys.tags.all(),
    queryFn: USE_STATIC_DATA ? () => STATIC_TAGS : fetchTags,
  })
}
