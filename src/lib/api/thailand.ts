import type { Attraction, AttractionCategory, Province } from '@/types/thailand.types'

const BASE = 'https://api.foursquare.com/v3'

function headers(): HeadersInit {
  return { Authorization: import.meta.env.VITE_FOURSQUARE_API_KEY }
}

// Foursquare category IDs mapped to our AttractionCategory
const FSQ_CATEGORIES: Record<AttractionCategory, string> = {
  nature: '16032,16034,16020',     // Nature Reserve, Park, Garden
  temple: '12104',                  // Temple
  beach: '16019',                   // Beach
  museum: '10028,10026',            // Museum, Art Museum
  market: '17066,17114',            // Flea Market, Market
  waterfall: '16042',               // Waterfall
  viewpoint: '16046',               // Scenic Lookout
  historical: '10027,10017',        // Historic Site, Architecture
}

// FSQ categories → our AttractionCategory (first-match wins)
const FSQ_TO_CAT: [string, AttractionCategory][] = [
  ['12104', 'temple'],
  ['16019', 'beach'],
  ['16042', 'waterfall'],
  ['16046', 'viewpoint'],
  ['10028', 'museum'], ['10026', 'museum'],
  ['17066', 'market'], ['17114', 'market'],
  ['10027', 'historical'], ['10017', 'historical'],
]

function detectCategory(
  categories: { id: number }[],
  fallback?: AttractionCategory,
): AttractionCategory {
  for (const [id, cat] of FSQ_TO_CAT) {
    if (categories.some((c) => String(c.id) === id)) return cat
  }
  return fallback ?? 'nature'
}

interface FsqPlace {
  fsq_id: string
  name: string
  categories: { id: number; name: string }[]
  rating?: number
  description?: string
  geocodes?: { main: { latitude: number; longitude: number } }
  photos?: { prefix: string; suffix: string }[]
}

interface FsqSearchResponse {
  results: FsqPlace[]
}

export async function fetchAttractionsByProvince(
  province: Province,
  category?: AttractionCategory,
): Promise<Attraction[]> {
  const params = new URLSearchParams({
    near: `${province.tatName}, Thailand`,
    limit: '10',
    fields: 'fsq_id,name,categories,rating,description,geocodes,photos',
  })
  if (category) params.set('categories', FSQ_CATEGORIES[category])

  const res = await fetch(`${BASE}/places/search?${params}`, { headers: headers() })
  if (!res.ok) throw new Error(`Foursquare search failed: ${res.status}`)

  const data: FsqSearchResponse = await res.json()

  return (data.results ?? []).map((place): Attraction => {
    const photo = place.photos?.[0]
    const imageUrl = photo ? `${photo.prefix}300x300${photo.suffix}` : ''
    const rating = place.rating ? place.rating / 2 : 4.0  // FSQ rating is 0-10 → 0-5

    return {
      id: place.fsq_id,
      name: place.name,
      provinceId: province.id,
      category: detectCategory(place.categories, category),
      rating: Math.min(5, Math.max(1, parseFloat(rating.toFixed(1)))),
      description: (place.description ?? '').slice(0, 200),
      imageUrl,
      coordinates: {
        lat: place.geocodes?.main.latitude ?? 0,
        lon: place.geocodes?.main.longitude ?? 0,
      },
    }
  }).sort((a, b) => b.rating - a.rating)
}
