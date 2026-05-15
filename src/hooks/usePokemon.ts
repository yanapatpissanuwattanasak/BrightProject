import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { fetchPokemon, fetchPokemonByType, fetchPokemonList } from '@/lib/api/pokedex'
import { queryKeys } from '@/constants/queryKeys'

const PAGE_SIZE = 20

export function usePokemonListInfinite() {
  return useInfiniteQuery({
    queryKey: queryKeys.pokemon.listInfinite(PAGE_SIZE),
    queryFn: ({ pageParam }) => fetchPokemonList(pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined
      const url = new URL(lastPage.next)
      return parseInt(url.searchParams.get('offset') ?? '0', 10)
    },
    initialPageParam: 0,
    staleTime: 10 * 60 * 1000,
  })
}

export function usePokemonDetail(nameOrId: string | number | null) {
  return useQuery({
    queryKey: queryKeys.pokemon.detail(nameOrId ?? ''),
    queryFn: () => fetchPokemon(nameOrId!),
    enabled: nameOrId !== null && nameOrId !== '',
    staleTime: 24 * 60 * 60 * 1000,
  })
}

export function usePokemonByType(type: string | null) {
  return useQuery({
    queryKey: queryKeys.pokemon.byType(type ?? ''),
    queryFn: () => fetchPokemonByType(type!),
    enabled: !!type,
    staleTime: 10 * 60 * 1000,
  })
}
