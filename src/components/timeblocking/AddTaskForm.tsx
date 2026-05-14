import { useRef, useState } from 'react'

type Props = {
  onAdd: (title: string) => void
  placeholder?: string
}

export function AddTaskForm({ onAdd, placeholder = 'Add task…' }: Props) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function open_() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  function submit() {
    const t = value.trim()
    if (t) { onAdd(t); setValue('') }
    else close_()
  }

  function close_() {
    setOpen(false)
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); submit() }
    if (e.key === 'Escape') close_()
  }

  if (!open) {
    return (
      <button
        onClick={open_}
        className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-secondary transition-colors w-full py-1 px-1 rounded-md hover:bg-surface-border/20"
      >
        <span className="text-base leading-none">+</span>
        <span>{placeholder}</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 px-1">
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (!value.trim()) close_() }}
        placeholder={placeholder}
        maxLength={100}
        className="flex-1 bg-surface border border-primary rounded-md px-2 py-1 text-xs text-text-primary placeholder:text-text-muted outline-none"
      />
      <button
        onMouseDown={e => { e.preventDefault(); submit() }}
        className="text-xs text-primary hover:text-primary-hover font-medium transition-colors shrink-0"
      >
        Add
      </button>
    </div>
  )
}
