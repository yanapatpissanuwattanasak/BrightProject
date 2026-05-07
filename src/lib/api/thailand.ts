import type { Attraction, AttractionCategory, Province } from '@/types/thailand.types'

const BASE = '/tat-api'

function headers(): HeadersInit {
  return {
    'x-api-key': import.meta.env.VITE_TAT_API_KEY,
    'Accept-Language': 'en',
  }
}

// TAT API uses keyword search for sub-category filtering
const CATEGORY_KEYWORDS: Partial<Record<AttractionCategory, string>> = {
  temple: 'temple',
  beach: 'beach',
  museum: 'museum',
  market: 'market',
  waterfall: 'waterfall',
  viewpoint: 'viewpoint',
  historical: 'historical',
}

interface TatPlace {
  placeId: string
  name: string | null
  introduction: string | null
  category: { categoryId: number; name: string }
  latitude: string | null
  longitude: string | null
  thumbnailUrl: string[]
  viewer: number
}

interface TatPlaceResponse {
  data: TatPlace[]
}

export async function fetchAttractionsByProvince(
  province: Province,
  category?: AttractionCategory,
): Promise<Attraction[]> {
  const params = new URLSearchParams({
    province_id: String(province.tatId),
    place_category_id: '3', // 3 = Attraction
    limit: '10',
    has_name: 'true',
    has_thumbnail: 'true',
  })

  const keyword = category ? CATEGORY_KEYWORDS[category] : undefined
  if (keyword) params.set('keyword', keyword)

  const res = await fetch(`${BASE}/places?${params}`, { headers: headers() })
  if (!res.ok) throw new Error(`TAT API failed: ${res.status}`)

  const data: TatPlaceResponse = await res.json()

  return (data.data ?? [])
    .filter((p) => p.name)
    .sort((a, b) => (b.viewer ?? 0) - (a.viewer ?? 0))
    .map((place): Attraction => ({
      id: place.placeId,
      name: place.name!,
      provinceId: province.id,
      category: category ?? 'nature',
      rating: 4.0,
      description: place.introduction ?? '',
      imageUrl: place.thumbnailUrl[0] ?? '',
      coordinates: {
        lat: parseFloat(place.latitude ?? '0'),
        lon: parseFloat(place.longitude ?? '0'),
      },
    }))
}
