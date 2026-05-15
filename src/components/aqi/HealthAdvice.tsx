import type { AQILevel } from '@/data/aqiLevels'

interface HealthAdviceProps {
  level: AQILevel
}

const ICONS: Record<AQILevel['animation'], string> = {
  good:           '🏃',
  moderate:       '🚶',
  sensitive:      '😷',
  unhealthy:      '🏠',
  'very-unhealthy': '🔒',
  hazardous:      '🚨',
}

export function HealthAdvice({ level }: HealthAdviceProps) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 1px 10px rgba(0,0,0,0.07)',
      borderLeft: `5px solid ${level.accentColor}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.875rem' }}>
        <span style={{ fontSize: '2.25rem', lineHeight: 1 }}>{ICONS[level.animation]}</span>
        <div>
          <p style={{
            fontFamily: "'Noto Sans Thai', sans-serif",
            fontSize: '0.75rem',
            color: '#9CA3AF',
            margin: '0 0 0.2rem',
          }}>
            คำแนะนำด้านสุขภาพ
          </p>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontFamily: "'Noto Sans Thai', sans-serif",
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: level.accentColor,
            background: `${level.accentColor}18`,
            borderRadius: '999px',
            padding: '0.15rem 0.625rem',
          }}>
            {level.emoji} {level.label}
          </span>
        </div>
      </div>

      <p style={{
        fontFamily: "'Noto Sans Thai', sans-serif",
        fontSize: '0.9375rem',
        color: '#374151',
        lineHeight: 1.75,
        margin: 0,
      }}>
        {level.advice}
      </p>
    </div>
  )
}
