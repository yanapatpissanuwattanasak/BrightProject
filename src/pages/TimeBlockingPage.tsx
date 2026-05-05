import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Block } from '@/types/timeblock'
import { useTimeBlocking } from '@/hooks/useTimeBlocking'
import { HorizontalGrid } from '@/components/timeblocking/HorizontalGrid'
import { TimeblockSidebar } from '@/components/timeblocking/TimeblockSidebar'
import { BlockModal } from '@/components/timeblocking/BlockModal'
import { BlockTypeManager } from '@/components/timeblocking/BlockTypeManager'
import { Dashboard } from '@/components/timeblocking/Dashboard'
import { generateId } from '@/lib/timeblock'
import { ROUTES } from '@/constants/routes'

type Tab = 'calendar' | 'dashboard' | 'types'

export function TimeBlockingPage() {
  const navigate = useNavigate()
  const {
    date, schedule, summary, blockTypes,
    setDate, addBlock, updateBlock, deleteBlock, clearDay,
    addBlockType, updateBlockType, deleteBlockType,
  } = useTimeBlocking()

  const [tab, setTab] = useState<Tab>('calendar')
  const [modalBlock, setModalBlock] = useState<Partial<Block> | null>(null)

  function handleCellClick(startMinute: number) {
    setModalBlock({ start: startMinute, end: Math.min(1440, startMinute + 60) })
  }

  function handleBlockClick(block: Block) {
    setModalBlock(block)
  }

  function handleSave(block: Block) {
    if (schedule.blocks.find(b => b.id === block.id)) {
      updateBlock(block)
    } else {
      addBlock({ ...block, id: block.id ?? generateId() })
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'calendar', label: 'Calendar' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'types', label: 'Types' },
  ]

  return (
    <div className="flex h-screen bg-surface text-text-primary overflow-hidden">

      {/* Sidebar */}
      <TimeblockSidebar
        date={date}
        summary={summary}
        blockTypes={blockTypes}
        onDateChange={setDate}
        onClearDay={clearDay}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-surface-border shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="text-text-muted hover:text-text-primary transition-colors text-xs flex items-center gap-1"
              aria-label="Back to home"
            >
              ← Back
            </button>
            <h1 className="text-sm font-semibold text-text-primary">Time Blocking</h1>

            {/* Tabs */}
            <div className="flex gap-1 p-0.5 bg-surface rounded-lg border border-surface-border">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors
                    ${tab === t.id ? 'bg-primary text-white' : 'text-text-muted hover:text-text-secondary'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {tab === 'calendar' && (
              <>
                <span className="text-xs text-text-muted font-mono hidden sm:block">
                  ← → navigate days
                </span>
                <button
                  onClick={() => handleCellClick(540)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                >
                  + Block
                </button>
              </>
            )}
          </div>
        </header>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-hidden">

          {tab === 'calendar' && (
            <HorizontalGrid
              schedule={schedule}
              blockTypes={blockTypes}
              onBlockClick={handleBlockClick}
              onCellClick={handleCellClick}
            />
          )}

          {tab === 'dashboard' && (
            <Dashboard date={date} blockTypes={blockTypes} />
          )}

          {tab === 'types' && (
            <div className="h-full overflow-y-auto p-5 max-w-sm">
              <BlockTypeManager
                blockTypes={blockTypes}
                onAdd={addBlockType}
                onUpdate={updateBlockType}
                onDelete={deleteBlockType}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <BlockModal
        block={modalBlock}
        blockTypes={blockTypes}
        onSave={handleSave}
        onDelete={deleteBlock}
        onClose={() => setModalBlock(null)}
        onAddType={addBlockType}
      />
    </div>
  )
}

