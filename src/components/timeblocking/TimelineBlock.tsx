import { useRef, useState } from 'react'
import type { Block } from '@/types/timeblock'
import { minutesToPx, minutesToTime, minutesToDuration } from '@/lib/timeblock'

type Props = {
  block: Block
  onMove: (id: string, newStart: number, newEnd: number) => void
  onResize: (id: string, edge: 'top' | 'bottom', newMinute: number) => void
  onClick: (block: Block) => void
  snapInterval: number
}

export function TimelineBlock({ block, onMove, onResize, onClick, snapInterval }: Props) {
  const top = minutesToPx(block.start)
  const height = minutesToPx(block.end - block.start)
  const duration = block.end - block.start

  const dragStartY = useRef<number>(0)
  const dragStartMinute = useRef<number>(0)
  const isDragging = useRef(false)
  const [active, setActive] = useState(false)

  function handleBlockMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).dataset.resize) return
    e.stopPropagation()
    isDragging.current = false
    dragStartY.current = e.clientY
    dragStartMinute.current = block.start
    setActive(true)

    function onMouseMove(me: MouseEvent) {
      const delta = (me.clientY - dragStartY.current) / 1.5
      const snapped = Math.round(delta / snapInterval) * snapInterval
      const newStart = Math.max(0, Math.min(1440 - duration, dragStartMinute.current + snapped))
      if (Math.abs(delta) > 4) isDragging.current = true
      onMove(block.id, newStart, newStart + duration)
    }

    function onMouseUp() {
      setActive(false)
      if (!isDragging.current) onClick(block)
      isDragging.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function handleResizeMouseDown(e: React.MouseEvent, edge: 'top' | 'bottom') {
    e.stopPropagation()
    const startY = e.clientY
    const startMinute = edge === 'top' ? block.start : block.end

    function onMouseMove(me: MouseEvent) {
      const delta = (me.clientY - startY) / 1.5
      const raw = startMinute + delta
      const snapped = Math.round(raw / snapInterval) * snapInterval
      onResize(block.id, edge, snapped)
    }

    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      onMouseDown={handleBlockMouseDown}
      className={`absolute left-1 right-1 rounded-lg cursor-grab select-none transition-shadow
        ${active ? 'shadow-lg ring-2 ring-white/30 cursor-grabbing z-20' : 'z-10 hover:shadow-md hover:brightness-110'}`}
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 20)}px`,
        backgroundColor: block.color,
        opacity: 0.92,
      }}
    >
      {/* Top resize handle */}
      <div
        data-resize="top"
        onMouseDown={e => handleResizeMouseDown(e, 'top')}
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize rounded-t-lg hover:bg-white/20"
      />

      {/* Content */}
      <div className="px-2 py-1 h-full flex flex-col justify-between overflow-hidden pointer-events-none">
        <p className="text-white text-xs font-semibold truncate leading-tight">{block.title}</p>
        {height > 36 && (
          <p className="text-white/70 text-[10px] font-mono">
            {minutesToTime(block.start)} – {minutesToTime(block.end)}
            {height > 52 && <span className="ml-1">({minutesToDuration(duration)})</span>}
          </p>
        )}
      </div>

      {/* Bottom resize handle */}
      <div
        data-resize="bottom"
        onMouseDown={e => handleResizeMouseDown(e, 'bottom')}
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize rounded-b-lg hover:bg-white/20"
      />
    </div>
  )
}
