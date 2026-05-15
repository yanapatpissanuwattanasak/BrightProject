export interface PokemonTypeSlot {
  slot: number
  type: { name: string; url: string }
}

export interface PokemonStat {
  base_stat: number
  stat: { name: string; url: string }
}

export interface PokemonAbility {
  ability: { name: string; url: string }
  is_hidden: boolean
  slot: number
}

export interface Pokemon {
  id: number
  name: string
  height: number
  weight: number
  types: PokemonTypeSlot[]
  stats: PokemonStat[]
  abilities: PokemonAbility[]
  sprites: {
    front_default: string | null
    other: {
      'official-artwork': { front_default: string | null }
    }
  }
}

export interface PokemonListItem {
  name: string
  url: string
}

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: PokemonListItem[]
}

export type PokemonTypeName =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy'
