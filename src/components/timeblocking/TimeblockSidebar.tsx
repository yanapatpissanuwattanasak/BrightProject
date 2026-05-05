import type { Summary } from '@/types/timeblock'
import { BLOCK_TYPE_COLORS, BLOCK_TYPE_LABELS } from '@/types/timeblock'

type Props = {
  date: string
  summary: Summary
  onDateChange: (date: string) => void
  onCopyYesterday: () => void
  onClearDay: () => void
}

export function TimeblockSidebar({ date, summary, onDateChange, onCopyYesterday, onClearDay }: Props) {
  const types = Object.entries(BLOCK_TYPE_LABELS) as [keyof typeof BLOCK_TYPE_LABELS, string][]

  function changeDate(delta: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + delta)
    onDateChange(d.toISOString().slice(0, 10))
  }

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  })

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-4 bg-surface-raised border-r border-surface-border p-4 h-full overflow-y-auto">

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
        <div className="h-2 bg-surface-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${summary.utilizationRate}%`,
              backgroundColor: summary.utilizationRate > 80 ? '#22C55E' : summary.utilizationRate > 50 ? '#F59E0B' : '#6366F1',
            }}
          />
        </div>
      </div>

      {/* Free time */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-muted">Free time</span>
        <span className="text-sm font-mono text-text-secondary">{summary.freeTime.toFixed(1)}h</span>
      </div>

      {/* Per-type breakdown */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Breakdown</p>
        <div className="flex flex-col gap-2">
          {types.map(([type, label]) => {
            const hours = summary.totalHoursByType[type] ?? 0
            if (hours === 0) return null
            return (
              <div key={type} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: BLOCK_TYPE_COLORS[type] }} />
                <span className="text-xs text-text-secondary flex-1">{label}</span>
                <span className="text-xs font-mono text-text-primary">{hours.toFixed(1)}h</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Balance score */}
      {(summary.totalHoursByType.work > 0 || summary.totalHoursByType.life > 0) && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-muted">Work/Life</span>
          <span className="text-xs font-mono text-text-secondary">
            {summary.totalHoursByType.work > 0 && summary.totalHoursByType.life > 0
              ? `${(summary.totalHoursByType.work / summary.totalHoursByType.life).toFixed(1)}×`
              : '—'
            }
          </span>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <button
          onClick={onCopyYesterday}
          className="text-xs text-text-muted hover:text-text-primary border border-surface-border rounded-lg py-1.5 transition-colors hover:border-primary"
        >
          Copy yesterday
        </button>
        <button
          onClick={onClearDay}
          className="text-xs text-error/60 hover:text-error border border-surface-border rounded-lg py-1.5 transition-colors hover:border-error"
        >
          Clear day
        </button>
      </div>
    </aside>
  )
}
