import { useMemo, useState } from 'react'
import type { BlockTypeDef } from '@/types/timeblock'
import { loadAllSchedules, computeDaySummary, getMonthDates, minutesToDuration } from '@/lib/timeblock'

type Props = {
  date: string
  blockTypes: BlockTypeDef[]
}

export function Dashboard({ date, blockTypes }: Props) {
  const [view, setView] = useState<'day' | 'month'>('day')

  const [year, monthNum] = date.split('-').map(Number)

  const dayData = useMemo(() => {
    const all = loadAllSchedules()
    const schedule = all[date] ?? { date, slots: [], unscheduled: [] }
    return computeDaySummary(schedule)
  }, [date])

  const monthData = useMemo(() => {
    const all = loadAllSchedules()
    const dates = getMonthDates(year, monthNum - 1)
    const totalTasks = { done: 0, total: 0 }
    const minutesByType: Record<string, number> = {}
    let minutesTotal = 0

    for (const d of dates) {
      const schedule = all[d]
      if (!schedule) continue
      const summary = computeDaySummary(schedule)
      totalTasks.done += summary.doneTasks
      totalTasks.total += summary.totalTasks
      minutesTotal += summary.estimatedMinutesTotal
      for (const [typeId, mins] of Object.entries(summary.estimatedMinutesByType)) {
        minutesByType[typeId] = (minutesByType[typeId] ?? 0) + mins
      }
    }

    return { totalTasks, minutesByType, minutesTotal }
  }, [year, monthNum])

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const monthLabel = new Date(year, monthNum - 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })

  const currentMinutesByType = view === 'day' ? dayData.estimatedMinutesByType : monthData.minutesByType
  const maxMins = Math.max(...Object.values(currentMinutesByType), 0.1)

  const sortedTypes = blockTypes
    .filter(t => (currentMinutesByType[t.id] ?? 0) > 0)
    .sort((a, b) => (currentMinutesByType[b.id] ?? 0) - (currentMinutesByType[a.id] ?? 0))

  const dayCompletionPct = dayData.totalTasks > 0
    ? Math.round((dayData.doneTasks / dayData.totalTasks) * 100)
    : 0

  const monthCompletionPct = monthData.totalTasks.total > 0
    ? Math.round((monthData.totalTasks.done / monthData.totalTasks.total) * 100)
    : 0

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
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Done</p>
            <p className="text-2xl font-bold text-text-primary font-mono">{dayCompletionPct}%</p>
            <div className="h-1 bg-surface-border rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${dayCompletionPct}%`,
                  backgroundColor: dayCompletionPct === 100 ? '#22C55E' : '#6366F1',
                }}
              />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-surface-border">
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Tasks</p>
            <p className="text-2xl font-bold text-text-primary font-mono">
              {dayData.doneTasks}<span className="text-sm text-text-muted">/{dayData.totalTasks}</span>
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-surface-border">
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Estimated</p>
            <p className="text-lg font-bold text-text-primary font-mono">
              {dayData.estimatedMinutesTotal > 0 ? minutesToDuration(dayData.estimatedMinutesTotal) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Month stats */}
      {view === 'month' && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-lg bg-surface border border-surface-border">
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Done</p>
            <p className="text-2xl font-bold text-text-primary font-mono">{monthCompletionPct}%</p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-surface-border">
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Tasks</p>
            <p className="text-2xl font-bold text-text-primary font-mono">
              {monthData.totalTasks.done}<span className="text-sm text-text-muted">/{monthData.totalTasks.total}</span>
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-surface-border">
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Estimated</p>
            <p className="text-lg font-bold text-text-primary font-mono">
              {monthData.minutesTotal > 0 ? minutesToDuration(monthData.minutesTotal) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Per-type breakdown */}
      {sortedTypes.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">
            Estimated by type
          </p>
          <div className="flex flex-col gap-4">
            {sortedTypes.map(type => {
              const mins = currentMinutesByType[type.id] ?? 0
              const totalMins = Object.values(currentMinutesByType).reduce((a, b) => a + b, 0)
              const pct = totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0
              const barPct = (mins / maxMins) * 100

              return (
                <div key={type.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
                      <span className="text-xs text-text-secondary">{type.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[11px] text-text-muted">{pct}%</span>
                      <span className="text-xs font-semibold text-text-primary">{minutesToDuration(mins)}</span>
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
        </div>
      )}

      {sortedTypes.length === 0 && (
        <p className="text-xs text-text-muted italic">No tasks with estimates recorded.</p>
      )}
    </div>
  )
}
