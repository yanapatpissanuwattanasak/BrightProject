import { usePokemonDetail } from '@/hooks/usePokemon'
import { TypeBadge } from './TypeBadge'

interface PokemonCardProps {
  name: string
  onClick: (name: string) => void
}

export function PokemonCard({ name, onClick }: PokemonCardProps) {
  const { data, isLoading } = usePokemonDetail(name)

  if (isLoading || !data) {
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '1rem',
          minHeight: '190px',
          animation: 'pokedex-pulse 1.5s ease-in-out infinite',
        }}
      />
    )
  }

  const sprite =
    data.sprites.other['official-artwork'].front_default ?? data.sprites.front_default

  return (
    <button
      onClick={() => onClick(name)}
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem',
        padding: '1.25rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
        width: '100%',
        textAlign: 'center',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'rgba(255,255,255,0.1)'
        el.style.transform = 'translateY(-5px)'
        el.style.boxShadow = '0 12px 28px rgba(0,0,0,0.45)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'rgba(255,255,255,0.05)'
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      <span style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 700, letterSpacing: '0.04em' }}>
        #{String(data.id).padStart(3, '0')}
      </span>
      {sprite ? (
        <img
          src={sprite}
          alt={data.name}
          width={88}
          height={88}
          loading="lazy"
          style={{ objectFit: 'contain' }}
        />
      ) : (
        <div style={{ width: 88, height: 88, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
      )}
      <span
        style={{
          color: '#F3F4F6',
          fontWeight: 600,
          fontSize: '0.9rem',
          textTransform: 'capitalize',
        }}
      >
        {data.name.replace(/-/g, ' ')}
      </span>
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {data.types.map((t) => (
          <TypeBadge key={t.type.name} type={t.type.name} />
        ))}
      </div>
    </button>
  )
}
