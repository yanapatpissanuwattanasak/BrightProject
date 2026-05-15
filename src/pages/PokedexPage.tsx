import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePokemonListInfinite, usePokemonByType } from '@/hooks/usePokemon'
import { PokemonCard } from '@/components/pokedex/PokemonCard'
import { PokemonDetail } from '@/components/pokedex/PokemonDetail'
import { TypeBadge } from '@/components/pokedex/TypeBadge'

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]

const TYPE_VIEW_CHUNK = 20

export default function PokedexPage() {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [typeVisible, setTypeVisible] = useState(TYPE_VIEW_CHUNK)
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null)

  const infiniteQuery = usePokemonListInfinite()
  const typeQuery = usePokemonByType(selectedType)

  const displayNames = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (selectedType) {
      const all = (typeQuery.data?.pokemon ?? []).map((p) => p.pokemon.name)
      const filtered = q ? all.filter((n) => n.includes(q)) : all
      return filtered.slice(0, typeVisible)
    }

    const all = (infiniteQuery.data?.pages ?? []).flatMap((p) => p.results.map((r) => r.name))
    return q ? all.filter((n) => n.includes(q)) : all
  }, [selectedType, typeQuery.data, infiniteQuery.data, search, typeVisible])

  const typeHasMore = useMemo(() => {
    if (!selectedType || !typeQuery.data) return false
    const q = search.trim().toLowerCase()
    const all = typeQuery.data.pokemon.map((p) => p.pokemon.name)
    const filtered = q ? all.filter((n) => n.includes(q)) : all
    return filtered.length > typeVisible
  }, [selectedType, typeQuery.data, search, typeVisible])

  function handleTypeClick(type: string) {
    setSelectedType((prev) => (prev === type ? null : type))
    setTypeVisible(TYPE_VIEW_CHUNK)
    setSearch('')
  }

  const isLoading = selectedType ? typeQuery.isLoading : infiniteQuery.isLoading
  const totalCount = !selectedType && infiniteQuery.data
    ? infiniteQuery.data.pages[0].count
    : null

  return (
    <>
      <style>{`
        @keyframes pokedex-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111827; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
      `}</style>

      <div style={{ minHeight: '100svh', background: '#111827', color: '#F9FAFB', fontFamily: "'Inter', system-ui, sans-serif" }}>

        {/* Header */}
        <div style={{ background: '#DC2626', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/"
              style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              ← Back
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⬤</span>
              <h1 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Pokédex
              </h1>
            </div>
            {totalCount && (
              <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.65)', marginLeft: '0.25rem' }}>
                {totalCount.toLocaleString()} Pokémon
              </span>
            )}
          </div>

          {/* Search */}
          <input
            type="search"
            placeholder="Search name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '999px',
              padding: '0.5rem 1rem',
              color: '#fff',
              fontSize: '0.875rem',
              outline: 'none',
              width: '200px',
            }}
          />
        </div>

        {/* Type filter */}
        <div style={{ padding: '1rem 1.5rem 0', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {POKEMON_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeClick(type)}
              style={{
                background: 'none',
                border: selectedType === type ? '2px solid #fff' : '2px solid transparent',
                borderRadius: '999px',
                padding: '0.1rem 0.1rem',
                cursor: 'pointer',
                opacity: selectedType && selectedType !== type ? 0.45 : 1,
                transition: 'opacity 0.15s, border-color 0.15s',
              }}
            >
              <TypeBadge type={type} />
            </button>
          ))}
          {selectedType && (
            <button
              onClick={() => { setSelectedType(null); setSearch('') }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '999px',
                padding: '0.2rem 0.75rem',
                color: '#9CA3AF',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Grid */}
        <div style={{ padding: '1.25rem 1.5rem 3rem' }}>
          {isLoading && displayNames.length === 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.875rem',
              }}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '1rem',
                    minHeight: '190px',
                    animation: 'pokedex-pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          ) : displayNames.length === 0 ? (
            <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '3rem' }}>
              No Pokémon found
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.875rem',
              }}
            >
              {displayNames.map((name) => (
                <PokemonCard key={name} name={name} onClick={setSelectedPokemon} />
              ))}
            </div>
          )}

          {/* Load more — paginated view */}
          {!selectedType && infiniteQuery.hasNextPage && !search && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={() => infiniteQuery.fetchNextPage()}
                disabled={infiniteQuery.isFetchingNextPage}
                style={{
                  background: '#DC2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.75rem 2.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: infiniteQuery.isFetchingNextPage ? 'not-allowed' : 'pointer',
                  opacity: infiniteQuery.isFetchingNextPage ? 0.65 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {infiniteQuery.isFetchingNextPage ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}

          {/* Show more — type view */}
          {selectedType && typeHasMore && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={() => setTypeVisible((v) => v + TYPE_VIEW_CHUNK)}
                style={{
                  background: '#DC2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.75rem 2.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Show More
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedPokemon && (
        <PokemonDetail name={selectedPokemon} onClose={() => setSelectedPokemon(null)} />
      )}
    </>
  )
}
