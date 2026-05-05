import { useEffect, useRef, useState } from 'react'
import type { Block, BlockTypeDef } from '@/types/timeblock'
import { minutesToTime, timeToMinutes, generateId, snapToInterval } from '@/lib/timeblock'

type Props = {
  block: Partial<Block> | null
  blockTypes: BlockTypeDef[]
  onSave: (block: Block) => void
  onDelete?: (id: string) => void
  onClose: () => void
  onAddType?: (name: string, color: string) => BlockTypeDef
}

const PRESET_COLORS = [
  '#6366F1', '#F59E0B', '#22C55E', '#EC4899', '#475569',
  '#3B82F6', '#EF4444', '#8B5CF6', '#F97316', '#14B8A6',
]

export function BlockModal({ block, blockTypes, onSave, onDelete, onClose, onAddType }: Props) {
  const [title, setTitle] = useState('')
  const [typeId, setTypeId] = useState<string>('')
  const [note, setNote] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  // Quick add type
  const [showAddType, setShowAddType] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [newTypeColor, setNewTypeColor] = useState(PRESET_COLORS[0])

  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!block) return
    setTitle(block.title ?? '')
    setTypeId(block.typeId ?? blockTypes[0]?.id ?? '')
    setNote(block.note ?? '')
    setStartTime(minutesToTime(block.start ?? 540))
    setEndTime(minutesToTime(block.end ?? 600))
    setShowAddType(false)
    setNewTypeName('')
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [block, blockTypes])

  if (!block) return null

  const isEdit = Boolean(block.id)
  const timeError = timeToMinutes(endTime) <= timeToMinutes(startTime)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!block) return
    const trimmed = title.trim()
    if (!trimmed) return
    const selectedType = blockTypes.find(t => t.id === typeId) ?? blockTypes[0]
    if (!selectedType) return
    const start = snapToInterval(timeToMinutes(startTime))
    const end = snapToInterval(timeToMinutes(endTime))
    if (end <= start) return

    onSave({
      id: block.id ?? generateId(),
      title: trimmed,
      start,
      end,
      typeId: selectedType.id,
      color: selectedType.color,
      note: note.trim() || undefined,
    })
    onClose()
  }

  function handleQuickAddType() {
    if (!newTypeName.trim() || !onAddType) return
    const newType = onAddType(newTypeName.trim(), newTypeColor)
    setTypeId(newType.id)
    setNewTypeName('')
    setNewTypeColor(PRESET_COLORS[0])
    setShowAddType(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface-raised border border-surface-border rounded-xl p-5 w-96 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">
            {isEdit ? 'Edit Block' : 'New Block'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Block title"
            className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
            maxLength={80}
          />

          {/* Time range */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-[10px] text-text-muted uppercase tracking-wide mb-1 block">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary transition-colors font-mono"
              />
            </div>
            <span className="text-text-muted pb-2.5 shrink-0">→</span>
            <div className="flex-1">
              <label className="text-[10px] text-text-muted uppercase tracking-wide mb-1 block">End</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className={`w-full bg-surface border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary transition-colors font-mono
                  ${timeError ? 'border-red-400/60' : 'border-surface-border'}`}
              />
            </div>
          </div>
          {timeError && (
            <p className="text-[11px] text-red-400 -mt-1">End time must be after start time</p>
          )}

          {/* Type selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-text-muted uppercase tracking-wide">Type</label>
              {onAddType && (
                <button
                  type="button"
                  onClick={() => setShowAddType(v => !v)}
                  className="text-[10px] text-primary hover:underline"
                >
                  + New type
                </button>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {blockTypes.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTypeId(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border
                    ${typeId === t.id ? 'text-white border-transparent' : 'text-text-muted border-surface-border hover:border-primary/50'}`}
                  style={typeId === t.id ? { backgroundColor: t.color } : {}}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* Quick add type inline */}
            {showAddType && (
              <div className="mt-2 p-3 bg-surface rounded-lg border border-surface-border flex flex-col gap-2">
                <input
                  value={newTypeName}
                  onChange={e => setNewTypeName(e.target.value)}
                  placeholder="Type name"
                  className="w-full bg-surface-raised border border-surface-border rounded px-2 py-1.5 text-xs text-text-primary outline-none focus:border-primary"
                  maxLength={30}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleQuickAddType() } }}
                  autoFocus
                />
                <div className="flex gap-1.5 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTypeColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${newTypeColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleQuickAddType}
                  disabled={!newTypeName.trim()}
                  className="text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded px-3 py-1.5 transition-colors disabled:opacity-40"
                >
                  Add type
                </button>
              </div>
            )}
          </div>

          {/* Note */}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-xs text-text-secondary placeholder:text-text-muted outline-none focus:border-primary transition-colors resize-none"
          />

          {/* Actions */}
          <div className="flex gap-2 mt-1">
            {isEdit && onDelete && block.id && (
              <button
                type="button"
                onClick={() => { onDelete(block.id!); onClose() }}
                className="px-3 py-1.5 text-xs text-red-400/70 hover:text-red-400 border border-surface-border hover:border-red-400/50 rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto px-3 py-1.5 text-xs text-text-muted border border-surface-border rounded-lg hover:border-primary/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || timeError || blockTypes.length === 0}
              className="px-4 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-40"
            >
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
