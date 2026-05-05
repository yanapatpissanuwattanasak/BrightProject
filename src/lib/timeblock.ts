import type { Block, BlockTypeDef, DaySchedule, Summary } from '@/types/timeblock'
import { DEFAULT_BLOCK_TYPES } from '@/types/timeblock'

export const SNAP_INTERVAL = 15
export const MINUTES_IN_DAY = 1440

export function snapToInterval(minutes: number, interval = SNAP_INTERVAL): number {
  return Math.round(minutes / interval) * interval
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

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function computeSummary(schedule: DaySchedule): Summary {
  const totalHoursByType: Record<string, number> = {}
  let totalPlanned = 0

  for (const block of schedule.blocks) {
    const duration = (block.end - block.start) / 60
    totalHoursByType[block.typeId] = (totalHoursByType[block.typeId] ?? 0) + duration
    totalPlanned += block.end - block.start
  }

  return {
    totalHoursByType,
    freeTime: (MINUTES_IN_DAY - totalPlanned) / 60,
    utilizationRate: Math.round((totalPlanned / MINUTES_IN_DAY) * 100),
  }
}

export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return dates
}

// Assign non-overlapping lanes to blocks for horizontal display
export function assignLanes(blocks: Block[]): Map<string, number> {
  const sorted = [...blocks].sort((a, b) => a.start - b.start)
  const laneEnds: number[] = []
  const assignment = new Map<string, number>()

  for (const block of sorted) {
    let lane = laneEnds.findIndex(end => end <= block.start)
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0) }
    laneEnds[lane] = block.end
    assignment.set(block.id, lane)
  }
  return assignment
}

export function maxLanes(blocks: Block[]): number {
  const assignment = assignLanes(blocks)
  if (assignment.size === 0) return 1
  return Math.max(...assignment.values()) + 1
}

const STORAGE_KEY = 'timeblocking-schedules'
const TYPES_KEY = 'timeblocking-types'

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

export function loadAllSchedules(): Record<string, DaySchedule> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function loadBlockTypes(): BlockTypeDef[] {
  try {
    const raw = localStorage.getItem(TYPES_KEY)
    if (!raw) return DEFAULT_BLOCK_TYPES
    return JSON.parse(raw)
  } catch {
    return DEFAULT_BLOCK_TYPES
  }
}

export function saveBlockTypes(types: BlockTypeDef[]): void {
  try {
    localStorage.setItem(TYPES_KEY, JSON.stringify(types))
  } catch {
    // storage unavailable
  }
}

