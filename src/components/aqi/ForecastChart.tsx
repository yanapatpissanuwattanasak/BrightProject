import { getAQILevel } from '@/data/aqiLevels'
import type { ForecastDay } from '@/hooks/useAQIData'

interface ForecastChartProps {
  forecast: ForecastDay[]
}

const DOW_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

function dayLabel(dateStr: string) {
  try {
    return DOW_TH[new Date(dateStr).getDay()]
  } catch {
    return dateStr.slice(5)
  }
}

export function ForecastChart({ forecast }: ForecastChartProps) {
  if (forecast.length === 0) return null

  const maxVal = Math.max(...forecast.map(f => f.max), 50)

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 1px 10px rgba(0,0,0,0.07)',
    }}>
      <h3 style={{
        fontFamily: "'Noto Sans Thai', sans-serif",
        fontSize: '0.9375rem',
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 1.25rem',
      }}>
        พยากรณ์ PM2.5 · 5 วัน
      </h3>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.625rem', height: '130px' }}>
        {forecast.map(f => {
          const level = getAQILevel(f.avg)
          const barH = Math.max((f.avg / maxVal) * 90, 6)

          return (
            <div
              key={f.day}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}
              title={`avg ${f.avg} | min ${f.min} | max ${f.max}`}
            >
              {/* avg value */}
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                color: level.accentColor,
              }}>
                {f.avg}
              </span>

              {/* Bar */}
              <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  width: '100%',
                  height: `${barH}%`,
                  background: `linear-gradient(180deg, ${level.accentColor} 0%, ${level.accentColor}88 100%)`,
                  borderRadius: '6px 6px 2px 2px',
                  transition: 'height 0.7s cubic-bezier(0.34,1.56,0.64,1)',
                  minHeight: '6px',
                  position: 'relative',
                }} />
              </div>

              {/* Day label */}
              <span style={{
                fontFamily: "'Noto Sans Thai', sans-serif",
                fontSize: '0.75rem',
                color: '#6B7280',
              }}>
                {dayLabel(f.day)}
              </span>
            </div>
          )
        })}
      </div>

      {/* AQI colour legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
        {[
          { label: 'ดี', color: '#0EA5E9' },
          { label: 'ปานกลาง', color: '#F59E0B' },
          { label: 'เสี่ยง', color: '#D97706' },
          { label: 'ไม่ดี', color: '#EA580C' },
          { label: 'อันตราย', color: '#7C3AED' },
        ].map(l => (
          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.color, display: 'inline-block' }} />
            <span style={{ fontFamily: "'Noto Sans Thai', sans-serif", fontSize: '0.7rem', color: '#6B7280' }}>{l.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
