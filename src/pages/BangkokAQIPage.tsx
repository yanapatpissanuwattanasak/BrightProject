import { useAQIData } from '@/hooks/useAQIData'
import { getAQILevel } from '@/data/aqiLevels'
import { WeatherSession } from '@/components/aqi/WeatherSession'
import { StatCards } from '@/components/aqi/StatCards'
import { ForecastChart } from '@/components/aqi/ForecastChart'
import { HealthAdvice } from '@/components/aqi/HealthAdvice'

const SECTION_STYLE: React.CSSProperties = {
  background: '#F3F4F6',
  minHeight: '100vh',
}

const INNER_STYLE: React.CSSProperties = {
  maxWidth: '720px',
  margin: '0 auto',
  padding: '2.5rem 1.25rem 4rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  fontFamily: "'Noto Sans Thai', sans-serif",
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100svh',
      background: 'linear-gradient(160deg, #1E293B 0%, #334155 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.25rem',
      fontFamily: "'Noto Sans Thai', sans-serif",
      color: '#fff',
    }}>
      <div className="aqi-skeleton" style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)',
      }} />
      <div className="aqi-skeleton" style={{
        width: '180px',
        height: '20px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.10)',
      }} />
      <p style={{ opacity: 0.6, fontSize: '0.9375rem' }}>กำลังโหลดข้อมูลคุณภาพอากาศ…</p>
    </div>
  )
}

function ErrorScreen({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div style={{
      minHeight: '100svh',
      background: '#1E293B',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      fontFamily: "'Noto Sans Thai', sans-serif",
      color: '#fff',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: '3rem' }}>⚠️</span>
      <p style={{ fontSize: '1.0625rem', opacity: 0.85 }}>ไม่สามารถโหลดข้อมูลได้</p>
      <p style={{ fontSize: '0.8125rem', opacity: 0.5, maxWidth: '300px' }}>{message}</p>
      <button
        onClick={retry}
        style={{
          fontFamily: 'inherit',
          marginTop: '0.5rem',
          background: '#3B82F6',
          color: '#fff',
          border: 'none',
          borderRadius: '999px',
          padding: '0.75rem 2rem',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
      >
        ลองใหม่อีกครั้ง
      </button>
    </div>
  )
}

export default function BangkokAQIPage() {
  const { data, status, error, retry } = useAQIData()

  if (status === 'loading' && !data) return <LoadingScreen />
  if (status === 'error' && !data) return <ErrorScreen message={error ?? 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'} retry={retry} />
  if (!data) return null

  const level = getAQILevel(data.aqi)

  return (
    <div style={{ minHeight: '100svh' }}>
      {/* Hero */}
      <WeatherSession data={data} level={level} />

      {/* Stats */}
      <div id="aqi-stats" style={SECTION_STYLE}>
        <div style={INNER_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontFamily: 'inherit', fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              ข้อมูลสภาพอากาศ — กรุงเทพฯ
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>อัปเดตทุก 5 นาที</span>
          </div>

          <StatCards
            pm25={data.pm25}
            temperature={data.temperature}
            humidity={data.humidity}
            wind={data.wind}
          />

          <ForecastChart forecast={data.forecast} />

          <HealthAdvice level={level} />

          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'center', margin: 0 }}>
            ข้อมูลจาก World Air Quality Index (WAQI) · {data.station}
          </p>
        </div>
      </div>
    </div>
  )
}
