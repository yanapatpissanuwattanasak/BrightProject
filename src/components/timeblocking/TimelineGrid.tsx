import { useRef } from 'react'
import type { Block, DaySchedule } from '@/types/timeblock'
import {
  getTimeLabels,
  minutesToPx,
  pxToMinutes,
  snapToInterval,
  MINUTES_IN_DAY,
} from '@/lib/timeblock'
import { TimelineBlock } from './TimelineBlock'

type Props = {
  schedule: DaySchedule
  snapInterval: number
  onBlockMove: (id: string, start: number, end: number) => void
  onBlockResize: (id: string, edge: 'top' | 'bottom', minute: number) => void
  onBlockClick: (block: Block) => void
  onCreateBlock: (start: number, end: number) => void
}

export function TimelineGrid({
  schedule,
  snapInterval,
  onBlockMove,
  onBlockResize,
  onBlockClick,
  onCreateBlock,
}: Props) {
  const gridRef = useRef<HTMLDivElement>(null)
  const createStart = useRef<number | null>(null)
  const ghostRef = useRef<HTMLDivElement>(null)

  const timeLabels = getTimeLabels()
  const totalHeight = minutesToPx(MINUTES_IN_DAY)

  function getMinuteFromEvent(e: React.MouseEvent | MouseEvent): number {
    if (!gridRef.current) return 0
    const rect = gridRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top + gridRef.current.scrollTop
    return snapToInterval(Math.max(0, Math.min(MINUTES_IN_DAY, pxToMinutes(y))), snapInterval)
  }

  function handleGridMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('[data-block]')) return
    const minute = getMinuteFromEvent(e)
    createStart.current = minute

    if (ghostRef.current) {
      ghostRef.current.style.display = 'block'
      ghostRef.current.style.top = `${minutesToPx(minute)}px`
      ghostRef.current.style.height = `0px`
    }

    function onMouseMove(me: MouseEvent) {
      const current = getMinuteFromEvent(me)
      if (createStart.current === null || !ghostRef.current) return
      const top = Math.min(createStart.current, current)
      const height = Math.abs(current - createStart.current)
      ghostRef.current.style.top = `${minutesToPx(top)}px`
      ghostRef.current.style.height = `${minutesToPx(height)}px`
    }

    function onMouseUp(me: MouseEvent) {
      const end = getMinuteFromEvent(me)
      if (ghostRef.current) ghostRef.current.style.display = 'none'

      if (createStart.current !== null) {
        const start = Math.min(createStart.current, end)
        const finish = Math.max(createStart.current, end)
        if (finish - start >= snapInterval) {
          onCreateBlock(start, finish)
        }
      }
      createStart.current = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // Current time indicator
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return (
    <div
      ref={gridRef}
      className="relative overflow-y-auto flex-1 bg-surface select-none"
      style={{ height: '100%' }}
      onMouseDown={handleGridMouseDown}
    >
      <div className="relative" style={{ height: `${totalHeight}px`, minWidth: 0 }}>

        {/* Hour lines + labels */}
        {timeLabels.map(({ minutes, label }) => (
          <div
            key={minutes}
            className="absolute left-0 right-0 flex items-center pointer-events-none"
            style={{ top: `${minutesToPx(minutes)}px` }}
          >
            <span className="w-14 shrink-0 text-right pr-3 text-[11px] font-mono text-text-muted select-none -translate-y-1/2">
              {label}
            </span>
            <div className="flex-1 border-t border-surface-border" />
          </div>
        ))}

        {/* 30-min sub-lines */}
        {Array.from({ length: 48 }, (_, i) => i * 30).filter(m => m % 60 !== 0).map(m => (
          <div
            key={m}
            className="absolute left-14 right-0 border-t border-surface-border/40 pointer-events-none"
            style={{ top: `${minutesToPx(m)}px` }}
          />
        ))}

        {/* Blocks area */}
        <div className="absolute left-14 right-2 top-0" style={{ height: `${totalHeight}px` }}>

          {/* Ghost block (creating) */}
          <div
            ref={ghostRef}
            className="absolute left-1 right-1 rounded-lg bg-primary/40 border-2 border-primary pointer-events-none hidden"
          />

          {/* Current time line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-error pointer-events-none z-30"
            style={{ top: `${minutesToPx(nowMinutes)}px` }}
          >
            <div className="absolute -left-1 -top-1.5 w-2.5 h-2.5 rounded-full bg-error" />
          </div>

          {/* Blocks */}
          {schedule.blocks.map(block => (
            <div key={block.id} data-block>
              <TimelineBlock
                block={block}
                snapInterval={snapInterval}
                onMove={onBlockMove}
                onResize={onBlockResize}
                onClick={onBlockClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
