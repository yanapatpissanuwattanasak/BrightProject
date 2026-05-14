export type BlockTypeDef = {
  id: string
  name: string
  color: string
}

export type Task = {
  id: string
  title: string
  done: boolean
  typeId?: string
  estimatedMinutes?: number
  note?: string
}

export type TimeSlot = {
  id: string
  label: string
  startTime?: string   // HH:MM — optional
  endTime?: string     // HH:MM — optional
  color: string
  tasks: Task[]
  collapsed?: boolean
}

export type DaySchedule = {
  date: string
  slots: TimeSlot[]
  unscheduled: Task[]
}

export type DaySummary = {
  totalTasks: number
  doneTasks: number
  estimatedMinutesByType: Record<string, number>
  estimatedMinutesTotal: number
}

export const DEFAULT_BLOCK_TYPES: BlockTypeDef[] = [
  { id: 'work',  name: 'Work',  color: '#6366F1' },
  { id: 'study', name: 'Study', color: '#22C55E' },
  { id: 'life',  name: 'Life',  color: '#EC4899' },
  { id: 'rest',  name: 'Rest',  color: '#475569' },
  { id: 'trade', name: 'Trade', color: '#F59E0B' },
]
