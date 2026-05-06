import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TAROT_CARDS } from '@/data/tarot'
import type { TarotCard } from '@/types/tarot'
import { ROUTES } from '@/constants/routes'

const POSITIONS = ['อดีต / ต้นเหตุ', 'ปัจจุบัน', 'อนาคต / ผลลัพธ์'] as const

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

function CardBack({ selected, onClick, index }: {
  selected: boolean
  onClick: () => void
  index: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      onClick={onClick}
      className={[
        'relative w-12 h-[72px] rounded-lg border-2 cursor-pointer transition-all duration-200 shrink-0',
        'bg-gradient-to-b from-indigo-950 to-purple-950',
        selected
          ? 'border-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.6)] -translate-y-2 scale-105'
          : 'border-indigo-700/60 hover:border-indigo-500 hover:shadow-[0_0_8px_rgba(99,102,241,0.4)] hover:-translate-y-1',
      ].join(' ')}
      aria-label="Select this card"
    >
      {/* Pattern */}
      <div className="absolute inset-[3px] rounded border border-indigo-700/40 flex items-center justify-center">
        <span className="text-indigo-400/50 text-lg select-none">✦</span>
      </div>
      {selected && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-violet-400 rounded-full flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">✓</span>
        </div>
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
  const roman = card.id === 0 ? '0' : ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'][card.id - 1]

  return (
    <div className="flex flex-col items-center gap-3 w-36">
      <p className="text-[11px] uppercase tracking-widest text-violet-400 font-medium">{position}</p>

      <div
        className="relative w-28 h-44"
        style={{ perspective: '800px' }}
      >
        <motion.div
          initial={{ rotateY: 180 }}
          animate={{ rotateY: revealed ? 0 : 180 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full"
        >
          {/* Back face — shown when container is at rotateY(180) */}
          <div
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="absolute inset-0 rounded-xl bg-gradient-to-b from-indigo-950 to-purple-950 border-2 border-indigo-700/60 flex items-center justify-center"
          >
            <span className="text-3xl text-indigo-400/40">✦</span>
          </div>

          {/* Front face — shown when container is at rotateY(0) */}
          <div
            style={{ backfaceVisibility: 'hidden', transform: reversed ? 'rotate(180deg)' : undefined }}
            className="absolute inset-0 rounded-xl bg-gradient-to-b from-indigo-900 to-purple-900 border-2 border-violet-500/60 flex flex-col items-center justify-between p-3 shadow-[0_0_20px_rgba(167,139,250,0.3)]"
          >
            <p className="text-[10px] font-mono text-violet-300/70 tracking-wider">{roman}</p>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-3xl">{card.symbol}</span>
              <p className="text-xs font-semibold text-white text-center leading-tight">{card.name}</p>
              <p className="text-[10px] text-indigo-300/60 text-center">{card.nameEn}</p>
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              {reversed && (
                <span className="text-[9px] bg-rose-900/60 text-rose-300 px-1.5 py-0.5 rounded-full w-full text-center">
                  ↑ กลับหัว
                </span>
              )}
              {card.keywords.map(kw => (
                <span key={kw} className="text-[9px] bg-violet-900/60 text-violet-300 px-1.5 py-0.5 rounded-full">
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

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────

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
    // randomly assign reversed for each selected card (~40% chance)
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
    <div className="min-h-screen bg-[#0c0718] text-white">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-indigo-900/40">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="text-indigo-400/60 hover:text-indigo-300 text-xs transition-colors flex items-center gap-1.5"
        >
          ← กลับหน้าหลัก
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-semibold text-violet-300 tracking-widest uppercase">
            ✦ ไพ่ยิปซี ✦
          </h1>
          <p className="text-[10px] text-indigo-400/50">Tarot Reading</p>
        </div>
        <div className="w-20" />
      </header>

      {/* Pick Phase */}
      {phase === 'pick' && (
        <div className="flex flex-col items-center px-6 py-8 gap-8">
          {/* Instruction */}
          <div className="text-center">
            <p className="text-lg font-semibold text-violet-200 mb-1">เลือกไพ่ 3 ใบ</p>
            <p className="text-sm text-indigo-400/70">
              ใช้สมาธิและสัญชาตญาณ — เลือกไพ่ที่ดึงดูดใจคุณ
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={[
                    'w-7 h-7 rounded-full border text-xs flex items-center justify-center transition-all duration-300',
                    selectedIds.length > i
                      ? 'bg-violet-500 border-violet-400 text-white'
                      : 'border-indigo-700 text-indigo-600',
                  ].join(' ')}
                >
                  {selectedIds.length > i ? '✦' : i + 1}
                </div>
              ))}
              <span className="text-xs text-indigo-500 ml-1">{selectedIds.length}/3</span>
            </div>
          </div>

          {/* Card grid */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            {shuffled.map((card, idx) => (
              <CardBack
                key={card.id}
                index={idx}
                selected={selectedIds.includes(card.id)}
                onClick={() => toggleCard(card.id)}
              />
            ))}
          </div>

          {/* Confirm button */}
          <AnimatePresence>
            {selectedIds.length === 3 && (
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                onClick={startReading}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all hover:scale-105"
              >
                ✦ เปิดคำทำนาย ✦
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Reading Phase */}
      {phase === 'reading' && (
        <div className="flex flex-col items-center px-6 py-8 gap-10">

          {/* 3 Cards */}
          <div className="flex gap-8 flex-wrap justify-center">
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

          {/* Reading summary — shows after all 3 revealed */}
          <AnimatePresence>
            {revealedCount >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="w-full max-w-2xl flex flex-col gap-6"
              >
                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-indigo-800/60" />
                  <span className="text-xs text-violet-400/60 tracking-widest uppercase">คำทำนาย</span>
                  <div className="flex-1 border-t border-indigo-800/60" />
                </div>

                {/* Per-card meaning */}
                <div className="flex flex-col gap-4">
                  {selectedCards.map((card, i) => {
                    const isReversed = reversedMap[card.id] ?? false
                    return (
                      <div key={card.id} className="bg-indigo-950/60 rounded-xl p-4 border border-indigo-800/40">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={['text-lg transition-transform', isReversed ? 'rotate-180' : ''].join(' ')}>{card.symbol}</span>
                          <div>
                            <span className="text-[10px] text-violet-400/70 uppercase tracking-widest block">{POSITIONS[i]}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-violet-200">{card.name}</span>
                              <span className="text-xs text-indigo-400/60">{card.nameEn}</span>
                              {isReversed && (
                                <span className="text-[10px] bg-rose-900/50 text-rose-300 px-1.5 py-0.5 rounded-full">กลับหัว</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-indigo-200/80 leading-relaxed">
                          {isReversed && (
                            <span className="text-rose-300/80">พลังงานนี้กำลังถูกบล็อกหรือชะลอ — </span>
                          )}
                          {card.meaning}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Speech note */}
                <div className="flex items-start gap-2.5 bg-indigo-950/40 rounded-xl px-4 py-3 border border-indigo-800/30">
                  <span className="text-base shrink-0 mt-0.5">🕊️</span>
                  <p className="text-xs text-indigo-300/70 leading-relaxed">
                    คำทำนายนี้ใช้ภาษาที่นุ่มนวลและเป็นแรงบันดาลใจ
                    ไม่ใช้คำพูดที่รุนแรงหรือทำให้เกิดความกลัว
                    ผลลัพธ์ขึ้นอยู่กับตัวคุณเองเสมอ
                  </p>
                </div>

                {/* Reset */}
                <div className="flex justify-center pb-4">
                  <button
                    onClick={reset}
                    className="px-6 py-2.5 rounded-full border border-indigo-700 text-indigo-400 text-sm hover:border-violet-500 hover:text-violet-300 transition-all"
                  >
                    ✦ เริ่มใหม่
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
