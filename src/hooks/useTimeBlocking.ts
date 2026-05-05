import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Block, DaySchedule } from '@/types/timeblock'
import {
  loadSchedule,
  saveSchedule,
  computeSummary,
  todayString,
  copySchedule,
} from '@/lib/timeblock'

export function useTimeBlocking() {
  const [date, setDate] = useState(todayString)
  const [schedule, setSchedule] = useState<DaySchedule>(() => loadSchedule(todayString()))

  // Load schedule when date changes
  useEffect(() => {
    setSchedule(loadSchedule(date))
  }, [date])

  // Persist on every change
  useEffect(() => {
    saveSchedule(schedule)
  }, [schedule])

  // Keyboard shortcuts
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

  const addBlock = useCallback((block: Block) => {
    setSchedule(s => ({ ...s, blocks: [...s.blocks, block] }))
  }, [])

  const updateBlock = useCallback((block: Block) => {
    setSchedule(s => ({
      ...s,
      blocks: s.blocks.map(b => b.id === block.id ? block : b),
    }))
  }, [])

  const deleteBlock = useCallback((id: string) => {
    setSchedule(s => ({ ...s, blocks: s.blocks.filter(b => b.id !== id) }))
  }, [])

  const moveBlock = useCallback((id: string, newStart: number, newEnd: number) => {
    setSchedule(s => ({
      ...s,
      blocks: s.blocks.map(b =>
        b.id === id ? { ...b, start: newStart, end: newEnd } : b
      ),
    }))
  }, [])

  const resizeBlock = useCallback((id: string, edge: 'top' | 'bottom', minute: number) => {
    setSchedule(s => ({
      ...s,
      blocks: s.blocks.map(b => {
        if (b.id !== id) return b
        if (edge === 'top') {
          const newStart = Math.max(0, Math.min(b.end - 15, minute))
          return { ...b, start: newStart }
        } else {
          const newEnd = Math.min(1440, Math.max(b.start + 15, minute))
          return { ...b, end: newEnd }
        }
      }),
    }))
  }, [])

  const copyYesterday = useCallback(() => {
    const prev = new Date(date + 'T00:00:00')
    prev.setDate(prev.getDate() - 1)
    const prevDate = prev.toISOString().slice(0, 10)
    const yesterday = loadSchedule(prevDate)
    if (yesterday.blocks.length === 0) return
    setSchedule(copySchedule(yesterday, date))
  }, [date])

  const clearDay = useCallback(() => {
    setSchedule({ date, blocks: [] })
  }, [date])

  const summary = useMemo(() => computeSummary(schedule), [schedule])

  return {
    date,
    schedule,
    summary,
    setDate,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    resizeBlock,
    copyYesterday,
    clearDay,
  }
}
