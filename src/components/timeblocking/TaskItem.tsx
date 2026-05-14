import type { BlockTypeDef, Task } from '@/types/timeblock'
import { minutesToDuration } from '@/lib/timeblock'

type Props = {
  task: Task
  blockTypes: BlockTypeDef[]
  onToggle: () => void
  onClick: () => void
}

export function TaskItem({ task, blockTypes, onToggle, onClick }: Props) {
  const type = blockTypes.find(t => t.id === task.typeId)

  return (
    <div className="group flex items-start gap-2.5 py-1.5 px-1 rounded-lg hover:bg-surface-border/30 transition-colors">
      <button
        onClick={e => { e.stopPropagation(); onToggle() }}
        aria-label={task.done ? 'Mark undone' : 'Mark done'}
        className={`mt-0.5 w-4 h-4 shrink-0 rounded border transition-colors flex items-center justify-center ${
          task.done
            ? 'bg-primary border-primary'
            : 'border-surface-border hover:border-primary/60'
        }`}
      >
        {task.done && (
          <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white fill-none stroke-current stroke-2">
            <polyline points="1,4 4,7 9,1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <button
        onClick={onClick}
        className="flex-1 min-w-0 text-left"
      >
        <span className={`text-xs leading-relaxed block truncate transition-colors ${
          task.done ? 'line-through text-text-muted' : 'text-text-primary group-hover:text-text-primary'
        }`}>
          {task.title}
        </span>

        {(type || task.estimatedMinutes) && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {type && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: type.color }} />
                <span className="text-[10px] text-text-muted">{type.name}</span>
              </span>
            )}
            {task.estimatedMinutes && (
              <span className="text-[10px] text-text-muted font-mono">
                {minutesToDuration(task.estimatedMinutes)}
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  )
}
