import type { Block, BlockType, DaySchedule, Summary } from '@/types/timeblock'

export const SNAP_INTERVAL = 15       // minutes
export const MINUTES_IN_DAY = 1440
export const PX_PER_MINUTE = 1.5     // 1440min * 1.5 = 2160px total height

export function snapToInterval(minutes: number, interval = SNAP_INTERVAL): number {
  return Math.round(minutes / interval) * interval
}

export function minutesToPx(minutes: number): number {
  return minutes * PX_PER_MINUTE
}

export function pxToMinutes(px: number): number {
  return px / PX_PER_MINUTE
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export function minutesToDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function blocksOverlap(a: Block, b: Block): boolean {
  return a.start < b.end && a.end > b.start
}

export function computeSummary(schedule: DaySchedule): Summary {
  const totalHoursByType = {
    work: 0, life: 0, trade: 0, study: 0, rest: 0,
  } as Record<BlockType, number>

  let totalPlanned = 0

  for (const block of schedule.blocks) {
    const duration = (block.end - block.start) / 60
    totalHoursByType[block.type] = (totalHoursByType[block.type] ?? 0) + duration
    totalPlanned += block.end - block.start
  }

  return {
    totalHoursByType,
    freeTime: (MINUTES_IN_DAY - totalPlanned) / 60,
    utilizationRate: Math.round((totalPlanned / MINUTES_IN_DAY) * 100),
  }
}

export function getTimeLabels(): { minutes: number; label: string }[] {
  const labels: { minutes: number; label: string }[] = []
  for (let h = 0; h <= 24; h++) {
    labels.push({ minutes: h * 60, label: `${h.toString().padStart(2, '0')}:00` })
  }
  return labels
}

const STORAGE_KEY = 'timeblocking-schedules'

export function loadSchedule(date: string): DaySchedule {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { date, blocks: [] }
    const all: Record<string, DaySchedule> = JSON.parse(raw)
    return all[date] ?? { date, blocks: [] }
  } catch {
    return { date, blocks: [] }
  }
}

export function saveSchedule(schedule: DaySchedule): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all: Record<string, DaySchedule> = raw ? JSON.parse(raw) : {}
    all[schedule.date] = schedule
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // storage unavailable — silent fail
  }
}

export function copySchedule(from: DaySchedule, toDate: string): DaySchedule {
  return {
    date: toDate,
    blocks: from.blocks.map(b => ({ ...b, id: generateId() })),
  }
}
