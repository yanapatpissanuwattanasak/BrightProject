export type Region = 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast'

export type AttractionCategory =
  | 'nature'
  | 'temple'
  | 'beach'
  | 'museum'
  | 'market'
  | 'waterfall'
  | 'viewpoint'
  | 'historical'

export type AttractionFilter = AttractionCategory | 'all'

export interface Province {
  id: string       // slugified TopoJSON NAME_1, used for map matching
  name: string     // English (matches TopoJSON NAME_1 exactly)
  nameTh: string   // Thai name
  tatName: string  // English display name
  tatId: number    // TAT Data API numeric province ID
  region: Region
}

export interface Attraction {
  id: string
  name: string
  provinceId: string
  category: AttractionCategory
  rating: number   // 1.0 – 5.0
  description: string
  imageUrl: string
  coordinates: { lat: number; lon: number }
}

export const CATEGORY_LABELS: Record<AttractionFilter, string> = {
  all: 'All',
  nature: 'Nature',
  temple: 'Temple',
  beach: 'Beach',
  museum: 'Museum',
  market: 'Market',
  waterfall: 'Waterfall',
  viewpoint: 'Viewpoint',
  historical: 'Historical',
}
