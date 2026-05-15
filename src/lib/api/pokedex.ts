import type { Pokemon, PokemonListResponse } from '@/types/pokemon.types'

const BASE = 'https://pokeapi.co/api/v2'

export async function fetchPokemonList(offset = 0, limit = 20): Promise<PokemonListResponse> {
  const res = await fetch(`${BASE}/pokemon?offset=${offset}&limit=${limit}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchPokemon(nameOrId: string | number): Promise<Pokemon> {
  const res = await fetch(`${BASE}/pokemon/${nameOrId}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchPokemonByType(
  type: string,
): Promise<{ pokemon: Array<{ pokemon: { name: string; url: string } }> }> {
  const res = await fetch(`${BASE}/type/${type}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
