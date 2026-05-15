import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { HEROES } from '@/data/hero'
import type { Hero } from '@/data/hero'
import { ROUTES } from '@/constants/routes'

// ── Types ────────────────────────────────────────────────────
type Choice = 'rock' | 'paper' | 'scissors'
type RoundResult = 'win' | 'lose' | 'draw' | null
type Phase = 'select' | 'battle' | 'gameover'

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
  hero, hp, choice, label, isBot, shakeCtrl,
}: {
  hero: Hero; hp: number; choice: Choice | null
  label: string; isBot: boolean; shakeCtrl: ReturnType<typeof useAnimation>
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
      </motion.div>

      {/* Name */}
      <p className="text-xs sm:text-sm font-bold tracking-wider text-white/90">{hero.name}</p>
    </div>
  )
}

// ── Select Screen ─────────────────────────────────────────────
function SelectScreen({ onSelect }: { onSelect: (h: Hero) => void }) {
  const [hoveredHero, setHoveredHero] = useState<Hero | null>(null)

  return (
    <motion.div
      key="select"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20 gap-10"
    >
      {/* Top row: preview panel + title */}
      <div className="flex items-center gap-10 w-full max-w-4xl">
        {/* Large hero preview — slides in from left on hover */}
        <div className="relative w-52 h-64 flex-shrink-0">
          <AnimatePresence mode="wait">
            {hoveredHero ? (
              <motion.div
                key={hoveredHero.id}
                initial={{ x: -60, opacity: 0, scale: 0.75 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -40, opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-violet-500/50 bg-indigo-950/70 backdrop-blur-sm overflow-hidden"
                style={{ boxShadow: '0 0 40px rgba(139,92,246,0.35)' }}
              >
                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
                <img
                  src={hoveredHero.src}
                  alt={hoveredHero.name}
                  draggable={false}
                  className="w-36 h-36 object-contain relative z-10"
                />
                <p className="relative z-10 text-sm font-black tracking-widest text-violet-200 mt-3 uppercase">{hoveredHero.name}</p>
                <p className="relative z-10 text-[9px] text-indigo-400/60 tracking-[0.3em] uppercase mt-1">Select to battle</p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-indigo-800/30 bg-indigo-950/30 backdrop-blur-sm"
              >
                <span className="text-4xl opacity-20">⚔️</span>
                <p className="text-[9px] text-indigo-600/50 tracking-[0.25em] uppercase mt-3">Hover a hero</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Title */}
        <div className="flex-1 text-center">
          <motion.div
            animate={{
              filter: [
                'drop-shadow(0 0 20px #9333ea)',
                'drop-shadow(0 0 50px #9333ea)',
                'drop-shadow(0 0 20px #9333ea)',
              ],
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

        {/* Right panel — bot unknown, slides in from right on hover */}
        <div className="relative w-52 h-64 flex-shrink-0">
          <AnimatePresence mode="wait">
            {hoveredHero ? (
              <motion.div
                key="bot-reveal"
                initial={{ x: 60, opacity: 0, scale: 0.75 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 40, opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-rose-700/50 bg-rose-950/60 backdrop-blur-sm overflow-hidden"
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
            ) : (
              <motion.div
                key="bot-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-rose-900/25 bg-rose-950/20 backdrop-blur-sm"
              >
                <span className="text-4xl opacity-15">💀</span>
                <p className="text-[9px] text-rose-700/40 tracking-[0.25em] uppercase mt-3">Enemy awaits</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hero grid — 5 per row */}
      <div className="grid grid-cols-5 gap-3 max-w-3xl w-full">
        {HEROES.map((hero, idx) => (
          <motion.button
            key={hero.id}
            initial={{ opacity: 0, y: 30, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: idx * 0.07, duration: 0.55, type: 'spring', stiffness: 200 }}
            whileHover={{ y: -8, scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onHoverStart={() => setHoveredHero(hero)}
            onHoverEnd={() => setHoveredHero(null)}
            onClick={() => onSelect(hero)}
            className="group relative flex flex-col items-center gap-2 px-2 py-4 rounded-xl border border-indigo-700/35 bg-indigo-950/55 backdrop-blur-sm cursor-pointer overflow-hidden transition-all duration-300 hover:border-violet-500/55 hover:shadow-[0_0_25px_rgba(139,92,246,0.35)]"
          >
            {/* Corner rune deco */}
            {['top-1.5 left-1.5','top-1.5 right-1.5','bottom-1.5 left-1.5','bottom-1.5 right-1.5'].map(pos => (
              <span key={pos} className={`absolute ${pos} text-[7px] text-violet-500/35 group-hover:text-violet-400/65 transition-colors duration-300`}>✦</span>
            ))}
            {/* Hover radial glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
              style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />

            {/* Hero image */}
            <div className="relative">
              <motion.div
                className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ inset: -8, background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)' }}
              />
              <img src={hero.src} alt={hero.name} draggable={false}
                className="w-16 h-16 object-contain relative z-10" />
            </div>

            <p className="text-[10px] font-bold text-violet-200 tracking-wider text-center relative z-10 leading-tight">{hero.name}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ── Battle Screen ─────────────────────────────────────────────
function BattleScreen({
  playerHero, botHero, playerHp, botHp,
  playerChoice, botChoice, roundResult, isRevealing,
  playerShake, botShake, onChoice,
}: {
  playerHero: Hero; botHero: Hero
  playerHp: number; botHp: number
  playerChoice: Choice | null; botChoice: Choice | null
  roundResult: RoundResult; isRevealing: boolean
  playerShake: ReturnType<typeof useAnimation>
  botShake: ReturnType<typeof useAnimation>
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

      {/* Heroes row */}
      <div className="flex items-start justify-center gap-3 sm:gap-6 flex-1">
        {/* Player */}
        <div className="flex-1 max-w-[170px]">
          <HeroPanel hero={playerHero} hp={playerHp} choice={playerChoice} label="YOU" isBot={false} shakeCtrl={playerShake} />
        </div>

        {/* Center channel */}
        <div className="flex flex-col items-center justify-center gap-3 pt-24 shrink-0 w-20 sm:w-28">
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
          <HeroPanel hero={botHero} hp={botHp} choice={botChoice} label="ENEMY" isBot={true} shakeCtrl={botShake} />
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
function GameOverScreen({ won, playerHero, botHero, onReplay }: {
  won: boolean; playerHero: Hero; botHero: Hero; onReplay: () => void
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

// ── Main Page ─────────────────────────────────────────────────
export function RpsPage() {
  const navigate = useNavigate()
  const [phase, setPhase]         = useState<Phase>('select')
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

  function handleSelect(hero: Hero) {
    const bot = HEROES[Math.floor(Math.random() * HEROES.length)]
    setPlayerHero(hero)
    setBotHero(bot)
    setPhase('battle')
  }

  function handleChoice(choice: Choice) {
    if (isRevealing) return
    const botPick  = randomChoice()
    const result   = resolveRound(choice, botPick)
    const newPHp   = result === 'lose' ? playerHp - 1 : playerHp
    const newBHp   = result === 'win'  ? botHp - 1    : botHp

    setPlayerChoice(choice)
    setBotChoice(botPick)
    setRoundResult(result)
    setIsRevealing(true)

    // Shake loser after short reveal pause
    setTimeout(() => {
      if (result === 'lose') playerShake.start({ x: [0, -14, 14, -9, 9, -4, 4, 0], transition: { duration: 0.5 } })
      else if (result === 'win') botShake.start({ x: [0, -14, 14, -9, 9, -4, 4, 0], transition: { duration: 0.5 } })
    }, 280)

    // Apply HP → check gameover
    setTimeout(() => {
      setPlayerHp(newPHp)
      setBotHp(newBHp)
      setTimeout(() => {
        if (newPHp <= 0 || newBHp <= 0) {
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

  function reset() {
    setPhase('select')
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
            animate={{ opacity: [0, 0.55, 0] }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 pointer-events-none z-40"
            style={{ background: 'radial-gradient(ellipse at 15% 50%, rgba(239,68,68,0.55) 0%, transparent 55%)' }}
          />
        )}
        {roundResult === 'win' && (
          <motion.div
            key="vfx-win"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.45, 0] }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 pointer-events-none z-40"
            style={{ background: 'radial-gradient(ellipse at 85% 50%, rgba(239,68,68,0.45) 0%, transparent 55%)' }}
          />
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
        {phase === 'select' && (
          <SelectScreen onSelect={handleSelect} />
        )}
        {phase === 'battle' && playerHero && botHero && (
          <BattleScreen
            playerHero={playerHero} botHero={botHero}
            playerHp={playerHp}    botHp={botHp}
            playerChoice={playerChoice} botChoice={botChoice}
            roundResult={roundResult}   isRevealing={isRevealing}
            playerShake={playerShake}   botShake={botShake}
            onChoice={handleChoice}
          />
        )}
        {phase === 'gameover' && playerHero && botHero && (
          <GameOverScreen
            won={botHp <= 0}
            playerHero={playerHero}
            botHero={botHero}
            onReplay={reset}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
