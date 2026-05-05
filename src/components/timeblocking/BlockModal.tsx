import { useEffect, useRef, useState } from 'react'
import type { Block, BlockType } from '@/types/timeblock'
import { BLOCK_TYPE_COLORS, BLOCK_TYPE_LABELS } from '@/types/timeblock'
import { minutesToTime, generateId } from '@/lib/timeblock'

type Props = {
  block: Partial<Block> | null   // null = closed, partial = new, full = edit
  onSave: (block: Block) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

const TYPES = Object.entries(BLOCK_TYPE_LABELS) as [BlockType, string][]

export function BlockModal({ block, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<BlockType>('work')
  const [note, setNote] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!block) return
    setTitle(block.title ?? '')
    setType(block.type ?? 'work')
    setNote(block.note ?? '')
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [block])

  if (!block) return null

  const isEdit = Boolean(block.id)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!block || block.start == null || block.end == null) return
    const trimmed = title.trim()
    if (!trimmed) return

    onSave({
      id: block.id ?? generateId(),
      title: trimmed,
      start: block.start,
      end: block.end,
      type,
      color: BLOCK_TYPE_COLORS[type],
      note: note.trim() || undefined,
    })
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-surface-raised border border-surface-border rounded-xl p-5 w-80 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">
            {isEdit ? 'Edit Block' : 'New Block'}
          </h2>
          {block.start != null && block.end != null && (
            <span className="text-[11px] font-mono text-text-muted">
              {minutesToTime(block.start)} – {minutesToTime(block.end)}
            </span>
          )}
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

          {/* Type selector */}
          <div className="flex gap-1.5 flex-wrap">
            {TYPES.map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border
                  ${type === t ? 'text-white border-transparent' : 'text-text-muted border-surface-border hover:border-primary/50'}`}
                style={type === t ? { backgroundColor: BLOCK_TYPE_COLORS[t] } : {}}
              >
                {label}
              </button>
            ))}
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
                className="px-3 py-1.5 text-xs text-error/70 hover:text-error border border-surface-border hover:border-error rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto px-3 py-1.5 text-xs text-text-muted hover:text-text-primary border border-surface-border rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-40"
            >
              {isEdit ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
