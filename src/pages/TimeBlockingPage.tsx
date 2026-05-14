import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Task, TimeSlot } from '@/types/timeblock'
import { useTimeBlocking } from '@/hooks/useTimeBlocking'
import { DayBoard } from '@/components/timeblocking/DayBoard'
import { TimeblockSidebar } from '@/components/timeblocking/TimeblockSidebar'
import { SlotModal } from '@/components/timeblocking/SlotModal'
import { TaskModal } from '@/components/timeblocking/TaskModal'
import { BlockTypeManager } from '@/components/timeblocking/BlockTypeManager'
import { Dashboard } from '@/components/timeblocking/Dashboard'
import { ROUTES } from '@/constants/routes'

type Tab = 'day' | 'dashboard' | 'types'

export function TimeBlockingPage() {
  const navigate = useNavigate()
  const {
    date, schedule, summary, blockTypes,
    setDate,
    addSlot, updateSlot, deleteSlot, toggleSlotCollapsed,
    addTask, addUnscheduledTask, updateTask, deleteTask, toggleTask,
    clearDay,
    addBlockType, updateBlockType, deleteBlockType,
  } = useTimeBlocking()

  const [tab, setTab] = useState<Tab>('day')
  const [slotModal, setSlotModal] = useState<Partial<TimeSlot> | null>(null)
  const [taskModal, setTaskModal] = useState<Task | null>(null)

  function handleSaveSlot(data: Omit<TimeSlot, 'id' | 'tasks'>) {
    if (slotModal?.id) {
      updateSlot(slotModal.id, data)
    } else {
      addSlot(data)
    }
  }

  function handleDeleteSlot(slotId: string) {
    deleteSlot(slotId)
  }

  function handleClickTask(task: Task) {
    setTaskModal(task)
  }

  function handleSaveTask(patch: Partial<Omit<Task, 'id'>>) {
    if (taskModal) updateTask(taskModal.id, patch)
  }

  function handleDeleteTask() {
    if (taskModal) deleteTask(taskModal.id)
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'day', label: 'Day' },
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
            {tab === 'day' && (
              <>
                <span className="text-xs text-text-muted font-mono hidden sm:block">
                  ← → navigate days
                </span>
                <button
                  onClick={() => setSlotModal({})}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                >
                  + Add Slot
                </button>
              </>
            )}
          </div>
        </header>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-hidden relative">

          {tab === 'day' && (
            <DayBoard
              schedule={schedule}
              blockTypes={blockTypes}
              onEditSlot={slot => setSlotModal(slot)}
              onDeleteSlot={handleDeleteSlot}
              onToggleCollapse={toggleSlotCollapsed}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onClickTask={handleClickTask}
              onAddUnscheduled={addUnscheduledTask}
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

      {/* Modals */}
      <SlotModal
        slot={slotModal}
        onSave={handleSaveSlot}
        onDelete={handleDeleteSlot}
        onClose={() => setSlotModal(null)}
      />

      <TaskModal
        task={taskModal}
        blockTypes={blockTypes}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onClose={() => setTaskModal(null)}
      />
    </div>
  )
}
