import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { fetchAttractionsByProvince } from '@/lib/api/thailand'
import { STATIC_ATTRACTIONS } from '@/data/thailand'
import type { Province, AttractionCategory, AttractionFilter } from '@/types/thailand.types'

const USE_STATIC = !import.meta.env.VITE_FOURSQUARE_API_KEY

function staticQuery(provinceId: string, category?: AttractionCategory) {
  const base = STATIC_ATTRACTIONS.filter((a) => a.provinceId === provinceId)
  const filtered = category ? base.filter((a) => a.category === category) : base
  return filtered.sort((a, b) => b.rating - a.rating)
}

export function useAttractionsByProvince(
  province: Province | null,
  filter: AttractionFilter = 'all',
) {
  const category = filter === 'all' ? undefined : (filter as AttractionCategory)

  return useQuery({
    queryKey: queryKeys.attractions.byProvince(province?.id ?? '', filter),
    enabled: province !== null,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: USE_STATIC
      ? () => staticQuery(province!.id, category)
      : async () => {
          try {
            return await fetchAttractionsByProvince(province!, category)
          } catch {
            // API unavailable — fall back to static data silently
            return staticQuery(province!.id, category)
          }
        },
  })
}
