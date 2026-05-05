import { useRef } from 'react'
import type { Block, BlockTypeDef, DaySchedule } from '@/types/timeblock'
import { minutesToTime, assignLanes, maxLanes } from '@/lib/timeblock'

const HOUR_WIDTH = 80       // px per hour
const MIN_LANE_HEIGHT = 48  // px per lane
const HEADER_HEIGHT = 32

type Props = {
  schedule: DaySchedule
  blockTypes: BlockTypeDef[]
  onBlockClick: (block: Block) => void
  onCellClick: (startMinute: number) => void
}

export function HorizontalGrid({ schedule, blockTypes, onBlockClick, onCellClick }: Props) {
  const gridRef = useRef<HTMLDivElement>(null)
  const typeMap = new Map(blockTypes.map(t => [t.id, t]))

  const lanes = assignLanes(schedule.blocks)
  const laneCount = Math.max(1, maxLanes(schedule.blocks))
  const rowHeight = Math.max(MIN_LANE_HEIGHT * 2, laneCount * MIN_LANE_HEIGHT)
  const totalWidth = HOUR_WIDTH * 24

  function handleCellClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('[data-block]')) return
    if (!gridRef.current) return
    const rect = gridRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left + gridRef.current.scrollLeft
    const rawMinutes = (x / totalWidth) * 1440
    const hour = Math.floor(rawMinutes / 60)
    onCellClick(Math.min(23 * 60, Math.max(0, hour * 60)))
  }

  // Current time indicator
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const nowX = (nowMinutes / 1440) * totalWidth

  return (
    <div
      ref={gridRef}
      className="overflow-x-auto overflow-y-hidden flex-1 bg-surface select-none"
      style={{ height: `${HEADER_HEIGHT + rowHeight + 16}px` }}
    >
      <div className="relative" style={{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}>

        {/* Hour headers */}
        <div
          className="flex sticky top-0 z-10 bg-surface border-b border-surface-border"
          style={{ height: `${HEADER_HEIGHT}px` }}
        >
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="shrink-0 flex items-center justify-start pl-2 text-[11px] font-mono text-text-muted border-r border-surface-border/50"
              style={{ width: `${HOUR_WIDTH}px` }}
            >
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Blocks row */}
        <div
          className="relative cursor-cell"
          style={{ height: `${rowHeight}px`, width: `${totalWidth}px` }}
          onClick={handleCellClick}
        >
          {/* Hour grid lines */}
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 border-r border-surface-border/40 pointer-events-none"
              style={{ left: `${h * HOUR_WIDTH}px` }}
            />
          ))}

          {/* 30-min sub-lines */}
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 border-r border-surface-border/20 pointer-events-none"
              style={{ left: `${h * HOUR_WIDTH + HOUR_WIDTH / 2}px` }}
            />
          ))}

          {/* Current time indicator */}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-400/80 pointer-events-none z-20"
            style={{ left: `${nowX}px` }}
          >
            <div className="w-2 h-2 rounded-full bg-red-400 -ml-[3px] mt-1" />
          </div>

          {/* Blocks */}
          {schedule.blocks.map(block => {
            const lane = lanes.get(block.id) ?? 0
            const laneHeight = rowHeight / laneCount
            const left = (block.start / 1440) * totalWidth
            const width = Math.max(4, ((block.end - block.start) / 1440) * totalWidth)
            const top = lane * laneHeight + 4
            const height = laneHeight - 8
            const typeDef = typeMap.get(block.typeId)

            return (
              <div
                key={block.id}
                data-block
                onClick={e => { e.stopPropagation(); onBlockClick(block) }}
                className="absolute rounded-md cursor-pointer hover:brightness-110 active:brightness-90 transition-all overflow-hidden"
                style={{
                  left: `${left}px`,
                  width: `${width}px`,
                  top: `${top}px`,
                  height: `${height}px`,
                  backgroundColor: typeDef?.color ?? block.color,
                  minWidth: '4px',
                }}
                title={`${block.title} (${minutesToTime(block.start)}–${minutesToTime(block.end)})`}
              >
                {width > 36 && (
                  <div className="px-1.5 py-0.5 flex flex-col justify-center h-full">
                    <p className="text-white text-[11px] font-medium truncate leading-tight">{block.title}</p>
                    {height > 24 && (
                      <p className="text-white/70 text-[10px] font-mono truncate">
                        {minutesToTime(block.start)}–{minutesToTime(block.end)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Empty state hint */}
          {schedule.blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-xs text-text-muted">Click any time slot to add a block</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
