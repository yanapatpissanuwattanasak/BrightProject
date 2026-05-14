import type { BlockTypeDef, DaySchedule, DaySummary, Task, TimeSlot } from '@/types/timeblock'
import { DEFAULT_BLOCK_TYPES } from '@/types/timeblock'

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

export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return dates
}

export function computeDaySummary(schedule: DaySchedule): DaySummary {
  const allTasks: Task[] = [
    ...schedule.unscheduled,
    ...schedule.slots.flatMap(s => s.tasks),
  ]

  const estimatedMinutesByType: Record<string, number> = {}
  let estimatedMinutesTotal = 0

  for (const task of allTasks) {
    const mins = task.estimatedMinutes ?? 0
    if (task.typeId && mins > 0) {
      estimatedMinutesByType[task.typeId] = (estimatedMinutesByType[task.typeId] ?? 0) + mins
    }
    estimatedMinutesTotal += mins
  }

  return {
    totalTasks: allTasks.length,
    doneTasks: allTasks.filter(t => t.done).length,
    estimatedMinutesByType,
    estimatedMinutesTotal,
  }
}

// --- Migration: convert old block-based schedule to slot-based ---
function migrateOldSchedule(date: string, raw: unknown): DaySchedule {
  const old = raw as { date: string; blocks?: unknown[] }
  if (!Array.isArray(old.blocks) || old.blocks.length === 0) {
    return { date, slots: [], unscheduled: [] }
  }

  const tasks: Task[] = (old.blocks as Array<{ id: string; title?: string; typeId?: string }>).map(b => ({
    id: b.id,
    title: b.title ?? 'Untitled',
    done: false,
    typeId: b.typeId,
  }))

  const slot: TimeSlot = {
    id: generateId(),
    label: 'Migrated',
    color: '#6366F1',
    tasks,
  }

  return { date, slots: [slot], unscheduled: [] }
}

const STORAGE_KEY = 'timeblocking-schedules'
const TYPES_KEY = 'timeblocking-types'

export function loadSchedule(date: string): DaySchedule {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { date, slots: [], unscheduled: [] }
    const all: Record<string, unknown> = JSON.parse(raw)
    const entry = all[date]
    if (!entry) return { date, slots: [], unscheduled: [] }

    // detect old schema (has blocks, no slots)
    const e = entry as Record<string, unknown>
    if ('blocks' in e && !('slots' in e)) {
      const migrated = migrateOldSchedule(date, entry)
      saveSchedule(migrated)
      return migrated
    }

    return entry as DaySchedule
  } catch {
    return { date, slots: [], unscheduled: [] }
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
    if (!raw) return {}
    const all: Record<string, unknown> = JSON.parse(raw)
    const result: Record<string, DaySchedule> = {}
    for (const [date, entry] of Object.entries(all)) {
      const e = entry as Record<string, unknown>
      if ('blocks' in e && !('slots' in e)) {
        result[date] = migrateOldSchedule(date, entry)
      } else {
        result[date] = entry as DaySchedule
      }
    }
    return result
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
