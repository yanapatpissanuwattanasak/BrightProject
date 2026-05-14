import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BlockTypeDef, DaySchedule, Task, TimeSlot } from '@/types/timeblock'
import {
  loadSchedule,
  saveSchedule,
  loadBlockTypes,
  saveBlockTypes,
  computeDaySummary,
  todayString,
  generateId,
} from '@/lib/timeblock'

export function useTimeBlocking() {
  const [date, setDate] = useState(todayString)
  const [schedule, setSchedule] = useState<DaySchedule>(() => loadSchedule(todayString()))
  const [blockTypes, setBlockTypes] = useState<BlockTypeDef[]>(() => loadBlockTypes())

  useEffect(() => {
    setSchedule(loadSchedule(date))
  }, [date])

  useEffect(() => {
    saveSchedule(schedule)
  }, [schedule])

  useEffect(() => {
    saveBlockTypes(blockTypes)
  }, [blockTypes])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowLeft') changeDate(-1)
      if (e.key === 'ArrowRight') changeDate(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  function changeDate(delta: number) {
    setDate(d => {
      const next = new Date(d + 'T00:00:00')
      next.setDate(next.getDate() + delta)
      return next.toISOString().slice(0, 10)
    })
  }

  // --- Slot CRUD ---

  const addSlot = useCallback((slot: Omit<TimeSlot, 'id' | 'tasks'>) => {
    const newSlot: TimeSlot = { ...slot, id: generateId(), tasks: [] }
    setSchedule(s => ({ ...s, slots: [...s.slots, newSlot] }))
  }, [])

  const updateSlot = useCallback((slotId: string, patch: Partial<Omit<TimeSlot, 'id' | 'tasks'>>) => {
    setSchedule(s => ({
      ...s,
      slots: s.slots.map(sl => sl.id === slotId ? { ...sl, ...patch } : sl),
    }))
  }, [])

  const deleteSlot = useCallback((slotId: string) => {
    setSchedule(s => ({ ...s, slots: s.slots.filter(sl => sl.id !== slotId) }))
  }, [])

  const toggleSlotCollapsed = useCallback((slotId: string) => {
    setSchedule(s => ({
      ...s,
      slots: s.slots.map(sl => sl.id === slotId ? { ...sl, collapsed: !sl.collapsed } : sl),
    }))
  }, [])

  // --- Task CRUD ---

  const addTask = useCallback((slotId: string, title: string) => {
    const task: Task = { id: generateId(), title, done: false }
    setSchedule(s => ({
      ...s,
      slots: s.slots.map(sl =>
        sl.id === slotId ? { ...sl, tasks: [...sl.tasks, task] } : sl
      ),
    }))
  }, [])

  const addUnscheduledTask = useCallback((title: string) => {
    const task: Task = { id: generateId(), title, done: false }
    setSchedule(s => ({ ...s, unscheduled: [...s.unscheduled, task] }))
  }, [])

  const updateTask = useCallback((taskId: string, patch: Partial<Omit<Task, 'id'>>) => {
    setSchedule(s => {
      const updateList = (tasks: Task[]) =>
        tasks.map(t => t.id === taskId ? { ...t, ...patch } : t)
      return {
        ...s,
        slots: s.slots.map(sl => ({ ...sl, tasks: updateList(sl.tasks) })),
        unscheduled: updateList(s.unscheduled),
      }
    })
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    setSchedule(s => ({
      ...s,
      slots: s.slots.map(sl => ({ ...sl, tasks: sl.tasks.filter(t => t.id !== taskId) })),
      unscheduled: s.unscheduled.filter(t => t.id !== taskId),
    }))
  }, [])

  const toggleTask = useCallback((taskId: string) => {
    setSchedule(s => {
      const toggle = (tasks: Task[]) =>
        tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
      return {
        ...s,
        slots: s.slots.map(sl => ({ ...sl, tasks: toggle(sl.tasks) })),
        unscheduled: toggle(s.unscheduled),
      }
    })
  }, [])

  const moveTaskToSlot = useCallback((taskId: string, targetSlotId: string | null) => {
    setSchedule(s => {
      let task: Task | undefined

      const newSlots = s.slots.map(sl => {
        const found = sl.tasks.find(t => t.id === taskId)
        if (found) { task = found }
        return { ...sl, tasks: sl.tasks.filter(t => t.id !== taskId) }
      })

      let newUnscheduled = s.unscheduled.filter(t => {
        if (t.id === taskId) { task = t; return false }
        return true
      })

      if (!task) return s

      if (targetSlotId === null) {
        newUnscheduled = [...newUnscheduled, task]
      } else {
        return {
          ...s,
          slots: newSlots.map(sl =>
            sl.id === targetSlotId ? { ...sl, tasks: [...sl.tasks, task!] } : sl
          ),
          unscheduled: newUnscheduled,
        }
      }

      return { ...s, slots: newSlots, unscheduled: newUnscheduled }
    })
  }, [])

  const clearDay = useCallback(() => {
    setSchedule(s => ({ ...s, slots: [], unscheduled: [] }))
  }, [])

  // --- Block types ---

  const addBlockType = useCallback((name: string, color: string): BlockTypeDef => {
    const newType: BlockTypeDef = { id: generateId(), name, color }
    setBlockTypes(ts => [...ts, newType])
    return newType
  }, [])

  const updateBlockType = useCallback((type: BlockTypeDef) => {
    setBlockTypes(ts => ts.map(t => t.id === type.id ? type : t))
  }, [])

  const deleteBlockType = useCallback((id: string) => {
    setBlockTypes(ts => ts.filter(t => t.id !== id))
  }, [])

  const summary = useMemo(() => computeDaySummary(schedule), [schedule])

  return {
    date,
    schedule,
    summary,
    blockTypes,
    setDate,
    changeDate,
    addSlot,
    updateSlot,
    deleteSlot,
    toggleSlotCollapsed,
    addTask,
    addUnscheduledTask,
    updateTask,
    deleteTask,
    toggleTask,
    moveTaskToSlot,
    clearDay,
    addBlockType,
    updateBlockType,
    deleteBlockType,
  }
}
