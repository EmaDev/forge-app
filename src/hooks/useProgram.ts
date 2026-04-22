'use client'
import { useState, useEffect } from 'react'
import { getWeek, getAIAnalysis } from '@/lib/firebase'
import week1Fallback from '@/data/week1.json'
import type { Week, AIAnalysis } from '@/types/program'

export function useProgram(weekNumber: number = 1) {
  const [week, setWeek] = useState<Week | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [weekData, analysisData] = await Promise.all([
          getWeek(weekNumber),
          getAIAnalysis(weekNumber),
        ])
        setWeek(weekData ? (weekData as Week) : (week1Fallback as unknown as Week))
        setAiAnalysis(analysisData ? (analysisData as AIAnalysis) : null)
      } catch {
        setWeek(week1Fallback as unknown as Week)
        setError('Firebase no configurado — usando datos locales')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [weekNumber])

  return { week, aiAnalysis, loading, error }
}
