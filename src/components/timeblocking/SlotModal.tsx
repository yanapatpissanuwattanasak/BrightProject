import { useEffect, useRef, useState } from 'react'
import type { TimeSlot } from '@/types/timeblock'

const SLOT_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#22C55E', '#06B6D4',
  '#3B82F6', '#475569',
]

type Props = {
  slot: Partial<TimeSlot> | null
  onSave: (data: Omit<TimeSlot, 'id' | 'tasks'>) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

export function SlotModal({ slot, onSave, onDelete, onClose }: Props) {
  const [label, setLabel] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [color, setColor] = useState(SLOT_COLORS[0])
  const inputRef = useRef<HTMLInputElement>(null)

  const isEdit = Boolean(slot?.id)

  useEffect(() => {
    if (slot) {
      setLabel(slot.label ?? '')
      setStartTime(slot.startTime ?? '')
      setEndTime(slot.endTime ?? '')
      setColor(slot.color ?? SLOT_COLORS[0])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [slot])

  if (!slot) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    onSave({ label: label.trim(), startTime: startTime || undefined, endTime: endTime || undefined, color })
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-surface-raised border border-surface-border rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5"
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-sm font-semibold text-text-primary mb-4">
          {isEdit ? 'Edit Slot' : 'New Slot'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Label */}
          <div>
            <label className="text-xs text-text-muted block mb-1">Label</label>
            <input
              ref={inputRef}
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Morning, Deep Work"
              maxLength={40}
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Time range (optional) */}
          <div>
            <label className="text-xs text-text-muted block mb-1">Time (optional)</label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="flex-1 bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary transition-colors"
              />
              <span className="text-xs text-text-muted shrink-0">to</span>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="flex-1 bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-text-muted block mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {SLOT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px #0f172a, 0 0 0 4px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            {isEdit && onDelete ? (
              <button
                type="button"
                onClick={() => { onDelete(slot!.id!); onClose() }}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Delete slot
              </button>
            ) : <span />}

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
                disabled={!label.trim()}
                className="px-4 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isEdit ? 'Save' : 'Add Slot'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
