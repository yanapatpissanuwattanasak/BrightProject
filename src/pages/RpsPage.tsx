import { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { HEROES } from '@/data/hero'
import type { Hero } from '@/data/hero'
import { ROUTES } from '@/constants/routes'
import { useRpsRoom } from '@/hooks/useRpsRoom'
import type { ConnectionStatus } from '@/hooks/useRpsRoom'

// ── Types ────────────────────────────────────────────────────
type Choice = 'rock' | 'paper' | 'scissors'
type RoundResult = 'win' | 'lose' | 'draw' | null
type Phase = 'lobby' | 'select' | 'battle' | 'gameover'
type GameMode = 'offline' | 'multiplayer'

const IS_MULTIPLAYER = !!import.meta.env.VITE_RPS_WS_URL

const CHOICES: Choice[] = ['rock', 'paper', 'scissors']

const CHOICE_CFG: Record<Choice, {
  icon: string; label: string; sub: string
  color: string; shadow: string; border: string
}> = {
  rock:     { icon: '🪨', label: 'STONE',  sub: 'Earth Might',   color: '#f59e0b', shadow: 'rgba(245,158,11,0.7)',  border: 'border-amber-500/50'  },
  paper:    { icon: '📜', label: 'ARCANE', sub: 'Void Scroll',   color: '#06b6d4', shadow: 'rgba(6,182,212,0.7)',   border: 'border-cyan-500/50'   },
  scissors: { icon: '⚔️', label: 'BLADES', sub: 'Twin Strike',   color: '#a855f7', shadow: 'rgba(168,85,247,0.7)',  border: 'border-purple-500/50' },
}

// ── Helpers ──────────────────────────────────────────────────
function randomChoice(): Choice { return CHOICES[Math.floor(Math.random() * 3)] }

function resolveRound(player: Choice, bot: Choice): 'win' | 'lose' | 'draw' {
  if (player === bot) return 'draw'
  if (
    (player === 'rock'     && bot === 'scissors') ||
    (player === 'scissors' && bot === 'paper')   ||
    (player === 'paper'    && bot === 'rock')
  ) return 'win'
  return 'lose'
}

// ── Static particle / rune data (outside component = stable) ─
const RUNE_CHARS = ['✦','✧','◆','◇','⬟','⬠','⟁','⊕','⊗','⊙','❖','⟡']
const RUNE_DATA = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  char: RUNE_CHARS[i % RUNE_CHARS.length],
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7)  % 100,
  size: 10 + (i % 5) * 3,
  duration: 6 + (i % 5) * 2,
  delay: (i % 7) * 0.7,
  opacity: 0.06 + (i % 4) * 0.04,
}))

const PARTICLE_DATA = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (i * 29 + 13) % 100,
  y: (i * 47 + 19) % 100,
  size: 2 + (i % 3),
  color: ['#9333ea','#6366f1','#06b6d4','#f59e0b','#ec4899','#22c55e'][i % 6],
  duration: 4 + (i % 6) * 1.5,
  delay: (i % 8) * 0.45,
}))

// ── Streak helpers ────────────────────────────────────────────
const STREAK_KEY = 'rps-streak'
function loadStreak(): { current: number; best: number } {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { current: 0, best: 0 }
}
function saveStreak(s: { current: number; best: number }) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(s))
}

// ── Background ───────────────────────────────────────────────
function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[#040108]" />

      {/* Aurora orbs */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 65%)', top: '-25%', left: '-15%' }}
        animate={{ x: [0, 70, -40, 0], y: [0, 50, -25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 65%)', bottom: '-20%', right: '-15%' }}
        animate={{ x: [0, -55, 30, 0], y: [0, -45, 20, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%)', top: '35%', left: '25%' }}
        animate={{ x: [0, 40, -60, 0], y: [0, -30, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      {/* Floating rune symbols */}
      {RUNE_DATA.map(r => (
        <motion.span
          key={r.id}
          className="absolute select-none font-bold text-violet-400"
          style={{ left: `${r.x}%`, top: `${r.y}%`, fontSize: r.size, opacity: r.opacity }}
          animate={{ y: [0, -35, 0], opacity: [r.opacity, r.opacity * 3, r.opacity], rotate: [0, 25, -25, 0] }}
          transition={{ duration: r.duration, repeat: Infinity, ease: 'easeInOut', delay: r.delay }}
        >
          {r.char}
        </motion.span>
      ))}

      {/* Magic particles */}
      {PARTICLE_DATA.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
          animate={{ y: [0, -45, 0], opacity: [0.12, 0.75, 0.12], scale: [0.7, 1.4, 0.7] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}

      {/* Ground energy */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.5) 30%, rgba(168,85,247,0.8) 50%, rgba(139,92,246,0.5) 70%, transparent)' }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{ background: 'linear-gradient(to top, rgba(88,28,135,0.15), transparent)' }}
      />
    </div>
  )
}

// ── RPG HP Bar ───────────────────────────────────────────────
function HpBar({ hp, maxHp = 3 }: { hp: number; maxHp?: number }) {
  const pct = Math.max(0, (hp / maxHp) * 100)
  const gradient =
    pct > 55 ? 'from-emerald-500 via-green-400 to-emerald-500' :
    pct > 28 ? 'from-yellow-500 via-amber-400 to-yellow-500' :
               'from-red-600 via-rose-500 to-red-600'
  const glow =
    pct > 55 ? 'rgba(52,211,153,0.7)' :
    pct > 28 ? 'rgba(251,191,36,0.7)' :
               'rgba(239,68,68,0.7)'

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase">
        <span className="text-indigo-500/60">HP</span>
        <span className="text-white">{hp}<span className="text-indigo-500/50">/{maxHp}</span></span>
      </div>
      <div className="w-full h-3.5 bg-black/60 rounded-full border border-indigo-800/40 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{ boxShadow: `0 0 10px ${glow}, inset 0 1px 0 rgba(255,255,255,0.25)` }}
        />
      </div>
    </div>
  )
}

// ── Hero Panel (battle) ──────────────────────────────────────
function HeroPanel({
  hero, hp, choice, label, isBot, shakeCtrl, flashCtrl, showDamage,
}: {
  hero: Hero; hp: number; choice: Choice | null
  label: string; isBot: boolean; shakeCtrl: ReturnType<typeof useAnimation>
  flashCtrl: ReturnType<typeof useAnimation>; showDamage: boolean
}) {
  const aura = isBot ? 'rgba(239,68,68,0.32)' : 'rgba(99,102,241,0.35)'
  const ring = isBot ? 'rgba(239,68,68,0.35)' : 'rgba(99,102,241,0.4)'

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Label */}
      <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-indigo-400/55">{label}</p>

      {/* HP bar */}
      <div className="w-full">
        <HpBar hp={hp} />
      </div>

      {/* Spell badge above hero */}
      <div className="h-11 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {choice && (
            <motion.div
              key={choice}
              initial={{ opacity: 0, scale: 0.3, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -8 }}
              transition={{ type: 'spring', stiffness: 420, damping: 20 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
              style={{
                background: `${CHOICE_CFG[choice].color}18`,
                borderColor: `${CHOICE_CFG[choice].color}55`,
                boxShadow: `0 0 18px ${CHOICE_CFG[choice].shadow}`,
              }}
            >
              <span className="text-lg leading-none">{CHOICE_CFG[choice].icon}</span>
              <span className="text-[10px] font-black tracking-widest" style={{ color: CHOICE_CFG[choice].color }}>
                {CHOICE_CFG[choice].label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hero with aura glow */}
      <motion.div animate={shakeCtrl} className="relative flex items-center justify-center">
        {/* Outer aura pulse */}
        <motion.div
          className="absolute rounded-full"
          style={{ inset: -20, background: `radial-gradient(circle, ${aura} 0%, transparent 68%)` }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Ring */}
        <motion.div
          className="absolute rounded-full border"
          style={{ inset: -10, borderColor: ring }}
          animate={{ scale: [1, 1.07, 1], opacity: [0.3, 0.75, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />
        {/* Inner ring shimmer */}
        <motion.div
          className="absolute rounded-full border border-white/5"
          style={{ inset: -4 }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        <img
          src={hero.src}
          alt={hero.name}
          draggable={false}
          className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 object-contain select-none"
          style={isBot ? { transform: 'scaleX(-1)' } : undefined}
        />

        {/* Hit flash overlay */}
        <motion.div
          animate={flashCtrl}
          initial={{ opacity: 0 }}
          className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full z-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.85) 0%, rgba(239,68,68,0.4) 100%)' }}
        />

        {/* Floating damage number */}
        <AnimatePresence>
          {showDamage && (
            <motion.div
              key="dmg"
              initial={{ opacity: 1, y: 10 }}
              animate={{ opacity: 0, y: -55 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="absolute z-30 pointer-events-none"
              style={{ top: -8 }}
            >
              <span
                className="text-2xl font-black text-red-400"
                style={{ filter: 'drop-shadow(0 0 10px rgba(239,68,68,1)) drop-shadow(0 0 20px rgba(239,68,68,0.7))' }}
              >
                −1
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Name */}
      <p className="text-xs sm:text-sm font-bold tracking-wider text-white/90">{hero.name}</p>
    </div>
  )
}

// ── Select Screen ─────────────────────────────────────────────
const PANEL_EASE = [0.25, 0.46, 0.45, 0.94] as const
const CARD_CORNERS = ['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5'] as const

// Memoized card — only re-renders when its own props change, NOT when hoveredHero changes
const HeroCard = memo(function HeroCard({ hero, onSelect, onHoverStart, onHoverEnd }: {
  hero: Hero
  onSelect: (h: Hero) => void
  onHoverStart: (h: Hero) => void
  onHoverEnd: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onHoverStart={() => onHoverStart(hero)}
      onHoverEnd={onHoverEnd}
      onClick={() => onSelect(hero)}
      className="group relative flex flex-col items-center gap-2 px-2 py-4 rounded-xl border border-indigo-700/35 bg-indigo-950/55 backdrop-blur-sm cursor-pointer overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-violet-500/55 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
    >
      {CARD_CORNERS.map(pos => (
        <span key={pos} className={`absolute ${pos} text-[7px] text-violet-500/35 group-hover:text-violet-400/65 transition-colors duration-200`}>✦</span>
      ))}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
        style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
      <div className="relative">
        <div className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ inset: -8, background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }} />
        <img src={hero.src} alt={hero.name} draggable={false} className="w-16 h-16 object-contain relative z-10" />
      </div>
      <p className="text-[10px] font-bold text-violet-200 tracking-wider text-center relative z-10 leading-tight">{hero.name}</p>
    </motion.button>
  )
})

function SelectScreen({ onSelect }: { onSelect: (h: Hero) => void }) {
  const [hoveredHero, setHoveredHero] = useState<Hero | null>(null)
  const shown = hoveredHero !== null

  const handleHoverStart = useCallback((h: Hero) => setHoveredHero(h), [])
  const handleHoverEnd = useCallback(() => setHoveredHero(null), [])

  return (
    <motion.div
      key="select"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20 gap-10"
    >
      {/* Top row: preview panel + title + bot panel */}
      <div className="flex items-center gap-10 w-full max-w-4xl">

        {/* ── Left panel (always in DOM, no mount/unmount) ── */}
        <div className="relative w-52 h-64 flex-shrink-0">
          <motion.div
            animate={{ opacity: shown ? 0 : 1 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-indigo-800/30 bg-indigo-950/30 pointer-events-none"
          >
            <span className="text-4xl opacity-20">⚔️</span>
            <p className="text-[9px] text-indigo-600/50 tracking-[0.25em] uppercase mt-3">Hover a hero</p>
          </motion.div>

          <motion.div
            animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : -28, scale: shown ? 1 : 0.93 }}
            transition={{ duration: 0.22, ease: PANEL_EASE }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-violet-500/50 bg-indigo-950/70 overflow-hidden pointer-events-none"
            style={{ boxShadow: '0 0 40px rgba(139,92,246,0.35)' }}
          >
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
            <AnimatePresence>
              {hoveredHero && (
                <motion.div
                  key={hoveredHero.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <img src={hoveredHero.src} alt={hoveredHero.name} draggable={false} className="w-36 h-36 object-contain" />
                  <p className="text-sm font-black tracking-widest text-violet-200 mt-3 uppercase">{hoveredHero.name}</p>
                  <p className="text-[9px] text-indigo-400/60 tracking-[0.3em] uppercase mt-1">Select to battle</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Title */}
        <div className="flex-1 text-center">
          <motion.div
            animate={{
              filter: ['drop-shadow(0 0 20px #9333ea)', 'drop-shadow(0 0 50px #9333ea)', 'drop-shadow(0 0 20px #9333ea)'],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl mb-6 leading-none"
          >
            ⚔️
          </motion.div>
          <h1 className="font-black tracking-tight mb-4 leading-none">
            <span
              className="block text-4xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-amber-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent"
              style={{ filter: 'drop-shadow(0 0 25px rgba(168,85,247,0.55))' }}
            >
              SELECT YOUR
            </span>
            <motion.span
              className="block text-5xl sm:text-6xl lg:text-7xl bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent"
              animate={{ filter: ['drop-shadow(0 0 20px rgba(139,92,246,0.6))', 'drop-shadow(0 0 40px rgba(139,92,246,0.9))', 'drop-shadow(0 0 20px rgba(139,92,246,0.6))'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              CHAMPION
            </motion.span>
          </h1>
          <p className="text-indigo-400/45 text-xs tracking-[0.3em] uppercase">Choose wisely, warrior</p>
        </div>

        {/* ── Right panel (always in DOM) ── */}
        <div className="relative w-52 h-64 flex-shrink-0">
          <motion.div
            animate={{ opacity: shown ? 0 : 1 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-rose-900/25 bg-rose-950/20 pointer-events-none"
          >
            <span className="text-4xl opacity-15">💀</span>
            <p className="text-[9px] text-rose-700/40 tracking-[0.25em] uppercase mt-3">Enemy awaits</p>
          </motion.div>

          <motion.div
            animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : 28, scale: shown ? 1 : 0.93 }}
            transition={{ duration: 0.22, ease: PANEL_EASE }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-rose-700/50 bg-rose-950/60 overflow-hidden pointer-events-none"
            style={{ boxShadow: '0 0 40px rgba(220,38,38,0.3)' }}
          >
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(220,38,38,0.15) 0%, transparent 70%)' }} />
            <motion.div
              className="relative z-10 text-7xl font-black text-rose-300/80 leading-none select-none"
              animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              ?
            </motion.div>
            <p className="relative z-10 text-sm font-black tracking-widest text-rose-300 mt-4 uppercase">Unknown</p>
            <p className="relative z-10 text-[9px] text-rose-500/60 tracking-[0.3em] uppercase mt-1">Random enemy</p>
          </motion.div>
        </div>
      </div>

      {/* Hero grid — 5 per row, grid renders once and doesn't re-render on hover */}
      <div className="grid grid-cols-5 gap-3 max-w-3xl w-full">
        {HEROES.map((hero) => (
          <HeroCard
            key={hero.id}
            hero={hero}
            onSelect={onSelect}
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ── Battle Screen ─────────────────────────────────────────────
function BattleScreen({
  playerHero, botHero, playerHp, botHp,
  playerChoice, botChoice, roundResult, isRevealing,
  playerShake, botShake, playerFlash, botFlash,
  showPlayerDmg, showBotDmg, currentStreak, onChoice,
}: {
  playerHero: Hero; botHero: Hero
  playerHp: number; botHp: number
  playerChoice: Choice | null; botChoice: Choice | null
  roundResult: RoundResult; isRevealing: boolean
  playerShake: ReturnType<typeof useAnimation>
  botShake: ReturnType<typeof useAnimation>
  playerFlash: ReturnType<typeof useAnimation>
  botFlash: ReturnType<typeof useAnimation>
  showPlayerDmg: boolean; showBotDmg: boolean
  currentStreak: number
  onChoice: (c: Choice) => void
}) {
  const RESULT_CFG = {
    win:  { text: 'CRITICAL HIT!', grad: 'from-emerald-400 to-cyan-400', glow: 'rgba(52,211,153,0.85)'  },
    lose: { text: 'TOOK DAMAGE!',  grad: 'from-rose-400 to-red-500',     glow: 'rgba(239,68,68,0.85)'   },
    draw: { text: '— CLASH! —',    grad: 'from-amber-400 to-yellow-300', glow: 'rgba(251,191,36,0.85)'  },
  }

  return (
    <motion.div
      key="battle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 min-h-screen flex flex-col px-4 sm:px-8 pt-16 pb-6 gap-4"
    >
      {/* Arena split hint lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to right, rgba(99,102,241,0.04) 0%, transparent 45%, transparent 55%, rgba(239,68,68,0.04) 100%)',
      }} />

      {/* Win streak badge */}
      <AnimatePresence>
        {currentStreak >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/45 bg-orange-950/55 backdrop-blur-sm"
          >
            <motion.span
              className="text-sm leading-none"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >🔥</motion.span>
            <span className="text-[11px] font-black tracking-wider text-orange-400">x{currentStreak}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heroes row */}
      <div className="flex items-start justify-center gap-3 sm:gap-6 flex-1">
        {/* Player */}
        <div className="flex-1 max-w-[170px]">
          <HeroPanel hero={playerHero} hp={playerHp} choice={playerChoice} label="YOU" isBot={false} shakeCtrl={playerShake} flashCtrl={playerFlash} showDamage={showPlayerDmg} />
        </div>

        {/* Center channel */}
        <div className="relative flex flex-col items-center justify-center gap-3 pt-24 shrink-0 w-20 sm:w-28">
          {/* Impact burst */}
          <AnimatePresence>
            {roundResult && (
              <motion.div
                key={`burst-${roundResult}`}
                initial={{ scale: 0.1, opacity: 1 }}
                animate={{ scale: 5, opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 36, height: 36,
                  background: roundResult === 'win'
                    ? 'radial-gradient(circle, rgba(52,211,153,0.95) 0%, transparent 70%)'
                    : roundResult === 'lose'
                    ? 'radial-gradient(circle, rgba(239,68,68,0.95) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(251,191,36,0.95) 0%, transparent 70%)',
                }}
              />
            )}
          </AnimatePresence>

          {/* Energy beam top */}
          <motion.div
            className="w-full h-px"
            style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.6), rgba(168,85,247,1), rgba(239,68,68,0.6))' }}
            animate={{ opacity: [0.3, 0.9, 0.3], scaleX: [0.7, 1.05, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* VS / Result */}
          <AnimatePresence mode="wait">
            {roundResult ? (
              <motion.p
                key="result"
                initial={{ opacity: 0, scale: 0.35 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                className={`text-xs sm:text-sm font-black text-center bg-gradient-to-r ${RESULT_CFG[roundResult].grad} bg-clip-text text-transparent`}
                style={{ filter: `drop-shadow(0 0 14px ${RESULT_CFG[roundResult].glow})` }}
              >
                {RESULT_CFG[roundResult].text}
              </motion.p>
            ) : (
              <motion.div key="vs" className="flex flex-col items-center gap-1.5">
                <motion.p
                  className="text-xl sm:text-2xl font-black text-indigo-500/45 tracking-[0.2em]"
                  animate={{ opacity: [0.35, 0.65, 0.35] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  VS
                </motion.p>
                <motion.div
                  className="flex gap-1 items-center"
                  animate={{ opacity: [0.2, 0.55, 0.2] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
                >
                  {['✦','✦','✦'].map((s, i) => <span key={i} className="text-[7px] text-violet-600">{s}</span>)}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Energy beam bottom */}
          <motion.div
            className="w-full h-px"
            style={{ background: 'linear-gradient(to right, rgba(239,68,68,0.6), rgba(168,85,247,1), rgba(99,102,241,0.6))' }}
            animate={{ opacity: [0.3, 0.9, 0.3], scaleX: [0.7, 1.05, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />
        </div>

        {/* Bot */}
        <div className="flex-1 max-w-[170px]">
          <HeroPanel hero={botHero} hp={botHp} choice={botChoice} label="ENEMY" isBot={true} shakeCtrl={botShake} flashCtrl={botFlash} showDamage={showBotDmg} />
        </div>
      </div>

      {/* Spell choice cards */}
      <div className="flex flex-col items-center gap-3 pb-2">
        <motion.p
          className="text-[10px] tracking-[0.3em] uppercase text-indigo-500/50 font-bold"
          animate={{ opacity: isRevealing ? 0.3 : [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: isRevealing ? 0 : Infinity }}
        >
          {isRevealing ? 'Casting...' : '— Choose your spell —'}
        </motion.p>

        <div className="flex gap-3 sm:gap-4">
          {CHOICES.map((choice) => {
            const cfg = CHOICE_CFG[choice]
            return (
              <motion.button
                key={choice}
                onClick={() => onChoice(choice)}
                disabled={isRevealing}
                whileHover={!isRevealing ? { y: -8, scale: 1.08 } : {}}
                whileTap={!isRevealing ? { scale: 0.92 } : {}}
                className={[
                  'group relative flex flex-col items-center gap-2 px-4 py-4 sm:px-5 sm:py-5',
                  'rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-200',
                  'bg-black/50',
                  isRevealing
                    ? 'opacity-30 cursor-not-allowed border-indigo-900/30'
                    : `cursor-pointer ${cfg.border}`,
                ].join(' ')}
                style={!isRevealing ? {
                  boxShadow: `0 0 0 rgba(0,0,0,0)`,
                } : undefined}
                onMouseEnter={e => {
                  if (!isRevealing) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 28px ${cfg.shadow}`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 rgba(0,0,0,0)'
                }}
              >
                {/* Corner deco */}
                <span className="absolute top-1.5 left-1.5 text-[7px] opacity-35" style={{ color: cfg.color }}>✦</span>
                <span className="absolute top-1.5 right-1.5 text-[7px] opacity-35" style={{ color: cfg.color }}>✦</span>

                {/* Radial glow on hover */}
                {!isRevealing && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl"
                    style={{ background: `radial-gradient(circle, ${cfg.color}14 0%, transparent 65%)` }} />
                )}

                <span className="text-2xl sm:text-3xl leading-none relative z-10">{cfg.icon}</span>
                <div className="text-center relative z-10">
                  <p className="text-[10px] sm:text-xs font-black tracking-[0.15em]" style={{ color: cfg.color }}>{cfg.label}</p>
                  <p className="text-[8px] sm:text-[9px] text-indigo-400/45 tracking-wider mt-0.5">{cfg.sub}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

// ── Game Over Screen ──────────────────────────────────────────
function GameOverScreen({ won, playerHero, botHero, currentStreak, bestStreak, onReplay }: {
  won: boolean; playerHero: Hero; botHero: Hero
  currentStreak: number; bestStreak: number; onReplay: () => void
}) {
  const confetti = useMemo(() =>
    won
      ? Array.from({ length: 28 }, (_, i) => ({
          id: i,
          x: (i * 41 + 7) % 100,
          color: ['#f59e0b','#a855f7','#06b6d4','#ec4899','#22c55e','#f97316'][i % 6],
          duration: 2.2 + (i % 4) * 0.5,
          delay: (i % 7) * 0.18,
          size: 4 + (i % 4) * 2,
        }))
      : [],
  [won])

  // Ash particles for defeat
  const ash = useMemo(() =>
    !won
      ? Array.from({ length: 18 }, (_, i) => ({
          id: i,
          x: (i * 53 + 17) % 100,
          duration: 3 + (i % 4) * 0.7,
          delay: (i % 6) * 0.25,
        }))
      : [],
  [won])

  return (
    <motion.div
      key="gameover"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.65 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 gap-10"
    >
      {/* Falling confetti */}
      {confetti.map(c => (
        <motion.div
          key={c.id}
          className="fixed top-0 rounded-full pointer-events-none"
          style={{ left: `${c.x}%`, width: c.size, height: c.size, background: c.color, boxShadow: `0 0 8px ${c.color}` }}
          animate={{ y: ['0vh', '105vh'], opacity: [0, 1, 1, 0], rotate: [0, 720] }}
          transition={{ duration: c.duration, repeat: Infinity, delay: c.delay, ease: 'linear' }}
        />
      ))}

      {/* Falling ash */}
      {ash.map(a => (
        <motion.div
          key={a.id}
          className="fixed top-0 w-1 h-1 rounded-full pointer-events-none bg-gray-600/60"
          style={{ left: `${a.x}%` }}
          animate={{ y: ['0vh', '105vh'], opacity: [0, 0.5, 0.5, 0] }}
          transition={{ duration: a.duration, repeat: Infinity, delay: a.delay, ease: 'linear' }}
        />
      ))}

      {/* Main result */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 210, damping: 16 }}
        className="text-center"
      >
        <motion.p
          className="text-7xl sm:text-8xl mb-5 leading-none"
          animate={won
            ? { rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.12, 1] }
            : { opacity: [1, 0.5, 1] }
          }
          transition={{ duration: 1.2, delay: 0.6, repeat: won ? 0 : Infinity, repeatDelay: 1.5 }}
        >
          {won ? '🏆' : '💀'}
        </motion.p>

        <motion.h2
          className={`text-5xl sm:text-7xl font-black tracking-tighter mb-3 ${
            won
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400'
              : 'bg-gradient-to-r from-rose-500 via-red-400 to-rose-500'
          } bg-clip-text text-transparent`}
          animate={{ filter: [
            `drop-shadow(0 0 20px ${won ? 'rgba(251,191,36,0.5)' : 'rgba(239,68,68,0.45)'})`,
            `drop-shadow(0 0 50px ${won ? 'rgba(251,191,36,0.9)' : 'rgba(239,68,68,0.8)'})`,
            `drop-shadow(0 0 20px ${won ? 'rgba(251,191,36,0.5)' : 'rgba(239,68,68,0.45)'})`,
          ]}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {won ? 'VICTORY' : 'DEFEATED'}
        </motion.h2>

        <p className={`text-xs tracking-[0.25em] uppercase ${won ? 'text-amber-400/55' : 'text-rose-400/55'}`}>
          {won ? 'The enemy has fallen before you' : 'You have been slain in battle'}
        </p>
      </motion.div>

      {/* Streak stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <div className="flex flex-col items-center gap-0.5 px-6 py-3 rounded-xl border border-indigo-800/40 bg-indigo-950/50">
          <span className="text-[9px] uppercase tracking-widest text-indigo-500/55 font-bold">Streak</span>
          <span className="text-3xl font-black text-white leading-none">{currentStreak}</span>
          <span className="text-[8px] text-orange-400/70">🔥 current</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-6 py-3 rounded-xl border border-amber-700/35 bg-amber-950/30">
          <span className="text-[9px] uppercase tracking-widest text-indigo-500/55 font-bold">Best</span>
          <span className="text-3xl font-black text-amber-400 leading-none">{bestStreak}</span>
          <span className="text-[8px] text-amber-500/60">👑 all time</span>
        </div>
      </motion.div>

      {/* Both heroes */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="flex items-end justify-center gap-10 sm:gap-20"
      >
        {/* Player */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            {won && (
              <motion.div
                className="absolute rounded-full"
                style={{ inset: -16, background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
            )}
            <img
              src={playerHero.src} alt={playerHero.name} draggable={false}
              className={`w-28 h-28 sm:w-36 sm:h-36 object-contain relative z-10 ${!won ? 'grayscale opacity-35' : ''}`}
            />
          </div>
          <p className="text-[9px] uppercase tracking-widest text-indigo-400/45">You</p>
          <p className="text-xs font-bold text-violet-200">{playerHero.name}</p>
        </div>

        {/* Bot */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            {!won && (
              <motion.div
                className="absolute rounded-full"
                style={{ inset: -16, background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
            )}
            <img
              src={botHero.src} alt={botHero.name} draggable={false}
              className={`w-28 h-28 sm:w-36 sm:h-36 object-contain relative z-10 ${won ? 'grayscale opacity-35' : ''}`}
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
          <p className="text-[9px] uppercase tracking-widest text-indigo-400/45">Enemy</p>
          <p className="text-xs font-bold text-violet-200">{botHero.name}</p>
        </div>
      </motion.div>

      {/* Play again */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
      >
        <motion.button
          onClick={onReplay}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.94 }}
          className="px-10 py-4 rounded-full font-black text-sm tracking-[0.2em] uppercase text-black transition-shadow duration-200"
          style={{
            background: won
              ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
            boxShadow: won
              ? '0 0 35px rgba(251,191,36,0.55), inset 0 1px 0 rgba(255,255,255,0.3)'
              : '0 0 35px rgba(139,92,246,0.55), inset 0 1px 0 rgba(255,255,255,0.15)',
            color: won ? '#000' : '#fff',
          }}
        >
          ⚔️ &nbsp;PLAY AGAIN
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ── Lobby Screen ─────────────────────────────────────────────
function LobbyScreen({
  onCreateRoom, onJoinRoom, onPlaySolo, connectionStatus, error, initialRoomCode,
}: {
  onCreateRoom: () => void
  onJoinRoom: (code: string) => void
  onPlaySolo: () => void
  connectionStatus: ConnectionStatus
  error: string | null
  initialRoomCode: string
}) {
  const [joinCode, setJoinCode] = useState(initialRoomCode)

  useEffect(() => {
    if (initialRoomCode && connectionStatus === 'connected') {
      onJoinRoom(initialRoomCode)
    }
  }, [connectionStatus]) // eslint-disable-line

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (joinCode.trim().length !== 6) return
    onJoinRoom(joinCode.trim().toUpperCase())
  }

  const canConnect = connectionStatus === 'connected'

  return (
    <motion.div
      key="lobby"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20 gap-8"
    >
      {/* Title */}
      <div className="text-center">
        <motion.div
          className="text-6xl mb-5 leading-none"
          animate={{ filter: ['drop-shadow(0 0 20px #9333ea)', 'drop-shadow(0 0 50px #9333ea)', 'drop-shadow(0 0 20px #9333ea)'], scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >⚔️</motion.div>
        <h1 className="font-black tracking-tight leading-none">
          <span className="block text-5xl sm:text-6xl bg-gradient-to-r from-amber-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent"
            style={{ filter: 'drop-shadow(0 0 25px rgba(168,85,247,0.55))' }}>
            HERO ARENA
          </span>
          <span className="block text-xs tracking-[0.4em] uppercase text-indigo-400/60 font-bold mt-2">
            Multiplayer
          </span>
        </h1>
      </div>

      {/* Connection status */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-800/40 bg-black/40 backdrop-blur-sm">
        <motion.div
          className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400' : connectionStatus === 'connecting' ? 'bg-amber-400' : 'bg-red-500'}`}
          animate={connectionStatus === 'connecting' ? { opacity: [1, 0.3, 1] } : {}}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400/70">
          {connectionStatus === 'connected' ? 'Server Connected' : connectionStatus === 'connecting' ? 'Connecting…' : 'Server Offline'}
        </span>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs text-rose-400 bg-rose-950/50 px-4 py-2 rounded-lg border border-rose-700/40 max-w-xs text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        {/* Create Room */}
        <motion.button
          onClick={onCreateRoom}
          disabled={!canConnect}
          whileHover={canConnect ? { scale: 1.04 } : {}}
          whileTap={canConnect ? { scale: 0.96 } : {}}
          className="w-full py-4 rounded-xl font-black text-sm tracking-[0.2em] uppercase transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: canConnect ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)' : '#1e1b4b',
            boxShadow: canConnect ? '0 0 30px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
            color: '#fff',
          }}
        >
          ✦ &nbsp;Create Room
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-indigo-800/40" />
          <span className="text-[10px] text-indigo-600/50 tracking-widest uppercase">or join</span>
          <div className="flex-1 h-px bg-indigo-800/40" />
        </div>

        {/* Join form */}
        <form onSubmit={handleJoin} className="w-full flex gap-2">
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-F0-9]/g, ''))}
            maxLength={6}
            placeholder="ROOM CODE"
            className="flex-1 px-3 py-2.5 rounded-lg bg-black/50 border border-indigo-800/50 text-white text-xs font-bold tracking-[0.2em] uppercase placeholder-indigo-700/50 focus:outline-none focus:border-indigo-600/80 transition-colors"
          />
          <motion.button
            type="submit"
            disabled={!canConnect || joinCode.trim().length !== 6}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-4 py-2.5 rounded-lg bg-violet-900/60 border border-violet-700/50 text-violet-300 text-xs font-black tracking-wider uppercase disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            JOIN
          </motion.button>
        </form>

        {/* Play Solo */}
        <div className="flex items-center gap-3 w-full mt-1">
          <div className="flex-1 h-px bg-indigo-900/30" />
          <button
            onClick={onPlaySolo}
            className="text-[10px] text-indigo-600/50 hover:text-indigo-400 tracking-widest uppercase transition-colors whitespace-nowrap"
          >
            ⚔ &nbsp;Play Solo (vs AI)
          </button>
          <div className="flex-1 h-px bg-indigo-900/30" />
        </div>
      </div>
    </motion.div>
  )
}

// ── Multiplayer Waiting Screen ────────────────────────────────
function MpWaitingScreen({ roomCode, onCancel }: { roomCode: string; onCancel: () => void }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    const url = `${window.location.origin}/rps?room=${roomCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.div
      key="mp-waiting"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 gap-8"
    >
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-indigo-500/60 mb-4 font-bold">Room Code</p>
        <motion.p
          className="text-6xl sm:text-7xl font-black tracking-[0.25em] text-violet-300 font-mono"
          style={{ filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.7))' }}
          animate={{ filter: ['drop-shadow(0 0 15px rgba(139,92,246,0.5))', 'drop-shadow(0 0 35px rgba(139,92,246,0.9))', 'drop-shadow(0 0 15px rgba(139,92,246,0.5))'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {roomCode}
        </motion.p>
      </div>

      <motion.button
        onClick={copyLink}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-indigo-700/50 bg-indigo-950/60 text-indigo-300 text-xs font-bold tracking-widest uppercase transition-colors hover:border-indigo-500/70"
      >
        <span>{copied ? '✓' : '📋'}</span>
        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
      </motion.button>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-violet-500"
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
            />
          ))}
        </div>
        <p className="text-sm text-indigo-400/60 tracking-wider">Waiting for challenger…</p>
      </div>

      <button
        onClick={onCancel}
        className="text-[10px] text-indigo-700/50 hover:text-rose-400 tracking-widest uppercase transition-colors mt-2"
      >
        Cancel
      </button>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export function RpsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const room = useRpsRoom()

  const [mode, setMode]           = useState<GameMode>('offline')
  const [phase, setPhase]         = useState<Phase>(IS_MULTIPLAYER ? 'lobby' : 'select')
  const [playerHero, setPlayerHero] = useState<Hero | null>(null)
  const [botHero, setBotHero]     = useState<Hero | null>(null)
  const [playerHp, setPlayerHp]   = useState(3)
  const [botHp, setBotHp]         = useState(3)
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null)
  const [botChoice, setBotChoice] = useState<Choice | null>(null)
  const [roundResult, setRoundResult]   = useState<RoundResult>(null)
  const [isRevealing, setIsRevealing]   = useState(false)

  const playerShake = useAnimation()
  const botShake    = useAnimation()
  const playerFlash = useAnimation()
  const botFlash    = useAnimation()
  const [showPlayerDmg, setShowPlayerDmg] = useState(false)
  const [showBotDmg, setShowBotDmg]       = useState(false)
  const [currentStreak, setCurrentStreak] = useState(() => loadStreak().current)
  const [bestStreak, setBestStreak]       = useState(() => loadStreak().best)

  // ── Multiplayer: sync battle_start into local state ──────────
  useEffect(() => {
    if (mode !== 'multiplayer' || room.roomPhase !== 'battle') return
    setPlayerHero(room.playerHero)
    setBotHero(room.opponentHero)
    setPlayerHp(room.playerHp)
    setBotHp(room.opponentHp)
    setPhase('battle')
  }, [mode, room.roomPhase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Multiplayer: round result animation ───────────────────────
  useEffect(() => {
    if (mode !== 'multiplayer' || !room.roundResult) return
    const result = room.roundResult as NonNullable<RoundResult>
    const newPHp = room.playerHp
    const newBHp = room.opponentHp

    setPlayerChoice(room.playerChoice)
    setBotChoice(room.opponentChoice)
    setRoundResult(result)

    const t1 = setTimeout(() => {
      if (result === 'lose') {
        playerShake.start({ x: [0, -14, 14, -9, 9, -4, 4, 0], transition: { duration: 0.5 } })
        playerFlash.start({ opacity: [0, 0.85, 0], transition: { duration: 0.45 } })
        setShowPlayerDmg(true)
        setTimeout(() => setShowPlayerDmg(false), 950)
      } else if (result === 'win') {
        botShake.start({ x: [0, -14, 14, -9, 9, -4, 4, 0], transition: { duration: 0.5 } })
        botFlash.start({ opacity: [0, 0.85, 0], transition: { duration: 0.45 } })
        setShowBotDmg(true)
        setTimeout(() => setShowBotDmg(false), 950)
      }
    }, 280)

    const t2 = setTimeout(() => {
      setPlayerHp(newPHp)
      setBotHp(newBHp)
      setTimeout(() => {
        if (newPHp <= 0 || newBHp <= 0) {
          // gameover handled by the room.roomPhase effect below
        } else {
          setPlayerChoice(null)
          setBotChoice(null)
          setRoundResult(null)
          setIsRevealing(false)
          room.clearRoundResult()
        }
      }, 1100)
    }, 750)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [mode, room.roundResult]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Multiplayer: gameover ─────────────────────────────────────
  useEffect(() => {
    if (mode !== 'multiplayer' || room.roomPhase !== 'gameover') return
    const gameWon = room.winner === 'player'
    const prev = loadStreak()
    const next = gameWon
      ? { current: prev.current + 1, best: Math.max(prev.best, prev.current + 1) }
      : { current: 0, best: prev.best }
    saveStreak(next)
    setCurrentStreak(next.current)
    setBestStreak(next.best)
    setPhase('gameover')
  }, [mode, room.roomPhase, room.winner]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelect(hero: Hero) {
    if (mode === 'multiplayer') {
      if (!room.roomCode) return
      room.selectHero(hero, room.roomCode)
      return
    }
    const bot = HEROES[Math.floor(Math.random() * HEROES.length)]
    setPlayerHero(hero)
    setBotHero(bot)
    setPhase('battle')
  }

  function handleChoice(choice: Choice) {
    if (mode === 'multiplayer') {
      if (isRevealing || !room.roomCode) return
      setIsRevealing(true)
      room.submitChoice(choice, room.roomCode)
      return
    }
    if (isRevealing) return
    const botPick  = randomChoice()
    const result   = resolveRound(choice, botPick)
    const newPHp   = result === 'lose' ? playerHp - 1 : playerHp
    const newBHp   = result === 'win'  ? botHp - 1    : botHp

    setPlayerChoice(choice)
    setBotChoice(botPick)
    setRoundResult(result)
    setIsRevealing(true)

    // Shake + flash loser, show floating damage number
    setTimeout(() => {
      if (result === 'lose') {
        playerShake.start({ x: [0, -14, 14, -9, 9, -4, 4, 0], transition: { duration: 0.5 } })
        playerFlash.start({ opacity: [0, 0.85, 0], transition: { duration: 0.45 } })
        setShowPlayerDmg(true)
        setTimeout(() => setShowPlayerDmg(false), 950)
      } else if (result === 'win') {
        botShake.start({ x: [0, -14, 14, -9, 9, -4, 4, 0], transition: { duration: 0.5 } })
        botFlash.start({ opacity: [0, 0.85, 0], transition: { duration: 0.45 } })
        setShowBotDmg(true)
        setTimeout(() => setShowBotDmg(false), 950)
      }
    }, 280)

    // Apply HP → check gameover
    setTimeout(() => {
      setPlayerHp(newPHp)
      setBotHp(newBHp)
      setTimeout(() => {
        if (newPHp <= 0 || newBHp <= 0) {
          const gameWon = newBHp <= 0
          const prev = loadStreak()
          const next = gameWon
            ? { current: prev.current + 1, best: Math.max(prev.best, prev.current + 1) }
            : { current: 0, best: prev.best }
          saveStreak(next)
          setCurrentStreak(next.current)
          setBestStreak(next.best)
          setPhase('gameover')
        } else {
          setPlayerChoice(null)
          setBotChoice(null)
          setRoundResult(null)
          setIsRevealing(false)
        }
      }, 1100)
    }, 750)
  }

  function handleCancel() {
    room.resetRoom()
    setMode('offline')
    setPhase('lobby')
  }

  function reset() {
    if (mode === 'multiplayer') room.resetRoom()
    setMode('offline')
    setPhase(IS_MULTIPLAYER ? 'lobby' : 'select')
    setPlayerHero(null)
    setBotHero(null)
    setPlayerHp(3)
    setBotHp(3)
    setPlayerChoice(null)
    setBotChoice(null)
    setRoundResult(null)
    setIsRevealing(false)
  }

  return (
    <div className="min-h-screen bg-[#040108] text-white overflow-x-hidden">
      <Background />

      {/* Damage vignette flash */}
      <AnimatePresence>
        {roundResult === 'lose' && (
          <motion.div
            key="vfx-lose"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0.45, 0] }}
            transition={{ duration: 0.65, times: [0, 0.12, 0.4, 1] }}
            className="fixed inset-0 pointer-events-none z-40"
            style={{ background: 'radial-gradient(ellipse at 15% 50%, rgba(239,68,68,0.8) 0%, transparent 55%)' }}
          />
        )}
        {roundResult === 'win' && (
          <motion.div
            key="vfx-win"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.65, 0.3, 0] }}
            transition={{ duration: 0.65, times: [0, 0.12, 0.4, 1] }}
            className="fixed inset-0 pointer-events-none z-40"
            style={{ background: 'radial-gradient(ellipse at 85% 50%, rgba(52,211,153,0.65) 0%, transparent 55%)' }}
          />
        )}
      </AnimatePresence>

      {/* Opponent disconnected banner */}
      <AnimatePresence>
        {mode === 'multiplayer' && room.opponentDisconnected && phase === 'battle' && (
          <motion.div
            key="disconnect-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full border border-amber-600/50 bg-amber-950/80 text-amber-400 text-[10px] font-bold tracking-wider whitespace-nowrap backdrop-blur-sm"
          >
            ⚠ Opponent disconnected — waiting 15 s…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <div className="fixed top-5 left-5 z-50">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="text-indigo-400/55 hover:text-indigo-300 text-xs transition-colors flex items-center gap-1.5 bg-black/65 backdrop-blur-sm px-3 py-1.5 rounded-full border border-indigo-800/35 hover:border-indigo-600/55"
        >
          ← กลับ
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Lobby */}
        {phase === 'lobby' && (
          <LobbyScreen
            key="lobby"
            onCreateRoom={() => { setPhase('select'); setMode('multiplayer'); room.createRoom() }}
            onJoinRoom={(code) => { setPhase('select'); setMode('multiplayer'); room.joinRoom(code) }}
            onPlaySolo={() => setPhase('select')}
            connectionStatus={room.connectionStatus}
            error={room.error}
            initialRoomCode={searchParams.get('room') ?? ''}
          />
        )}

        {/* Offline hero select */}
        {mode === 'offline' && phase === 'select' && (
          <SelectScreen key="select" onSelect={handleSelect} />
        )}

        {/* Multiplayer: waiting for player 2 */}
        {mode === 'multiplayer' && room.roomPhase === 'waiting-for-p2' && (
          <MpWaitingScreen key="mp-waiting" roomCode={room.roomCode!} onCancel={handleCancel} />
        )}

        {/* Multiplayer: hero select (both players in room) */}
        {mode === 'multiplayer' && (room.roomPhase === 'hero-select' || room.roomPhase === 'hero-selected') && (
          <motion.div
            key="mp-hero-select"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="contents"
          >
            <SelectScreen onSelect={handleSelect} />
            {room.roomPhase === 'hero-selected' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-4"
              >
                <div className="flex items-center gap-2">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-violet-400"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.25 }}
                    />
                  ))}
                </div>
                <p className="text-sm font-bold tracking-[0.25em] uppercase text-indigo-300/80">
                  Waiting for opponent…
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Battle (offline + multiplayer share same phase) */}
        {phase === 'battle' && playerHero && botHero && (
          <BattleScreen
            key="battle"
            playerHero={playerHero} botHero={botHero}
            playerHp={playerHp}    botHp={botHp}
            playerChoice={playerChoice} botChoice={botChoice}
            roundResult={roundResult}   isRevealing={isRevealing}
            playerShake={playerShake}   botShake={botShake}
            playerFlash={playerFlash}   botFlash={botFlash}
            showPlayerDmg={showPlayerDmg} showBotDmg={showBotDmg}
            currentStreak={currentStreak}
            onChoice={handleChoice}
          />
        )}

        {/* Game Over (offline + multiplayer share same phase) */}
        {phase === 'gameover' && playerHero && botHero && (
          <GameOverScreen
            key="gameover"
            won={botHp <= 0}
            playerHero={playerHero}
            botHero={botHero}
            currentStreak={currentStreak}
            bestStreak={bestStreak}
            onReplay={reset}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
