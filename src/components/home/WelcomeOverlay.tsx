import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'welcome_last_shown'

const GREETINGS = [
  { text: 'สวัสดี', lang: 'th' },
  { text: 'Hello', lang: 'en' },
  { text: 'こんにちは', lang: 'ja' },
  { text: 'Bonjour', lang: 'fr' },
  { text: 'Hola', lang: 'es' },
]

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  size: Math.random() * 8 + 5,
  color: ['#6366F1', '#8B5CF6', '#06B6D4', '#a78bfa', '#67e8f9'][i % 5],
  duration: 5 + Math.random() * 7,
  delay: Math.random() * 3,
  startX: Math.random() * 100,
  startY: Math.random() * 100,
  radiusX: 150 + Math.random() * 300,
  radiusY: 100 + Math.random() * 200,
  clockwise: Math.random() > 0.5,
}))

function OrbitParticle({ p }: { p: (typeof PARTICLES)[0] }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        width: p.size,
        height: p.size,
        background: p.color,
        boxShadow: `0 0 ${p.size * 4}px ${p.color}, 0 0 ${p.size * 10}px ${p.color}80`,
        left: `${p.startX}%`,
        top: `${p.startY}%`,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        x: [
          0,
          p.radiusX * (p.clockwise ? 1 : -1),
          0,
          -p.radiusX * (p.clockwise ? 1 : -1),
          0,
        ],
        y: [0, p.radiusY * 0.5, p.radiusY, p.radiusY * 0.5, 0],
        opacity: [0.2, 0.9, 0.6, 0.9, 0.2],
        scale: [0.8, 1.4, 1, 1.4, 0.8],
      }}
      transition={{
        duration: p.duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: p.delay,
      }}
    />
  )
}

export function WelcomeOverlay() {
  const [visible, setVisible] = useState(false)
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const today = new Date().toDateString()
    const lastShown = localStorage.getItem(STORAGE_KEY)
    if (lastShown !== today) {
      setVisible(true)
      localStorage.setItem(STORAGE_KEY, today)
    }
  }, [])

  useEffect(() => {
    if (!visible) return

    const cycleInterval = setInterval(() => {
      setGreetingIndex((i) => {
        const next = i + 1
        if (next >= GREETINGS.length) {
          clearInterval(cycleInterval)
          setTimeout(() => {
            setLeaving(true)
            setTimeout(() => setVisible(false), 700)
          }, 400)
          return i
        }
        return next
      })
    }, 500)

    return () => clearInterval(cycleInterval)
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: '#0a0a0f' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: leaving ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Aurora orbs */}
          <motion.div
            className="pointer-events-none absolute w-[900px] h-[900px] rounded-full opacity-50"
            style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 65%)', top: '-20%', left: '-20%' }}
            animate={{ x: [0, 120, -60, 0], y: [0, 80, -40, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute w-[800px] h-[800px] rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 65%)', bottom: '-20%', right: '-20%' }}
            animate={{ x: [0, -80, 60, 0], y: [0, -70, 40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="pointer-events-none absolute w-[700px] h-[700px] rounded-full opacity-35"
            style={{ background: 'radial-gradient(circle, #06B6D4 0%, transparent 65%)', top: '30%', left: '40%' }}
            animate={{ x: [0, 70, -100, 0], y: [0, -60, 80, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />

          {/* Floating particles */}
          {PARTICLES.map((p) => (
            <OrbitParticle key={p.id} p={p} />
          ))}

          {/* dot grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* greeting text */}
          <AnimatePresence mode="wait">
            <motion.span
              key={greetingIndex}
              className="relative text-[8rem] leading-none font-bold text-white select-none"
              style={{ textShadow: '0 0 60px rgba(99,102,241,0.9), 0 0 120px rgba(99,102,241,0.4)' }}
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {GREETINGS[greetingIndex].text}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
