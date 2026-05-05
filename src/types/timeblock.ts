export type BlockTypeDef = {
  id: string
  name: string
  color: string
}

export type Block = {
  id: string
  title: string
  start: number   // minutes from midnight (0–1439)
  end: number     // minutes from midnight (1–1440)
  typeId: string  // references BlockTypeDef.id
  color: string
  note?: string
}

export type DaySchedule = {
  date: string    // YYYY-MM-DD
  blocks: Block[]
}

export type Summary = {
  totalHoursByType: Record<string, number>
  freeTime: number          // hours
  utilizationRate: number   // 0–100
}

export const DEFAULT_BLOCK_TYPES: BlockTypeDef[] = [
  { id: 'work',  name: 'Work',  color: '#6366F1' },
  { id: 'study', name: 'Study', color: '#22C55E' },
  { id: 'life',  name: 'Life',  color: '#EC4899' },
  { id: 'rest',  name: 'Rest',  color: '#475569' },
  { id: 'trade', name: 'Trade', color: '#F59E0B' },
]
