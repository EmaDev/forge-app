'use client'
import { useState, useEffect } from 'react'
import { getStreak } from '@/lib/firebase'
import type { Streak } from '@/types/program'

const DEFAULT_STREAK: Streak = {
  current: 0,
  record: 0,
  lastSessionAt: null,
  weeklyCompletionRate: null,
}

export function useStreak() {
  const [streak, setStreak] = useState<Streak>(DEFAULT_STREAK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStreak()
      .then(data => setStreak(data ? (data as Streak) : DEFAULT_STREAK))
      .catch(() => setStreak(DEFAULT_STREAK))
      .finally(() => setLoading(false))
  }, [])

  return { streak, loading }
}
