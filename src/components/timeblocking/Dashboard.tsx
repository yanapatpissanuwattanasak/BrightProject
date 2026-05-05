import { useMemo, useState } from 'react'
import type { BlockTypeDef } from '@/types/timeblock'
import { loadAllSchedules, computeSummary, getMonthDates } from '@/lib/timeblock'

type Props = {
  date: string
  blockTypes: BlockTypeDef[]
}

export function Dashboard({ date, blockTypes }: Props) {
  const [view, setView] = useState<'day' | 'month'>('day')

  const typeMap = new Map(blockTypes.map(t => [t.id, t]))

  const [year, monthNum] = date.split('-').map(Number)

  const dayData = useMemo(() => {
    const all = loadAllSchedules()
    const schedule = all[date] ?? { date, blocks: [] }
    return computeSummary(schedule)
  }, [date])

  const monthData = useMemo(() => {
    const all = loadAllSchedules()
    const dates = getMonthDates(year, monthNum - 1)
    const totals: Record<string, number> = {}
    for (const d of dates) {
      const schedule = all[d]
      if (!schedule) continue
      const summary = computeSummary(schedule)
      for (const [typeId, hours] of Object.entries(summary.totalHoursByType)) {
        totals[typeId] = (totals[typeId] ?? 0) + hours
      }
    }
    return totals
  }, [year, monthNum])

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const monthLabel = new Date(year, monthNum - 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })

  const currentData = view === 'day' ? dayData.totalHoursByType : monthData
  const allValues = Object.values(currentData)
  const maxHours = allValues.length > 0 ? Math.max(...allValues, 0.1) : 0.1
  const totalHours = allValues.reduce((a, b) => a + b, 0)

  const sortedTypes = blockTypes
    .filter(t => (currentData[t.id] ?? 0) > 0)
    .sort((a, b) => (currentData[b.id] ?? 0) - (currentData[a.id] ?? 0))

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold text-text-primary">Dashboard</h2>
        <p className="text-xs text-text-muted">{view === 'day' ? displayDate : monthLabel}</p>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 p-0.5 bg-surface rounded-lg border border-surface-border w-fit">
        {(['day', 'month'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors capitalize
              ${view === v ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {v === 'day' ? 'Day' : 'Month'}
          </button>
        ))}
      </div>

      {/* Day stats */}
      {view === 'day' && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-lg bg-surface border border-surface-border col-span-1">
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Utilized</p>
            <p className="text-2xl font-bold text-text-primary font-mono">{dayData.utilizationRate}%</p>
            <div className="h-1 bg-surface-border rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${dayData.utilizationRate}%`,
                  backgroundColor: dayData.utilizationRate > 80 ? '#22C55E' : '#6366F1',
                }}
              />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-surface-border">
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Planned</p>
            <p className="text-2xl font-bold text-text-primary font-mono">{totalHours.toFixed(1)}h</p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-surface-border">
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Free</p>
            <p className="text-2xl font-bold text-text-primary font-mono">{dayData.freeTime.toFixed(1)}h</p>
          </div>
        </div>
      )}

      {/* Month total */}
      {view === 'month' && (
        <div className="p-3 rounded-lg bg-surface border border-surface-border w-fit">
          <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Total this month</p>
          <p className="text-2xl font-bold text-text-primary font-mono">{totalHours.toFixed(1)}h</p>
        </div>
      )}

      {/* Per-type breakdown */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">
          Time by Type — {view === 'day' ? 'Today' : 'This Month'}
        </p>

        {sortedTypes.length === 0 ? (
          <p className="text-xs text-text-muted italic">No blocks recorded.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedTypes.map(type => {
              const hours = currentData[type.id] ?? 0
              const pct = totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0
              const barPct = (hours / maxHours) * 100

              return (
                <div key={type.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
                      <span className="text-xs text-text-secondary">{type.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[11px] text-text-muted">{pct}%</span>
                      <span className="text-xs font-semibold text-text-primary">{hours.toFixed(1)}h</span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${barPct}%`, backgroundColor: type.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
