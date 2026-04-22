'use client'
import { useState, useEffect, useCallback } from 'react'
import { getPRs } from '@/lib/firebase'
import type { Day, MetconResult } from '@/types/program'

export interface SetInput {
  completedReps: string
  weightKg: string
  rpe: number | null
  isComplete: boolean
  isPR: boolean
  completedAt: string | null
}

export interface SessionState {
  dayId: string
  sets: Record<string, SetInput[]>
  metconResult: MetconResult
  startedAt: string
  isComplete: boolean
}

function buildInitialSets(day: Day): Record<string, SetInput[]> {
  const result: Record<string, SetInput[]> = {}
  for (const block of day.blocks) {
    for (const exercise of block.exercises) {
      result[exercise.id] = Array.from({ length: exercise.targetSets }, () => ({
        completedReps: '',
        weightKg: exercise.targetWeightKg > 0 ? String(exercise.targetWeightKg) : '',
        rpe: null,
        isComplete: false,
        isPR: false,
        completedAt: null,
      }))
    }
  }
  return result
}

export function useSession(day: Day | null) {
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [prMap, setPrMap] = useState<Record<string, number>>({})

  useEffect(() => {
    getPRs()
      .then(list => {
        const map: Record<string, number> = {}
        for (const pr of list as Array<Record<string, unknown>>) {
          const key = pr['progressionKey'] as string
          const w = pr['weightKg'] as number
          if (!map[key] || w > map[key]) map[key] = w
        }
        setPrMap(map)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!day) return
    const saved = localStorage.getItem(`forge-session-${day.id}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SessionState
        if (parsed.dayId === day.id && !parsed.isComplete) {
          setSessionState(parsed)
          return
        }
      } catch {}
    }
    setSessionState({
      dayId: day.id,
      sets: buildInitialSets(day),
      metconResult: { ...day.metcon.result },
      startedAt: new Date().toISOString(),
      isComplete: false,
    })
  }, [day])

  useEffect(() => {
    if (!sessionState) return
    localStorage.setItem(`forge-session-${sessionState.dayId}`, JSON.stringify(sessionState))
  }, [sessionState])

  const updateSet = useCallback((exerciseId: string, setIndex: number, data: Partial<SetInput>) => {
    setSessionState(prev => {
      if (!prev) return prev
      const newSets = { ...prev.sets, [exerciseId]: [...prev.sets[exerciseId]] }
      newSets[exerciseId][setIndex] = { ...newSets[exerciseId][setIndex], ...data }
      return { ...prev, sets: newSets }
    })
  }, [])

  const completeSet = useCallback((
    exerciseId: string,
    setIndex: number,
    progressionKey: string
  ) => {
    setSessionState(prev => {
      if (!prev) return prev
      const newSets = { ...prev.sets, [exerciseId]: [...prev.sets[exerciseId]] }
      const current = newSets[exerciseId][setIndex]
      const weight = parseFloat(current.weightKg) || 0
      const bestPR = prMap[progressionKey] ?? 0
      const isPR = weight > 0 && weight > bestPR
      newSets[exerciseId][setIndex] = {
        ...current,
        isComplete: true,
        isPR,
        completedAt: new Date().toISOString(),
      }
      return { ...prev, sets: newSets }
    })
  }, [prMap])

  const updateMetconResult = useCallback((result: MetconResult) => {
    setSessionState(prev => prev ? { ...prev, metconResult: result } : prev)
  }, [])

  const markComplete = useCallback(() => {
    setSessionState(prev => prev ? { ...prev, isComplete: true } : prev)
  }, [])

  const allExerciseSetsComplete = (exerciseId: string) =>
    sessionState?.sets[exerciseId]?.every(s => s.isComplete) ?? false

  const totalSets = sessionState
    ? Object.values(sessionState.sets).flat().length
    : 0

  const completedSets = sessionState
    ? Object.values(sessionState.sets).flat().filter(s => s.isComplete).length
    : 0

  return {
    sessionState,
    prMap,
    updateSet,
    completeSet,
    updateMetconResult,
    markComplete,
    allExerciseSetsComplete,
    totalSets,
    completedSets,
  }
}
