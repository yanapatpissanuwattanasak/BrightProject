import type { BlockTypeDef, Summary } from '@/types/timeblock'

type Props = {
  date: string
  summary: Summary
  blockTypes: BlockTypeDef[]
  onDateChange: (date: string) => void
  onClearDay: () => void
}

export function TimeblockSidebar({ date, summary, blockTypes, onDateChange, onClearDay }: Props) {
  const typeMap = new Map(blockTypes.map(t => [t.id, t]))

  function changeDate(delta: number) {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    onDateChange(`${y}-${m}-${day}`)
  }

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })

  const totalHours = Object.values(summary.totalHoursByType).reduce((a, b) => a + b, 0)

  return (
    <aside className="w-52 shrink-0 flex flex-col gap-4 bg-surface-raised border-r border-surface-border p-4 h-full overflow-y-auto">

      {/* Date nav */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => changeDate(-1)}
            className="p-1 rounded hover:bg-surface-border text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Previous day"
          >
            ‹
          </button>
          <input
            type="date"
            value={date}
            onChange={e => onDateChange(e.target.value)}
            className="text-[11px] text-text-secondary bg-transparent border-none outline-none text-center cursor-pointer"
          />
          <button
            onClick={() => changeDate(1)}
            className="p-1 rounded hover:bg-surface-border text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Next day"
          >
            ›
          </button>
        </div>
        <p className="text-xs text-text-secondary text-center truncate">{displayDate}</p>
      </div>

      {/* Utilization */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-muted">Utilization</span>
          <span className="text-sm font-semibold text-text-primary font-mono">
            {summary.utilizationRate}%
          </span>
        </div>
        <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${summary.utilizationRate}%`,
              backgroundColor: summary.utilizationRate > 80 ? '#22C55E' : summary.utilizationRate > 50 ? '#F59E0B' : '#6366F1',
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-muted">Planned</span>
        <span className="text-xs font-mono text-text-secondary">{totalHours.toFixed(1)}h</span>
      </div>
      <div className="flex justify-between items-center -mt-3">
        <span className="text-xs text-text-muted">Free</span>
        <span className="text-xs font-mono text-text-secondary">{summary.freeTime.toFixed(1)}h</span>
      </div>

      {/* Per-type breakdown */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Breakdown</p>
        <div className="flex flex-col gap-1.5">
          {Object.entries(summary.totalHoursByType).map(([typeId, hours]) => {
            if (hours === 0) return null
            const type = typeMap.get(typeId)
            if (!type) return null
            return (
              <div key={typeId} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
                <span className="text-xs text-text-secondary flex-1 truncate">{type.name}</span>
                <span className="text-xs font-mono text-text-primary">{hours.toFixed(1)}h</span>
              </div>
            )
          })}
          {Object.values(summary.totalHoursByType).every(h => h === 0) && (
            <p className="text-[11px] text-text-muted italic">No blocks yet</p>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-surface-border">
        <button
          onClick={onClearDay}
          className="w-full text-xs text-text-muted hover:text-red-400 transition-colors text-left"
        >
          Clear day
        </button>
      </div>
    </aside>
  )
}

