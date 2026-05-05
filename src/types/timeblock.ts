export type BlockType = 'work' | 'life' | 'trade' | 'study' | 'rest'

export type Block = {
  id: string
  title: string
  start: number   // minutes from midnight (0–1439)
  end: number     // minutes from midnight (1–1440)
  type: BlockType
  color: string
  note?: string
}

export type DaySchedule = {
  date: string    // YYYY-MM-DD
  blocks: Block[]
}

export type Summary = {
  totalHoursByType: Record<BlockType, number>
  freeTime: number          // hours
  utilizationRate: number   // 0–100
}

export type DragState =
  | { kind: 'idle' }
  | { kind: 'creating'; startMinute: number; currentMinute: number }
  | { kind: 'moving';   blockId: string; offsetMinutes: number; currentStart: number }
  | { kind: 'resizing'; blockId: string; edge: 'top' | 'bottom'; currentMinute: number }

export const BLOCK_TYPE_COLORS: Record<BlockType, string> = {
  work:  '#6366F1',
  trade: '#F59E0B',
  study: '#22C55E',
  life:  '#EC4899',
  rest:  '#475569',
}

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  work:  'Work',
  trade: 'Trade',
  study: 'Study',
  life:  'Life',
  rest:  'Rest',
}
