import { useEffect } from 'react'
import { usePokemonDetail } from '@/hooks/usePokemon'
import { TypeBadge } from './TypeBadge'

const STAT_COLORS: Record<string, string> = {
  hp: '#FF5959',
  attack: '#F5AC78',
  defense: '#FAE078',
  'special-attack': '#9DB7F5',
  'special-defense': '#A7DB8D',
  speed: '#FA92B2',
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'Sp.ATK',
  'special-defense': 'Sp.DEF',
  speed: 'SPD',
}

interface PokemonDetailProps {
  name: string
  onClose: () => void
}

export function PokemonDetail({ name, onClose }: PokemonDetailProps) {
  const { data, isLoading } = usePokemonDetail(name)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const sprite = data
    ? (data.sprites.other['official-artwork'].front_default ?? data.sprites.front_default)
    : null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#1F2937',
          borderRadius: '1.5rem',
          padding: '2rem 2rem 2.5rem',
          maxWidth: '460px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#9CA3AF',
            fontSize: '1rem',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
        >
          ✕
        </button>

        {isLoading || !data ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', fontSize: '0.9rem' }}>
            Loading…
          </div>
        ) : (
          <>
            {/* Sprite */}
            {sprite && (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={sprite}
                  alt={data.name}
                  width={180}
                  height={180}
                  style={{ margin: '0 auto', display: 'block', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}
                />
              </div>
            )}

            {/* Name */}
            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', margin: 0, fontWeight: 600, letterSpacing: '0.04em' }}>
                #{String(data.id).padStart(3, '0')}
              </p>
              <h2
                style={{
                  color: '#F9FAFB',
                  fontSize: '1.625rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  margin: '0.3rem 0 0.75rem',
                }}
              >
                {data.name.replace(/-/g, ' ')}
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {data.types.map((t) => (
                  <TypeBadge key={t.type.name} type={t.type.name} size="md" />
                ))}
              </div>
            </div>

            {/* Height / Weight */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.875rem',
                margin: '1.5rem 0',
              }}
            >
              {[
                { label: 'Height', value: `${(data.height / 10).toFixed(1)} m` },
                { label: 'Weight', value: `${(data.weight / 10).toFixed(1)} kg` },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '0.75rem',
                    padding: '0.875rem',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', margin: 0 }}>{item.label}</p>
                  <p style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '1.125rem', margin: '0.25rem 0 0' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div>
              <p
                style={{
                  color: '#6B7280',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: '0 0 0.875rem',
                }}
              >
                Base Stats
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {data.stats.map((s) => {
                  const color = STAT_COLORS[s.stat.name] ?? '#9CA3AF'
                  const label = STAT_LABELS[s.stat.name] ?? s.stat.name
                  const pct = Math.min((s.base_stat / 255) * 100, 100)
                  return (
                    <div key={s.stat.name} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span
                        style={{
                          color: '#9CA3AF',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          width: '56px',
                          flexShrink: 0,
                          textAlign: 'right',
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          color: '#F9FAFB',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          width: '30px',
                          flexShrink: 0,
                        }}
                      >
                        {s.base_stat}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '999px',
                          height: '6px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: color,
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Abilities */}
            <div style={{ marginTop: '1.5rem' }}>
              <p
                style={{
                  color: '#6B7280',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: '0 0 0.625rem',
                }}
              >
                Abilities
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {data.abilities.map((a) => (
                  <span
                    key={a.ability.name}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: a.is_hidden ? '#9CA3AF' : '#E5E7EB',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.8125rem',
                      textTransform: 'capitalize',
                      fontStyle: a.is_hidden ? 'italic' : 'normal',
                      border: a.is_hidden
                        ? '1px dashed rgba(255,255,255,0.15)'
                        : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {a.ability.name.replace(/-/g, ' ')}
                    {a.is_hidden && ' (hidden)'}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
