'use client'
import { useState, useEffect } from 'react'
import { getSessions, getPRs } from '@/lib/firebase'
import type { PR } from '@/types/program'

export interface SessionRecord {
  id: string
  dayId: string
  dayName: string
  weekNumber: number
  startedAt: string
  completedAt: string
  sets: Array<{
    exerciseId: string
    progressionKey: string
    exerciseName: string
    completedReps: string
    weightKg: string
    rpe: number | null
    isComplete: boolean
    isPR: boolean
    completedAt: string | null
  }>
  metconResult: Record<string, unknown>
}

export function useSessions() {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [prs, setPrs] = useState<PR[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSessions(), getPRs()])
      .then(([sess, prList]) => {
        setSessions(sess as SessionRecord[])
        setPrs(prList as unknown as PR[])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { sessions, prs, loading }
}
