import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Block } from '@/types/timeblock'
import { BLOCK_TYPE_COLORS } from '@/types/timeblock'
import { useTimeBlocking } from '@/hooks/useTimeBlocking'
import { TimelineGrid } from '@/components/timeblocking/TimelineGrid'
import { TimeblockSidebar } from '@/components/timeblocking/TimeblockSidebar'
import { BlockModal } from '@/components/timeblocking/BlockModal'
import { generateId } from '@/lib/timeblock'
import { ROUTES } from '@/constants/routes'

const SNAP_INTERVAL = 15

export function TimeBlockingPage() {
  const navigate = useNavigate()
  const {
    date, schedule, summary,
    setDate, addBlock, updateBlock, deleteBlock,
    moveBlock, resizeBlock, copyYesterday, clearDay,
  } = useTimeBlocking()

  const [modalBlock, setModalBlock] = useState<Partial<Block> | null>(null)

  function handleCreateBlock(start: number, end: number) {
    setModalBlock({ start, end })
  }

  function handleBlockClick(block: Block) {
    setModalBlock(block)
  }

  function handleSave(block: Block) {
    if (schedule.blocks.find(b => b.id === block.id)) {
      updateBlock(block)
    } else {
      addBlock({ ...block, id: block.id ?? generateId(), color: BLOCK_TYPE_COLORS[block.type] })
    }
  }

  return (
    <div className="flex h-screen bg-surface text-text-primary overflow-hidden">

      {/* Sidebar */}
      <TimeblockSidebar
        date={date}
        summary={summary}
        onDateChange={setDate}
        onCopyYesterday={copyYesterday}
        onClearDay={clearDay}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-surface-border shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="text-text-muted hover:text-text-primary transition-colors text-xs flex items-center gap-1"
              aria-label="Back to home"
            >
              ← Back
            </button>
            <h1 className="text-sm font-semibold text-text-primary">Time Blocking</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted font-mono">
              ← → navigate days · drag to create
            </span>
            <button
              onClick={() => setModalBlock({ start: 540, end: 600 })}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
            >
              + Block
            </button>
          </div>
        </header>

        {/* Timeline */}
        <TimelineGrid
          schedule={schedule}
          snapInterval={SNAP_INTERVAL}
          onBlockMove={moveBlock}
          onBlockResize={resizeBlock}
          onBlockClick={handleBlockClick}
          onCreateBlock={handleCreateBlock}
        />
      </div>

      {/* Modal */}
      <BlockModal
        block={modalBlock}
        onSave={handleSave}
        onDelete={deleteBlock}
        onClose={() => setModalBlock(null)}
      />
    </div>
  )
}
