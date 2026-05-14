import { useEffect, useRef } from 'react'
import type { BlockTypeDef, DaySchedule, Task, TimeSlot } from '@/types/timeblock'
import { SlotCard } from './SlotCard'
import { AddTaskForm } from './AddTaskForm'
import { TaskItem } from './TaskItem'

const HOUR_WIDTH = 80
const TOTAL_WIDTH = HOUR_WIDTH * 24
const HEADER_HEIGHT = 28
const MIN_CONTENT_HEIGHT = 180

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

type Props = {
  schedule: DaySchedule
  blockTypes: BlockTypeDef[]
  onEditSlot: (slot: TimeSlot) => void
  onDeleteSlot: (slotId: string) => void
  onToggleCollapse: (slotId: string) => void
  onAddTask: (slotId: string, title: string) => void
  onToggleTask: (taskId: string) => void
  onClickTask: (task: Task) => void
  onAddUnscheduled: (title: string) => void
}

export function DayBoard({
  schedule, blockTypes,
  onEditSlot, onDeleteSlot, onToggleCollapse,
  onAddTask, onToggleTask, onClickTask, onAddUnscheduled,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const timedSlots = schedule.slots
    .filter(s => s.startTime)
    .sort((a, b) => timeToMinutes(a.startTime!) - timeToMinutes(b.startTime!))
  const floatingSlots = schedule.slots.filter(s => !s.startTime)

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const nowLeft = (nowMinutes / 1440) * TOTAL_WIDTH

  // Scroll current time into view on mount
  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollLeft = Math.max(0, nowLeft - 200)
  }, [])

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Horizontal scrollable timeline */}
      <div ref={scrollRef} className="overflow-x-auto overflow-y-auto flex-1">
        <div style={{ width: TOTAL_WIDTH, minWidth: TOTAL_WIDTH }}>

          {/* Hour header row */}
          <div
            className="flex sticky top-0 z-20 bg-surface border-b border-surface-border"
            style={{ height: HEADER_HEIGHT }}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="shrink-0 flex items-center pl-2 text-[11px] font-mono text-text-muted border-r border-surface-border/40"
                style={{ width: HOUR_WIDTH }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Slots area */}
          <div className="relative" style={{ minHeight: MIN_CONTENT_HEIGHT, width: TOTAL_WIDTH }}>

            {/* Hour grid lines */}
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="absolute top-0 bottom-0 border-r border-surface-border/25 pointer-events-none"
                style={{ left: h * HOUR_WIDTH }}
              />
            ))}

            {/* 30-min sub-lines */}
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="absolute top-0 bottom-0 border-r border-surface-border/10 pointer-events-none"
                style={{ left: h * HOUR_WIDTH + HOUR_WIDTH / 2 }}
              />
            ))}

            {/* Current time vertical line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-red-400/80 z-10 pointer-events-none"
              style={{ left: nowLeft }}
            >
              <div className="w-2 h-2 rounded-full bg-red-400 -ml-[3px] mt-2" />
            </div>

            {/* Slot cards */}
            {timedSlots.map(slot => {
              const startMin = timeToMinutes(slot.startTime!)
              const endMin = slot.endTime ? timeToMinutes(slot.endTime) : startMin + 60
              const left = (startMin / 1440) * TOTAL_WIDTH
              const width = Math.max(HOUR_WIDTH, ((endMin - startMin) / 1440) * TOTAL_WIDTH)

              return (
                <div
                  key={slot.id}
                  className="absolute top-2"
                  style={{ left: left + 2, width: width - 4 }}
                >
                  <SlotCard
                    slot={slot}
                    blockTypes={blockTypes}
                    fullWidth
                    onEditSlot={() => onEditSlot(slot)}
                    onDeleteSlot={() => onDeleteSlot(slot.id)}
                    onToggleCollapse={() => onToggleCollapse(slot.id)}
                    onAddTask={title => onAddTask(slot.id, title)}
                    onToggleTask={onToggleTask}
                    onClickTask={onClickTask}
                  />
                </div>
              )
            })}

            {/* Empty state */}
            {timedSlots.length === 0 && floatingSlots.length === 0 && schedule.unscheduled.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-sm text-text-muted">No slots yet</p>
                <p className="text-xs text-text-muted mt-1">Click "+ Add Slot" to plan your day</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating slots — no time set */}
      {floatingSlots.length > 0 && (
        <div className="shrink-0 px-4 pt-3 pb-2 border-t border-surface-border overflow-y-auto max-h-60">
          <p className="text-[10px] font-medium text-text-muted mb-2 uppercase tracking-wider">No time set</p>
          <div className="flex gap-3 flex-wrap">
            {floatingSlots.map(slot => (
              <div key={slot.id} className="w-60 shrink-0">
                <SlotCard
                  slot={slot}
                  blockTypes={blockTypes}
                  onEditSlot={() => onEditSlot(slot)}
                  onDeleteSlot={() => onDeleteSlot(slot.id)}
                  onToggleCollapse={() => onToggleCollapse(slot.id)}
                  onAddTask={title => onAddTask(slot.id, title)}
                  onToggleTask={onToggleTask}
                  onClickTask={onClickTask}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unscheduled tasks */}
      <div className="shrink-0 px-4 pt-3 pb-4 border-t border-surface-border overflow-y-auto max-h-48">
        <p className="text-[10px] font-medium text-text-muted mb-2 uppercase tracking-wider">Unscheduled</p>
        <div className="flex flex-col gap-0.5 max-w-sm">
          {schedule.unscheduled.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              blockTypes={blockTypes}
              onToggle={() => onToggleTask(task.id)}
              onClick={() => onClickTask(task)}
            />
          ))}
          <div className="mt-1">
            <AddTaskForm onAdd={onAddUnscheduled} />
          </div>
        </div>
      </div>

    </div>
  )
}
