import { usePokemonDetail } from '@/hooks/usePokemon'
import { TypeBadge, TYPE_BG } from './TypeBadge'

if (typeof document !== 'undefined' && !document.getElementById('pkcard-css')) {
  const s = document.createElement('style')
  s.id = 'pkcard-css'
  s.textContent = `
    .pkcard {
      position: relative;
      padding: 2px;
      border-radius: 1.125rem;
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
      color: inherit;
      display: block;
      width: 100%;
    }

    /* Racing border — only the 2px padding strip is visible */
    .pkcard-ring {
      position: absolute;
      inset: 0;
      border-radius: 1.125rem;
      overflow: hidden;
      z-index: 0;
      opacity: 0;
      transition: opacity 0.25s ease;
      pointer-events: none;
    }
    .pkcard:hover .pkcard-ring { opacity: 1; }
    .pkcard-ring::before {
      content: '';
      position: absolute;
      inset: -100%;
      background: conic-gradient(
        from 0deg,
        transparent 0deg,
        transparent 348deg,
        var(--pkglow, rgba(255,255,255,0.95)) 356deg,
        transparent 360deg
      );
      animation: pkcard-spin 1.6s linear infinite;
    }
    @keyframes pkcard-spin { to { transform: rotate(360deg); } }

    /* Card body — tilt + lift handled entirely by JS */
    .pkcard-body {
      position: relative;
      z-index: 1;
      border-radius: 1rem;
      background: #1a2433;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1.25rem 1rem;
      text-align: center;
      min-height: 190px;
      will-change: transform;
    }

    /* Sprite bounces up on hover */
    .pkcard-sprite {
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: block;
    }
    .pkcard:hover .pkcard-sprite {
      transform: translateY(-8px) scale(1.14);
    }

    /* Skeleton */
    .pkcard-skel {
      background: rgba(255,255,255,0.05);
      border-radius: 1rem;
      min-height: 190px;
      animation: pkcard-pulse 1.5s ease-in-out infinite;
    }
    @keyframes pkcard-pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.7; }
    }
  `
  document.head.appendChild(s)
}

interface PokemonCardProps {
  name: string
  onClick: (name: string, rect: DOMRect) => void
}

export function PokemonCard({ name, onClick }: PokemonCardProps) {
  const { data, isLoading } = usePokemonDetail(name)

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const body = e.currentTarget.querySelector<HTMLElement>('.pkcard-body')
    if (!body) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width   // 0 → 1
    const y = (e.clientY - rect.top) / rect.height   // 0 → 1
    const rotateY = (x - 0.5) * 44   // left: -22deg, right: +22deg
    const rotateX = -(y - 0.5) * 30  // top: +15deg, bottom: -15deg
    body.style.transition = 'background 0.2s ease, box-shadow 0.2s ease'
    body.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-28px) scale(1.07)`
    body.style.background = '#1e2d42'
    body.style.boxShadow = `0 28px 48px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.4)`
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
    const body = e.currentTarget.querySelector<HTMLElement>('.pkcard-body')
    if (!body) return
    body.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1), background 0.25s ease, box-shadow 0.45s ease'
    body.style.transform = ''
    body.style.background = ''
    body.style.boxShadow = ''
  }

  if (isLoading || !data) {
    return <div className="pkcard-skel" />
  }

  const sprite =
    data.sprites.other['official-artwork'].front_default ?? data.sprites.front_default
  const primaryType = data.types[0]?.type.name ?? 'normal'
  const glowColor = TYPE_BG[primaryType] ?? 'rgba(255,255,255,0.8)'

  return (
    <button
      className="pkcard"
      style={{ '--pkglow': glowColor } as React.CSSProperties}
      onClick={(e) => onClick(name, e.currentTarget.getBoundingClientRect())}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pkcard-ring" aria-hidden="true" />

      <div className="pkcard-body">
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
            className="pkcard-sprite"
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        )}

        <span style={{ color: '#F3F4F6', fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>
          {data.name.replace(/-/g, ' ')}
        </span>

        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {data.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </div>
      </div>
    </button>
  )
}
