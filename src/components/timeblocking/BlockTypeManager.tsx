import { useState } from 'react'
import type { BlockTypeDef } from '@/types/timeblock'

const PRESET_COLORS = [
  '#6366F1', '#F59E0B', '#22C55E', '#EC4899', '#475569',
  '#3B82F6', '#EF4444', '#8B5CF6', '#F97316', '#14B8A6',
  '#06B6D4', '#84CC16', '#A855F7', '#F43F5E', '#64748B',
]

type Props = {
  blockTypes: BlockTypeDef[]
  onAdd: (name: string, color: string) => BlockTypeDef
  onUpdate: (type: BlockTypeDef) => void
  onDelete: (id: string) => void
}

export function BlockTypeManager({ blockTypes, onAdd, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])

  function startEdit(type: BlockTypeDef) {
    setEditingId(type.id)
    setEditName(type.name)
    setEditColor(type.color)
  }

  function saveEdit(id: string) {
    if (!editName.trim()) return
    onUpdate({ id, name: editName.trim(), color: editColor })
    setEditingId(null)
  }

  function handleAdd() {
    if (!newName.trim()) return
    onAdd(newName.trim(), newColor)
    setNewName('')
    setNewColor(PRESET_COLORS[0])
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-text-primary uppercase tracking-widest">Block Types</h3>

      {/* Existing types */}
      <div className="flex flex-col gap-2">
        {blockTypes.map(type => (
          <div
            key={type.id}
            className="p-2 rounded-lg bg-surface border border-surface-border"
          >
            {editingId === type.id ? (
              <div className="flex flex-col gap-2">
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-surface-raised border border-surface-border rounded px-2 py-1 text-xs text-text-primary outline-none focus:border-primary"
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit(type.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  autoFocus
                />
                <div className="flex gap-1 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditColor(c)}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${editColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(type.id)}
                    className="text-xs text-white bg-primary hover:bg-primary-hover px-3 py-1 rounded transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
                <span className="flex-1 text-xs text-text-secondary">{type.name}</span>
                <button
                  onClick={() => startEdit(type)}
                  className="text-[11px] text-text-muted hover:text-primary transition-colors px-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(type.id)}
                  className="text-[11px] text-text-muted hover:text-red-400 transition-colors px-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new type */}
      <div className="p-3 rounded-lg bg-surface border border-surface-border flex flex-col gap-2">
        <p className="text-[10px] text-text-muted uppercase tracking-wide">Add Type</p>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Type name"
          className="w-full bg-surface-raised border border-surface-border rounded px-2 py-1.5 text-xs text-text-primary outline-none focus:border-primary"
          maxLength={30}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
        />
        <div className="flex gap-1.5 flex-wrap">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setNewColor(c)}
              className={`w-5 h-5 rounded-full border-2 transition-all ${newColor === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded px-3 py-1.5 transition-colors disabled:opacity-40"
        >
          + Add
        </button>
      </div>
    </div>
  )
}
