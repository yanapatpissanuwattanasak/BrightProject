import { useEffect, useRef, useState } from 'react'
import type { BlockTypeDef, Task } from '@/types/timeblock'

type Props = {
  task: Task | null
  blockTypes: BlockTypeDef[]
  onSave: (patch: Partial<Omit<Task, 'id'>>) => void
  onDelete: () => void
  onClose: () => void
}

export function TaskModal({ task, blockTypes, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [typeId, setTypeId] = useState<string>('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [note, setNote] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setTypeId(task.typeId ?? '')
      setEstimatedMinutes(task.estimatedMinutes ? String(task.estimatedMinutes) : '')
      setNote(task.note ?? '')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [task])

  if (!task) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      typeId: typeId || undefined,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
      note: note.trim() || undefined,
    })
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  const DURATION_PRESETS = [15, 30, 45, 60, 90, 120]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-surface-raised border border-surface-border rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5"
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-sm font-semibold text-text-primary mb-4">Edit Task</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="text-xs text-text-muted block mb-1">Task</label>
            <input
              ref={inputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Type */}
          {blockTypes.length > 0 && (
            <div>
              <label className="text-xs text-text-muted block mb-1">Type</label>
              <select
                value={typeId}
                onChange={e => setTypeId(e.target.value)}
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary transition-colors"
              >
                <option value="">None</option>
                {blockTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Estimated time */}
          <div>
            <label className="text-xs text-text-muted block mb-1">Estimate (minutes)</label>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {DURATION_PRESETS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setEstimatedMinutes(String(p))}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    estimatedMinutes === String(p)
                      ? 'bg-primary border-primary text-white'
                      : 'border-surface-border text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {p >= 60 ? `${p / 60}h` : `${p}m`}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={estimatedMinutes}
              onChange={e => setEstimatedMinutes(e.target.value)}
              placeholder="Custom minutes"
              min={1}
              max={480}
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-xs text-text-muted block mb-1">Note</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="Optional note..."
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => { onDelete(); onClose() }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Delete task
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
