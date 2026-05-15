import { useEffect, useRef, useState } from 'react'
import { ParticleCanvas } from './ParticleCanvas'
import type { AQIData } from '@/hooks/useAQIData'
import type { AQILevel } from '@/data/aqiLevels'
import './aqi.css'

interface WeatherSessionProps {
  data: AQIData
  level: AQILevel
}

function BgDecorations({ animation }: { animation: AQILevel['animation'] }) {
  switch (animation) {
    case 'good':
      return (
        <>
          <div className="sun-glow" />
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
        </>
      )
    case 'moderate':
      return <div className="haze-layer" />
    case 'unhealthy':
      return (
        <>
          <div className="smoke-band smoke-band-1" />
          <div className="smoke-band smoke-band-2" />
          <div className="smoke-band smoke-band-3" />
        </>
      )
    case 'very-unhealthy':
      return <div className="pulse-orb" />
    case 'hazardous':
      return <div className="storm-vignette" />
    default:
      return null
  }
}

function formatTime(timeStr: string) {
  try {
    const d = new Date(timeStr)
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return timeStr
  }
}

export function WeatherSession({ data, level }: WeatherSessionProps) {
  const [displayAqi, setDisplayAqi] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const target = data.aqi
    const duration = 1400
    const start = performance.now()

    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayAqi(Math.round(eased * target))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [data.aqi])

  return (
    <section
      className={`aqi-hero ${level.animation === 'hazardous' ? 'aqi-hazardous' : ''}`}
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '2rem 1.5rem',
        background: level.bg,
        fontFamily: "'Noto Sans Thai', sans-serif",
      }}
    >
      {/* Decorative background layer */}
      <BgDecorations animation={level.animation} />

      {/* Particle canvas */}
      <ParticleCanvas
        rgb={level.particleRgb}
        count={level.particleCount}
        speed={level.particleSpeed}
        animKey={level.animation}
      />

      {/* Foreground content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: '#ffffff', width: '100%', maxWidth: '560px' }}>

        {/* Condition badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(10px)',
          borderRadius: '999px',
          padding: '0.4rem 1.1rem',
          marginBottom: '1.25rem',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <span style={{ fontSize: '1.25rem' }}>{level.emoji}</span>
          <span style={{ fontSize: '1rem', fontWeight: 600 }}>{level.label}</span>
        </div>

        {/* Giant AQI number */}
        <div
          className="aqi-number-appear"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(5.5rem, 24vw, 11rem)',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            textShadow: `0 0 80px ${level.accentColor}90, 0 4px 24px rgba(0,0,0,0.3)`,
          }}
        >
          {displayAqi}
        </div>

        <div style={{ fontSize: '0.875rem', opacity: 0.75, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
          AQI · ดัชนีคุณภาพอากาศ
        </div>

        {/* Station + updated time */}
        <div style={{ fontSize: '0.8125rem', opacity: 0.65, marginBottom: '1.75rem' }}>
          📍 {data.station} &nbsp;·&nbsp; อัปเดต {formatTime(data.time)} น.
        </div>

        {/* Health tip pill */}
        <p style={{
          fontSize: '0.9375rem',
          lineHeight: 1.65,
          background: 'rgba(0,0,0,0.22)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '0.75rem 1.25rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          {level.tip}
        </p>

        {/* Scroll CTA */}
        <button
          onClick={() => document.getElementById('aqi-stats')?.scrollIntoView({ behavior: 'smooth' })}
          style={{
            fontFamily: 'inherit',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.35)',
            color: '#ffffff',
            borderRadius: '999px',
            padding: '0.75rem 2.25rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'background 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)' }}
        >
          ดูรายละเอียด ↓
        </button>
      </div>
    </section>
  )
}
