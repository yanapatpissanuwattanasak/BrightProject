import { useState, useEffect, useCallback, useRef } from 'react'

const API_URL = 'https://api.waqi.info/feed/bangkok/?token=demo'
const REFRESH_MS = 5 * 60 * 1000

export interface ForecastDay {
  day: string
  avg: number
  min: number
  max: number
}

export interface AQIData {
  aqi: number
  station: string
  time: string
  pm25: number
  temperature: number
  humidity: number
  wind: number
  forecast: ForecastDay[]
}

type Status = 'loading' | 'success' | 'error'

export function useAQIData() {
  const [data, setData] = useState<AQIData | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    setStatus('loading')
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.status !== 'ok') throw new Error('API ตอบกลับไม่ถูกต้อง')

      const d = json.data
      const iaqi = d.iaqi ?? {}
      const rawForecast: Array<{ avg: number; day: string; min: number; max: number }> =
        d.forecast?.daily?.pm25 ?? []

      setData({
        aqi: typeof d.aqi === 'number' ? d.aqi : parseInt(String(d.aqi), 10),
        station: d.city?.name ?? 'Bangkok',
        time: d.time?.s ?? new Date().toISOString(),
        pm25: iaqi.pm25?.v ?? 0,
        temperature: iaqi.t?.v ?? 0,
        humidity: iaqi.h?.v ?? 0,
        wind: iaqi.w?.v ?? 0,
        forecast: rawForecast.slice(0, 5).map(f => ({
          day: f.day,
          avg: f.avg,
          min: f.min,
          max: f.max,
        })),
      })
      setStatus('success')
      setError(null)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    }
  }, [])

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, REFRESH_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchData])

  return { data, status, error, retry: fetchData }
}
