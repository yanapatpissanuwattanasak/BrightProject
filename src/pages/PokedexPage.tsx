import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePokemonListInfinite, usePokemonByType } from '@/hooks/usePokemon'
import { PokemonCard } from '@/components/pokedex/PokemonCard'
import { PokemonDetail } from '@/components/pokedex/PokemonDetail'
import { TYPE_BG } from '@/components/pokedex/TypeBadge'

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]

const TYPE_VIEW_CHUNK = 20

// Hide scrollbars globally for this page
const PAGE_STYLE = `
  .pkdex-scroll::-webkit-scrollbar { display: none; }
  .pkdex-scroll { scrollbar-width: none; -ms-overflow-style: none; }
  .pkdex-type-btn { transition: all 0.15s ease; }
  .pkdex-type-btn:hover { background: rgba(255,255,255,0.04) !important; color: #E5E7EB !important; }
`

export default function PokedexPage() {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [typeVisible, setTypeVisible] = useState(TYPE_VIEW_CHUNK)
  const [selectedPokemon, setSelectedPokemon] = useState<{ name: string; rect: DOMRect } | null>(null)

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
  const totalCount = infiniteQuery.data?.pages[0].count ?? null

  return (
    <>
      <style>{PAGE_STYLE}</style>

      <div style={{
        height: '100svh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0d1117',
        color: '#F9FAFB',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden',
      }}>

        {/* ── Top bar ───────────────────────────────────────── */}
        <div style={{
          height: '56px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(13,17,23,0.92)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          zIndex: 10,
        }}>
          {/* Left — brand (aligned to sidebar width) */}
          <div style={{
            width: '220px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0 1.25rem',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            height: '100%',
          }}>
            <Link
              to="/"
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}
            >
              ←
            </Link>
            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
            <span style={{ fontSize: '1.25rem', color: '#EF4444', lineHeight: 1, flexShrink: 0 }}>⬤</span>
            <span style={{ fontWeight: 800, fontSize: '1.0625rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Pokédex
            </span>
          </div>

          {/* Right — search + count */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '440px' }}>
              <span style={{
                position: 'absolute', left: '0.875rem', top: '50%',
                transform: 'translateY(-50%)', color: '#4B5563', fontSize: '0.875rem', pointerEvents: 'none',
              }}>
                🔍
              </span>
              <input
                type="search"
                placeholder="Search Pokémon…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.625rem',
                  padding: '0.5rem 1rem 0.5rem 2.375rem',
                  color: '#F9FAFB',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>
            {totalCount && (
              <span style={{ color: '#374151', fontSize: '0.8rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {totalCount.toLocaleString()} Pokémon
              </span>
            )}
          </div>
        </div>

        {/* ── Content area ──────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Sidebar */}
          <div
            className="pkdex-scroll"
            style={{
              width: '220px',
              flexShrink: 0,
              background: '#0a0e17',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '1.25rem 0 1rem' }}>
              <p style={{
                color: '#374151',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                margin: '0 0 0.5rem',
                padding: '0 1.25rem',
              }}>
                Types
              </p>

              {/* All */}
              <button
                className="pkdex-type-btn"
                onClick={() => { setSelectedType(null); setSearch('') }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  width: '100%',
                  padding: '0.5rem 1.25rem',
                  background: !selectedType ? 'rgba(255,255,255,0.06)' : 'none',
                  border: 'none',
                  borderLeft: !selectedType ? '3px solid rgba(255,255,255,0.4)' : '3px solid transparent',
                  cursor: 'pointer',
                  color: !selectedType ? '#F9FAFB' : '#6B7280',
                  fontSize: '0.8375rem',
                  fontWeight: !selectedType ? 600 : 400,
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.3)', flexShrink: 0,
                }} />
                All
              </button>

              {/* Type list */}
              {POKEMON_TYPES.map((type) => {
                const color = TYPE_BG[type] ?? '#888'
                const active = selectedType === type
                return (
                  <button
                    key={type}
                    className="pkdex-type-btn"
                    onClick={() => handleTypeClick(type)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      width: '100%',
                      padding: '0.5rem 1.25rem',
                      background: active ? `${color}18` : 'none',
                      border: 'none',
                      borderLeft: active ? `3px solid ${color}` : '3px solid transparent',
                      cursor: 'pointer',
                      color: active ? '#F9FAFB' : '#6B7280',
                      fontSize: '0.8375rem',
                      fontWeight: active ? 600 : 400,
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      textTransform: 'capitalize',
                    }}
                  >
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: color, flexShrink: 0,
                      boxShadow: active ? `0 0 6px ${color}` : 'none',
                    }} />
                    {type}
                  </button>
                )
              })}
            </div>

            {/* Total count pinned at bottom */}
            {totalCount && (
              <div style={{
                marginTop: 'auto',
                padding: '0.875rem 1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                color: '#1F2937',
                fontSize: '0.75rem',
              }}>
                {totalCount.toLocaleString()} total
              </div>
            )}
          </div>

          {/* ── Main grid area ──────────────────────────────── */}
          <div
            className="pkdex-scroll"
            style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}
          >
            {isLoading && displayNames.length === 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="pkcard-skel" style={{ animationDelay: `${i * 0.04}s` }} />
                ))}
              </div>
            ) : displayNames.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50%' }}>
                <p style={{ color: '#374151', fontSize: '0.9rem' }}>No Pokémon found</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                {displayNames.map((name) => (
                  <PokemonCard
                    key={name}
                    name={name}
                    onClick={(n, rect) => setSelectedPokemon({ name: n, rect })}
                  />
                ))}
              </div>
            )}

            {/* Load more */}
            {!selectedType && infiniteQuery.hasNextPage && !search && (
              <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingBottom: '1rem' }}>
                <button
                  onClick={() => infiniteQuery.fetchNextPage()}
                  disabled={infiniteQuery.isFetchingNextPage}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#9CA3AF',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.625rem',
                    padding: '0.6875rem 2.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: infiniteQuery.isFetchingNextPage ? 'not-allowed' : 'pointer',
                    opacity: infiniteQuery.isFetchingNextPage ? 0.5 : 1,
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    if (!infiniteQuery.isFetchingNextPage) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                      e.currentTarget.style.color = '#F9FAFB'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = '#9CA3AF'
                  }}
                >
                  {infiniteQuery.isFetchingNextPage ? 'Loading…' : 'Load More'}
                </button>
              </div>
            )}

            {selectedType && typeHasMore && (
              <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingBottom: '1rem' }}>
                <button
                  onClick={() => setTypeVisible((v) => v + TYPE_VIEW_CHUNK)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#9CA3AF',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.625rem',
                    padding: '0.6875rem 2.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = '#F9FAFB'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = '#9CA3AF'
                  }}
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selectedPokemon && (
        <PokemonDetail
          name={selectedPokemon.name}
          sourceRect={selectedPokemon.rect}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </>
  )
}
