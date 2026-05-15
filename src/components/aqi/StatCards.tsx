interface StatCardsProps {
  pm25: number
  temperature: number
  humidity: number
  wind: number
}

const STATS = [
  { key: 'pm25',        label: 'PM2.5',    unit: 'µg/m³', icon: '💨', color: '#EF4444' },
  { key: 'temperature', label: 'อุณหภูมิ', unit: '°C',     icon: '🌡️', color: '#F59E0B' },
  { key: 'humidity',    label: 'ความชื้น', unit: '%',       icon: '💧', color: '#3B82F6' },
  { key: 'wind',        label: 'ลม',       unit: 'm/s',    icon: '🌬️', color: '#10B981' },
]

export function StatCards({ pm25, temperature, humidity, wind }: StatCardsProps) {
  const values: Record<string, number> = { pm25, temperature, humidity, wind }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '0.875rem',
    }}>
      {STATS.map(s => (
        <div
          key={s.key}
          style={{
            background: '#ffffff',
            borderRadius: '1rem',
            padding: '1.25rem 1rem',
            boxShadow: '0 1px 10px rgba(0,0,0,0.07)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{s.icon}</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.875rem',
            fontWeight: 700,
            color: s.color,
            lineHeight: 1.1,
          }}>
            {s.key === 'humidity' || s.key === 'wind'
              ? values[s.key].toFixed(0)
              : values[s.key].toFixed(1)}
          </span>
          <span style={{ fontFamily: "'Noto Sans Thai', sans-serif", fontSize: '0.7rem', color: '#9CA3AF' }}>
            {s.unit}
          </span>
          <span style={{ fontFamily: "'Noto Sans Thai', sans-serif", fontSize: '0.875rem', color: '#374151', fontWeight: 600 }}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  )
}
