import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TAROT_CARDS } from '@/data/tarot'
import type { TarotCard } from '@/types/tarot'
import { ROUTES } from '@/constants/routes'

const POSITIONS = ['อดีต / ต้นเหตุ', 'ปัจจุบัน', 'อนาคต / ผลลัพธ์'] as const
const ROMAN = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI']

function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute w-[120vw] h-[120vw] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 60%)', top: '-30%', left: '-30%' }}
        animate={{ x: [0, 80, -40, 0], y: [0, 60, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[100vw] h-[100vw] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 60%)', bottom: '-20%', right: '-20%' }}
        animate={{ x: [0, -60, 40, 0], y: [0, -50, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute w-[80vw] h-[80vw] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 60%)', top: '40%', left: '30%' }}
        animate={{ x: [0, 50, -70, 0], y: [0, -40, 60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  )
}

function CardBack({ selected, onClick, index }: {
  selected: boolean
  onClick: () => void
  index: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.012, duration: 0.35, ease: 'easeOut' }}
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.07 }}
      whileTap={{ scale: 0.94 }}
      className={[
        'relative w-14 h-[88px] sm:w-16 sm:h-[104px] rounded-xl border cursor-pointer shrink-0',
        'bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 transition-shadow duration-200',
        selected
          ? 'border-violet-400/80 shadow-[0_0_20px_rgba(167,139,250,0.65),0_0_40px_rgba(167,139,250,0.25)]'
          : 'border-indigo-700/40 hover:border-indigo-500/60 hover:shadow-[0_0_14px_rgba(99,102,241,0.35)]',
      ].join(' ')}
      aria-label="Select this card"
    >
      <div className="absolute inset-[3px] rounded-lg border border-indigo-600/25">
        <div className="absolute inset-[3px] rounded-md border border-indigo-700/20 flex items-center justify-center">
          <span className={['text-xl transition-colors duration-300', selected ? 'text-violet-400' : 'text-indigo-600/40'].join(' ')}>✦</span>
        </div>
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(167,139,250,0.8)]"
        >
          <span className="text-[10px] font-bold text-white">✓</span>
        </motion.div>
      )}
    </motion.button>
  )
}

function CardFront({ card, position, revealed, reversed }: {
  card: TarotCard
  position: string
  revealed: boolean
  reversed: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs uppercase tracking-[0.2em] text-violet-400/80 font-medium"
      >
        {position}
      </motion.p>

      <div className="relative w-40 h-64 sm:w-48 sm:h-[312px]" style={{ perspective: '1000px' }}>
        <motion.div
          initial={{ rotateY: 180 }}
          animate={{ rotateY: revealed ? 0 : 180 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full"
        >
          {/* Back face */}
          <div
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 border border-indigo-700/50 flex items-center justify-center"
          >
            <div className="absolute inset-[6px] rounded-xl border border-indigo-700/25 flex items-center justify-center">
              <span className="text-5xl text-indigo-400/20">✦</span>
            </div>
          </div>

          {/* Front face */}
          <div
            style={{ backfaceVisibility: 'hidden', transform: reversed ? 'rotate(180deg)' : undefined }}
            className="absolute inset-0 rounded-2xl border flex flex-col items-center justify-between p-4 bg-gradient-to-b from-indigo-900/90 via-purple-900/80 to-indigo-950 border-violet-500/50 shadow-[0_0_30px_rgba(167,139,250,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <p className="text-[11px] font-mono text-violet-300/50 tracking-[0.15em]">{ROMAN[card.id]}</p>
            <div className="flex flex-col items-center gap-3">
              <span className="text-5xl sm:text-6xl">{card.symbol}</span>
              <div className="text-center">
                <p className="text-base font-bold text-white leading-tight">{card.name}</p>
                <p className="text-xs text-indigo-300/55 mt-0.5">{card.nameEn}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 justify-center w-full">
              {reversed && (
                <span className="text-[10px] bg-rose-900/60 text-rose-300 px-2 py-0.5 rounded-full w-full text-center mb-1">
                  ↕ กลับหัว
                </span>
              )}
              {card.keywords.map(kw => (
                <span key={kw} className="text-[10px] bg-violet-900/50 text-violet-300 px-1.5 py-0.5 rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export function TarotPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'pick' | 'reading'>('pick')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [reversedMap, setReversedMap] = useState<Record<number, boolean>>({})

  const shuffled = useMemo(() => [...TAROT_CARDS].sort(() => Math.random() - 0.5), [])

  function toggleCard(id: number) {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  function startReading() {
    const map: Record<number, boolean> = {}
    selectedIds.forEach(id => { map[id] = Math.random() < 0.4 })
    setReversedMap(map)
    setPhase('reading')
  }

  useEffect(() => {
    if (phase !== 'reading') return
    let count = 0
    const timer = setInterval(() => {
      count++
      setRevealedCount(count)
      if (count >= 3) clearInterval(timer)
    }, 900)
    return () => clearInterval(timer)
  }, [phase])

  function reset() {
    setPhase('pick')
    setSelectedIds([])
    setRevealedCount(0)
    setReversedMap({})
  }

  const selectedCards: TarotCard[] = selectedIds.map(id => TAROT_CARDS.find(c => c.id === id)!)

  return (
    <div className="min-h-screen bg-[#07050f] text-white overflow-x-hidden">
      <AuroraBackground />

      {/* Floating back button */}
      <div className="fixed top-5 left-5 z-50">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="text-indigo-400/60 hover:text-indigo-300 text-xs transition-colors flex items-center gap-1.5 bg-indigo-950/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-indigo-800/40 hover:border-indigo-600/60"
        >
          ← กลับ
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── PICK PHASE ── */}
        {phase === 'pick' && (
          <motion.div
            key="pick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 min-h-screen flex flex-col items-center pt-16 pb-14 px-4 gap-10"
          >
            {/* Title block */}
            <div className="text-center mt-8">
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl mb-5"
              >
                🔮
              </motion.div>
              <h1
                className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight"
                style={{ textShadow: '0 0 50px rgba(139,92,246,0.7), 0 0 100px rgba(139,92,246,0.25)' }}
              >
                <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                  ✦ ไพ่ยิปซี ✦
                </span>
              </h1>
              <p className="text-indigo-300/50 text-sm tracking-[0.18em]">Tarot Reading · 3 Card Spread</p>
              <p className="text-indigo-200/40 text-xs mt-2">ใช้สมาธิและสัญชาตญาณ — เลือกไพ่ที่ดึงดูดใจคุณ 3 ใบ</p>

              {/* Progress dots */}
              <div className="mt-6 flex items-center justify-center gap-3">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={selectedIds.length > i ? { scale: [1, 1.25, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={[
                      'w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold transition-all duration-300',
                      selectedIds.length > i
                        ? 'bg-gradient-to-br from-violet-500 to-indigo-600 border-violet-400 text-white shadow-[0_0_14px_rgba(167,139,250,0.65)]'
                        : 'border-indigo-700/50 text-indigo-600',
                    ].join(' ')}
                  >
                    {selectedIds.length > i ? '✦' : i + 1}
                  </motion.div>
                ))}
                <span className="text-xs text-indigo-500 ml-1">{selectedIds.length} / 3</span>
              </div>
            </div>

            {/* Card grid */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 max-w-3xl w-full">
              {shuffled.map((card, idx) => (
                <CardBack
                  key={card.id}
                  index={idx}
                  selected={selectedIds.includes(card.id)}
                  onClick={() => toggleCard(card.id)}
                />
              ))}
            </div>

            {/* CTA */}
            <AnimatePresence>
              {selectedIds.length === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.button
                    onClick={startReading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-10 py-3.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold text-sm tracking-wider shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_48px_rgba(139,92,246,0.75)] transition-shadow"
                  >
                    ✦ เปิดคำทำนาย ✦
                  </motion.button>
                  <p className="text-[11px] text-indigo-500">คุณเลือกไพ่ครบ 3 ใบแล้ว</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── READING PHASE ── */}
        {phase === 'reading' && (
          <motion.div
            key="reading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 min-h-screen flex flex-col items-center pt-20 pb-16 px-4 gap-12"
          >
            {/* Title */}
            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ textShadow: '0 0 35px rgba(139,92,246,0.55)' }}
              >
                <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                  ✦ คำทำนายของคุณ ✦
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[11px] text-indigo-400/45 mt-1.5 tracking-[0.18em]"
              >
                Past · Present · Future
              </motion.p>
            </div>

            {/* 3 Cards */}
            <div className="flex gap-6 sm:gap-10 flex-wrap justify-center">
              {selectedCards.map((card, i) => (
                <CardFront
                  key={card.id}
                  card={card}
                  position={POSITIONS[i]}
                  revealed={i < revealedCount}
                  reversed={reversedMap[card.id] ?? false}
                />
              ))}
            </div>

            {/* Reading summary */}
            <AnimatePresence>
              {revealedCount >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.65 }}
                  className="w-full max-w-2xl flex flex-col gap-5"
                >
                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-700/50 to-transparent" />
                    <span className="text-[11px] text-violet-400/60 tracking-[0.2em] uppercase">ความหมาย</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-700/50 to-transparent" />
                  </div>

                  {/* Per-card readings */}
                  {selectedCards.map((card, i) => {
                    const isReversed = reversedMap[card.id] ?? false
                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                        className="relative overflow-hidden rounded-2xl border border-indigo-800/35 bg-gradient-to-br from-indigo-950/80 via-purple-950/50 to-indigo-950/80 backdrop-blur-sm p-5"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500/60 via-purple-500/30 to-transparent rounded-l-2xl" />
                        <div className="flex items-start gap-3.5">
                          <span className={['text-2xl mt-0.5 shrink-0', isReversed ? 'rotate-180' : ''].join(' ')}>{card.symbol}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                              <span className="text-[10px] text-violet-400/65 uppercase tracking-widest">{POSITIONS[i]}</span>
                              <span className="text-sm font-bold text-violet-200">{card.name}</span>
                              <span className="text-xs text-indigo-400/55">{card.nameEn}</span>
                              {isReversed && (
                                <span className="text-[10px] bg-rose-900/50 text-rose-300 px-2 py-0.5 rounded-full">↕ กลับหัว</span>
                              )}
                            </div>
                            <p className="text-sm text-indigo-200/75 leading-relaxed">
                              {isReversed && <span className="text-rose-300/75">พลังงานนี้กำลังถูกบล็อกหรือชะลอ — </span>}
                              {card.meaning}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {card.keywords.map(kw => (
                                <span key={kw} className="text-[10px] bg-violet-900/40 text-violet-300/75 px-2 py-0.5 rounded-full border border-violet-800/35">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}

                  {/* Disclaimer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="flex items-start gap-3 bg-indigo-950/40 rounded-2xl px-5 py-4 border border-indigo-800/20"
                  >
                    <span className="text-base shrink-0">🕊️</span>
                    <p className="text-xs text-indigo-400/55 leading-relaxed">
                      คำทำนายนี้ใช้ภาษาที่นุ่มนวลและเป็นแรงบันดาลใจ ไม่ใช้คำพูดที่รุนแรงหรือทำให้เกิดความกลัว
                      ผลลัพธ์ขึ้นอยู่กับตัวคุณเองเสมอ
                    </p>
                  </motion.div>

                  {/* Reset */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                    className="flex justify-center pb-2"
                  >
                    <motion.button
                      onClick={reset}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="px-8 py-2.5 rounded-full border border-indigo-700/55 text-indigo-400 text-sm hover:border-violet-500/65 hover:text-violet-300 hover:bg-violet-950/30 transition-all"
                    >
                      ✦ เริ่มต้นใหม่
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
