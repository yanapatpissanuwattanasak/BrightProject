import type { BlockTypeDef, Task, TimeSlot } from '@/types/timeblock'
import { AddTaskForm } from './AddTaskForm'
import { TaskItem } from './TaskItem'

type Props = {
  slot: TimeSlot
  blockTypes: BlockTypeDef[]
  fullWidth?: boolean
  onEditSlot: () => void
  onDeleteSlot: () => void
  onToggleCollapse: () => void
  onAddTask: (title: string) => void
  onToggleTask: (taskId: string) => void
  onClickTask: (task: Task) => void
}

export function SlotCard({
  slot, blockTypes, fullWidth,
  onEditSlot, onDeleteSlot, onToggleCollapse,
  onAddTask, onToggleTask, onClickTask,
}: Props) {
  const doneTasks = slot.tasks.filter(t => t.done).length
  const totalTasks = slot.tasks.length

  const timeLabel = slot.startTime
    ? slot.endTime
      ? `${slot.startTime} – ${slot.endTime}`
      : slot.startTime
    : null

  return (
    <div className={`flex flex-col bg-surface rounded-xl border border-surface-border overflow-hidden ${fullWidth ? 'w-full' : 'min-w-[220px] max-w-[280px] w-64 shrink-0'}`}>

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none group"
        style={{ borderBottom: slot.collapsed ? 'none' : '1px solid var(--color-surface-border)' }}
        onClick={onToggleCollapse}
      >
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slot.color }} />

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-primary truncate">{slot.label}</p>
          {timeLabel && (
            <p className="text-[10px] text-text-muted font-mono leading-tight">{timeLabel}</p>
          )}
        </div>

        {totalTasks > 0 && (
          <span className="text-[10px] text-text-muted font-mono shrink-0">
            {doneTasks}/{totalTasks}
          </span>
        )}

        {/* Slot actions (visible on hover) */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onEditSlot}
            title="Edit slot"
            className="p-0.5 text-text-muted hover:text-text-secondary transition-colors rounded"
          >
            <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current">
              <path d="M11.5 2.5a2.12 2.12 0 0 1 3 3L5 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={onDeleteSlot}
            title="Delete slot"
            className="p-0.5 text-text-muted hover:text-red-400 transition-colors rounded"
          >
            <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10H3z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <span className="text-text-muted text-xs shrink-0">{slot.collapsed ? '›' : '‹'}</span>
      </div>

      {/* Task list */}
      {!slot.collapsed && (
        <div className="flex flex-col px-2 py-2 gap-0.5">
          {slot.tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              blockTypes={blockTypes}
              onToggle={() => onToggleTask(task.id)}
              onClick={() => onClickTask(task)}
            />
          ))}

          <div className="mt-1">
            <AddTaskForm onAdd={onAddTask} />
          </div>
        </div>
      )}
    </div>
  )
}
