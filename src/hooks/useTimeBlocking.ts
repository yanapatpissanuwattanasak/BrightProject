import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Block, BlockTypeDef, DaySchedule } from '@/types/timeblock'
import {
  loadSchedule,
  saveSchedule,
  loadBlockTypes,
  saveBlockTypes,
  computeSummary,
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

  const clearDay = useCallback(() => {
    setSchedule(s => ({ ...s, blocks: [] }))
  }, [])

  const addBlockType = useCallback((name: string, color: string): BlockTypeDef => {
    const newType: BlockTypeDef = { id: generateId(), name, color }
    setBlockTypes(ts => [...ts, newType])
    return newType
  }, [])

  const updateBlockType = useCallback((type: BlockTypeDef) => {
    setBlockTypes(ts => ts.map(t => t.id === type.id ? type : t))
    setSchedule(s => ({
      ...s,
      blocks: s.blocks.map(b => b.typeId === type.id ? { ...b, color: type.color } : b),
    }))
  }, [])

  const deleteBlockType = useCallback((id: string) => {
    setBlockTypes(ts => ts.filter(t => t.id !== id))
  }, [])

  const summary = useMemo(() => computeSummary(schedule), [schedule])

  return {
    date,
    schedule,
    summary,
    blockTypes,
    setDate,
    changeDate,
    addBlock,
    updateBlock,
    deleteBlock,
    clearDay,
    addBlockType,
    updateBlockType,
    deleteBlockType,
  }
}

