import { useEffect, useState } from 'react'
import { usePokemonDetail } from '@/hooks/usePokemon'
import { TypeBadge, TYPE_BG } from './TypeBadge'

if (typeof document !== 'undefined' && !document.getElementById('pkm-modal-css')) {
  const s = document.createElement('style')
  s.id = 'pkm-modal-css'
  s.textContent = `
    @keyframes pkm-enter {
      0%   { opacity:0; transform:perspective(1200px) scale(0.05) rotateX(-90deg) rotateY(-25deg); filter:brightness(6) saturate(0) blur(12px); }
      52%  { opacity:1; transform:perspective(1200px) scale(1.09) rotateX(7deg) rotateY(2deg);     filter:brightness(1.3) saturate(1.4) blur(0px); }
      72%  { transform:perspective(1200px) scale(0.96) rotateX(-2deg) rotateY(-0.5deg);            filter:brightness(1.05) saturate(1.05); }
      88%  { transform:perspective(1200px) scale(1.02) rotateX(0.5deg) rotateY(0deg); }
      100% { opacity:1; transform:perspective(1200px) scale(1) rotateX(0deg) rotateY(0deg);        filter:brightness(1) saturate(1); }
    }
    @keyframes pkm-exit {
      0%   { opacity:1; transform:perspective(1200px) scale(1) rotateX(0deg);   filter:brightness(1) saturate(1) blur(0); }
      22%  { opacity:1; transform:perspective(1200px) scale(1.07) rotateX(-16deg); filter:brightness(2.5) saturate(0.2) blur(0); }
      100% { opacity:0; transform:perspective(1200px) scale(0.04) rotateX(95deg); filter:brightness(7) saturate(0) blur(14px); }
    }

    @keyframes pkm-bd-in {
      0%   { background:rgba(0,0,0,0); }
      18%  { background:var(--pkm-flash, rgba(112,56,248,0.65)); }
      100% { background:rgba(0,0,0,0.88); }
    }
    @keyframes pkm-bd-out {
      0%   { background:rgba(0,0,0,0.88); }
      22%  { background:var(--pkm-flash, rgba(112,56,248,0.5)); }
      100% { background:rgba(0,0,0,0); }
    }

    @keyframes pkm-ring {
      0%,100% { opacity:0.55; box-shadow:0 0 18px 3px var(--pkm-rc,rgba(112,56,248,0.5)); }
      50%      { opacity:1;    box-shadow:0 0 42px 12px var(--pkm-rc,rgba(112,56,248,0.8)), 0 0 90px 24px var(--pkm-rcd,rgba(112,56,248,0.25)); }
    }
    @keyframes pkm-ring-spin {
      to { transform:rotate(360deg); }
    }

    @keyframes pkm-sparkle {
      0%,100% { opacity:0; transform:scale(0) rotate(0deg); }
      40%,60%  { opacity:1; transform:scale(1) rotate(180deg); }
    }

    @keyframes pkm-sprite-drop {
      0%   { opacity:0; transform:translateY(-90px) scale(0.35) rotate(-28deg); filter:brightness(7) saturate(0); }
      52%  { opacity:1; transform:translateY(16px)  scale(1.24) rotate(5deg);   filter:brightness(1.6) saturate(1.7); }
      73%  { transform:translateY(-8px) scale(0.95) rotate(-2deg);               filter:brightness(1.1) saturate(1.1); }
      88%  { transform:translateY(3px)  scale(1.02) rotate(0.5deg); }
      100% { opacity:1; transform:translateY(0) scale(1) rotate(0deg);           filter:brightness(1) saturate(1); }
    }
    @keyframes pkm-float {
      0%,100% { transform:translateY(0px) rotate(0.4deg); }
      38%      { transform:translateY(-14px) rotate(-0.6deg); }
      68%      { transform:translateY(-7px) rotate(0.4deg); }
    }
    @keyframes pkm-halo {
      0%,100% { opacity:0.22; transform:scale(0.78); }
      50%      { opacity:0.62; transform:scale(1.18); }
    }

    @keyframes pkm-header-bg {
      0%,100% { opacity:0.18; }
      50%      { opacity:0.35; }
    }
    @keyframes pkm-shimmer {
      0%   { transform:translateX(-220%) skewX(-22deg); }
      100% { transform:translateX(420%) skewX(-22deg); }
    }

    @keyframes pkm-slide-up {
      0%   { opacity:0; transform:translateY(26px); }
      100% { opacity:1; transform:translateY(0); }
    }
    .pkm-modal { scrollbar-width:none; -ms-overflow-style:none; }
    .pkm-modal::-webkit-scrollbar { display:none; }
  `
  document.head.appendChild(s)
}

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

// Sparkles distributed around backdrop viewport
const SPARKLES = [
  { id: 0, top: '8%',  left: '10%', size: 7,  delay: 0.1,  dur: 2.0 },
  { id: 1, top: '12%', left: '88%', size: 9,  delay: 0.55, dur: 1.8 },
  { id: 2, top: '30%', left: '93%', size: 5,  delay: 1.1,  dur: 2.3 },
  { id: 3, top: '55%', left: '91%', size: 8,  delay: 0.3,  dur: 2.0 },
  { id: 4, top: '76%', left: '87%', size: 6,  delay: 0.9,  dur: 1.7 },
  { id: 5, top: '88%', left: '9%',  size: 9,  delay: 0.65, dur: 2.2 },
  { id: 6, top: '65%', left: '5%',  size: 6,  delay: 1.4,  dur: 1.9 },
  { id: 7, top: '22%', left: '4%',  size: 8,  delay: 0.4,  dur: 2.1 },
  { id: 8, top: '42%', left: '95%', size: 5,  delay: 1.7,  dur: 2.4 },
  { id: 9, top: '48%', left: '3%',  size: 7,  delay: 0.8,  dur: 1.6 },
]

function hexAlpha(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

interface PokemonDetailProps {
  name: string
  sourceRect: DOMRect | null
  onClose: () => void
}

type Phase = 'entering' | 'entered' | 'exiting'

export function PokemonDetail({ name, onClose }: PokemonDetailProps) {
  const { data, isLoading } = usePokemonDetail(name)
  const [phase, setPhase] = useState<Phase>('entering')
  const [statsVisible, setStatsVisible] = useState(false)

  // entering → entered after animation completes
  useEffect(() => {
    const t = setTimeout(() => setPhase('entered'), 720)
    return () => clearTimeout(t)
  }, [])

  // Trigger stat bar fill after modal has settled
  useEffect(() => {
    if (phase !== 'entered') return
    const t = setTimeout(() => setStatsVisible(true), 120)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') triggerClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function triggerClose() {
    setStatsVisible(false)
    setPhase('exiting')
    setTimeout(onClose, 520)
  }

  const sprite = data
    ? (data.sprites.other['official-artwork'].front_default ?? data.sprites.front_default)
    : null

  const primaryType = data?.types[0]?.type.name ?? 'normal'
  const typeColor   = TYPE_BG[primaryType] ?? '#7038F8'

  // Backdrop
  const bdAnimation =
    phase === 'entering' ? 'pkm-bd-in 0.58s ease forwards' :
    phase === 'exiting'  ? 'pkm-bd-out 0.52s ease forwards' : 'none'
  const bdBg = phase === 'entered' ? 'rgba(0,0,0,0.88)' : undefined

  // Modal box
  const modalAnimation =
    phase === 'entering' ? 'pkm-enter 0.68s cubic-bezier(0.34,1.22,0.64,1) forwards' :
    phase === 'exiting'  ? 'pkm-exit  0.48s cubic-bezier(0.4,0,0.8,1) forwards' : 'none'

  // Glow ring (only in entered state)
  const ringVisible = phase === 'entered'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1rem',
        background: bdBg,
        animation: bdAnimation,
        '--pkm-flash': hexAlpha(typeColor, 0.62),
      } as React.CSSProperties}
      onClick={(e) => { if (e.target === e.currentTarget) triggerClose() }}
    >
      {/* Backdrop sparkles */}
      {phase !== 'entering' && SPARKLES.map((sp) => (
        <div
          key={sp.id}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: sp.top,
            left: sp.left,
            width: sp.size,
            height: sp.size,
            background: typeColor,
            borderRadius: '1px',
            transform: 'rotate(45deg)',
            pointerEvents: 'none',
            filter: `drop-shadow(0 0 ${sp.size + 3}px ${typeColor})`,
            animation: `pkm-sparkle ${sp.dur}s ease-in-out ${sp.delay}s infinite`,
          }}
        />
      ))}

      {/* Modal wrapper — provides positioning context for the glow ring */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '460px' }}>

        {/* Pulsing glow ring */}
        {ringVisible && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '1.9rem',
              border: `2px solid ${hexAlpha(typeColor, 0.7)}`,
              animation: 'pkm-ring 2.6s ease-in-out infinite',
              pointerEvents: 'none',
              '--pkm-rc':  hexAlpha(typeColor, 0.55),
              '--pkm-rcd': hexAlpha(typeColor, 0.22),
            } as React.CSSProperties}
          />
        )}

        {/* Spinning conic border strip (always present, only visible in entered) */}
        {ringVisible && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: -3,
              borderRadius: '1.85rem',
              overflow: 'hidden',
              pointerEvents: 'none',
              opacity: 0.6,
            }}
          >
            <div style={{
              position: 'absolute',
              inset: '-100%',
              background: `conic-gradient(from 0deg, transparent 0deg, transparent 340deg, ${typeColor} 352deg, #fff 356deg, ${typeColor} 360deg)`,
              animation: 'pkm-ring-spin 2.2s linear infinite',
            }} />
          </div>
        )}

        {/* Modal box */}
        <div
          className="pkm-modal"
          style={{
            position: 'relative',
            background: `radial-gradient(ellipse at 50% 22%, ${hexAlpha(typeColor, 0.3)} 0%, transparent 55%), linear-gradient(165deg, #1a2535 0%, #0f1724 100%)`,
            borderRadius: '1.75rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: `1.5px solid ${hexAlpha(typeColor, 0.28)}`,
            transformOrigin: 'center center',
            animation: modalAnimation,
          }}
        >
          {/* ── Header section ─────────────────────────────────── */}
          <div
            style={{
              position: 'relative',
              padding: '2.75rem 2rem 1.75rem',
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
          

            {/* Close button */}
            <button
              onClick={triggerClose}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255,255,255,0.07)',
                border: `1px solid ${hexAlpha(typeColor, 0.35)}`,
                borderRadius: '50%',
                width: '2.25rem',
                height: '2.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#9CA3AF',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.background = hexAlpha(typeColor, 0.25)
                el.style.color = '#fff'
                el.style.borderColor = hexAlpha(typeColor, 0.7)
                el.style.boxShadow = `0 0 16px ${hexAlpha(typeColor, 0.4)}`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.background = 'rgba(255,255,255,0.07)'
                el.style.color = '#9CA3AF'
                el.style.borderColor = hexAlpha(typeColor, 0.35)
                el.style.boxShadow = ''
              }}
            >
              ✕
            </button>

            {/* Sprite + halo */}
            <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
              {/* Halo glow circle */}
              <div aria-hidden="true" style={{
                position: 'absolute',
                inset: '-28px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${hexAlpha(typeColor, 0.55)} 0%, transparent 70%)`,
                animation: 'pkm-halo 2.4s ease-in-out infinite',
                pointerEvents: 'none',
              }} />

              {sprite ? (
                <img
                  src={sprite}
                  alt={data!.name}
                  width={200}
                  height={200}
                  style={{
                    display: 'block',
                    position: 'relative',
                    zIndex: 1,
                    filter: `drop-shadow(0 0 22px ${hexAlpha(typeColor, 0.8)}) drop-shadow(0 10px 30px rgba(0,0,0,0.65))`,
                    animation: phase === 'exiting'
                      ? 'none'
                      : 'pkm-sprite-drop 0.62s cubic-bezier(0.34,1.56,0.64,1) 0.18s both, pkm-float 4s ease-in-out 0.82s infinite',
                  }}
                />
              ) : (
                <div style={{ width: 200, height: 200 }} />
              )}
            </div>

            {/* ID + Name */}
            <div style={{
              position: 'relative', zIndex: 1,
              animation: phase === 'exiting' ? 'none' : 'pkm-slide-up 0.45s ease 0.32s both',
            }}>
              <p style={{
                color: hexAlpha(typeColor, 0.85),
                fontSize: '0.8rem',
                margin: '0.9rem 0 0',
                fontWeight: 700,
                letterSpacing: '0.1em',
              }}>
                #{String(data?.id ?? 0).padStart(3, '0')}
              </p>
              <h2 style={{
                color: '#F9FAFB',
                fontSize: '1.85rem',
                fontWeight: 800,
                textTransform: 'capitalize',
                margin: '0.2rem 0 0.8rem',
                textShadow: `0 0 32px ${hexAlpha(typeColor, 0.65)}`,
                letterSpacing: '-0.01em',
              }}>
                {data?.name.replace(/-/g, ' ') ?? name}
              </h2>
            </div>

            {/* Types */}
            {data && (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 1,
                animation: phase === 'exiting' ? 'none' : 'pkm-slide-up 0.45s ease 0.42s both',
              }}>
                {data.types.map((t) => <TypeBadge key={t.type.name} type={t.type.name} size="md" />)}
              </div>
            )}
          </div>

          {/* ── Body content ───────────────────────────────────── */}
          {isLoading || !data ? (
            <div style={{ textAlign: 'center', padding: '3rem 2rem', color: '#9CA3AF', fontSize: '0.9rem' }}>
              Loading…
            </div>
          ) : (
            <div style={{ padding: '0 2rem 2.5rem' }}>

              {/* Height / Weight */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.875rem',
                marginBottom: '1.75rem',
                animation: phase === 'exiting' ? 'none' : 'pkm-slide-up 0.45s ease 0.5s both',
              }}>
                {[
                  { label: 'Height', value: `${(data.height / 10).toFixed(1)} m` },
                  { label: 'Weight', value: `${(data.weight / 10).toFixed(1)} kg` },
                ].map((item) => (
                  <div key={item.label} style={{
                    background: `linear-gradient(135deg, ${hexAlpha(typeColor, 0.1)}, rgba(255,255,255,0.03))`,
                    border: `1px solid ${hexAlpha(typeColor, 0.2)}`,
                    borderRadius: '1rem',
                    padding: '1rem',
                    textAlign: 'center',
                  }}>
                    <p style={{ color: '#6B7280', fontSize: '0.75rem', margin: 0 }}>{item.label}</p>
                    <p style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '1.25rem', margin: '0.25rem 0 0' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div style={{ animation: phase === 'exiting' ? 'none' : 'pkm-slide-up 0.45s ease 0.6s both' }}>
                <p style={{
                  color: hexAlpha(typeColor, 0.7),
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  margin: '0 0 1rem',
                }}>
                  Base Stats
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {data.stats.map((s, i) => {
                    const color = STAT_COLORS[s.stat.name] ?? '#9CA3AF'
                    const label = STAT_LABELS[s.stat.name] ?? s.stat.name
                    const pct   = Math.min((s.base_stat / 255) * 100, 100)
                    return (
                      <div key={s.stat.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: '#6B7280', fontSize: '0.7rem', fontWeight: 700, width: '56px', flexShrink: 0, textAlign: 'right' }}>
                          {label}
                        </span>
                        <span style={{ color: '#F9FAFB', fontSize: '0.875rem', fontWeight: 700, width: '32px', flexShrink: 0 }}>
                          {s.base_stat}
                        </span>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '999px', height: '7px', overflow: 'hidden' }}>
                          <div style={{
                            width: statsVisible ? `${pct}%` : '0%',
                            height: '100%',
                            background: `linear-gradient(to right, ${color}99, ${color})`,
                            borderRadius: '999px',
                            transition: `width 0.75s cubic-bezier(0.4,0,0.2,1) ${i * 95}ms`,
                            boxShadow: statsVisible ? `0 0 10px ${color}aa` : 'none',
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Abilities */}
              <div style={{ marginTop: '1.75rem', animation: phase === 'exiting' ? 'none' : 'pkm-slide-up 0.45s ease 0.85s both' }}>
                <p style={{
                  color: hexAlpha(typeColor, 0.7),
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  margin: '0 0 0.75rem',
                }}>
                  Abilities
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {data.abilities.map((a) => (
                    <span key={a.ability.name} style={{
                      background: `linear-gradient(135deg, ${hexAlpha(typeColor, 0.18)}, ${hexAlpha(typeColor, 0.08)})`,
                      color: a.is_hidden ? '#9CA3AF' : '#E5E7EB',
                      padding: '0.3rem 0.9rem',
                      borderRadius: '999px',
                      fontSize: '0.8125rem',
                      textTransform: 'capitalize',
                      fontStyle: a.is_hidden ? 'italic' : 'normal',
                      border: a.is_hidden
                        ? `1px dashed ${hexAlpha(typeColor, 0.35)}`
                        : `1px solid ${hexAlpha(typeColor, 0.28)}`,
                    }}>
                      {a.ability.name.replace(/-/g, ' ')}
                      {a.is_hidden && ' (hidden)'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
