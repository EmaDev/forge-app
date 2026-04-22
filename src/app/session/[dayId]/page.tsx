'use client'
import { useParams, useRouter } from 'next/navigation'
import { useProgram } from '@/hooks/useProgram'
import { useSession } from '@/hooks/useSession'
import { useCountdown } from '@/hooks/useTimer'
import { ExerciseCard } from '@/components/session/ExerciseCard'
import { MetconCard } from '@/components/session/MetconCard'
import { RestTimer } from '@/components/session/RestTimer'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { getDayName } from '@/lib/utils'
import { saveSession, updateStreak, getStreak, savePR } from '@/lib/firebase'
import { useState } from 'react'
import type { SetInput } from '@/hooks/useSession'

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const dayId = params.dayId as string

  const { week, loading } = useProgram(1)
  const day = week?.days.find(d => d.id === dayId)

  const {
    sessionState,
    updateSet,
    completeSet,
    updateMetconResult,
    markComplete,
    allExerciseSetsComplete,
    totalSets,
    completedSets,
  } = useSession(day ?? null)

  const restTimer = useCountdown()
  const [saving, setSaving] = useState(false)

  function handleCompleteSet(exerciseId: string, setIndex: number, progressionKey: string, restSeconds: number) {
    completeSet(exerciseId, setIndex, progressionKey)
    restTimer.start(restSeconds)
  }

  async function handleCompleteSession() {
    if (!sessionState || !day) return
    setSaving(true)
    try {
      const allSets: Array<SetInput & { exerciseId: string; progressionKey: string; exerciseName: string }> = []
      for (const block of day.blocks) {
        for (const exercise of block.exercises) {
          const sets = sessionState.sets[exercise.id] ?? []
          sets.forEach(s => {
            allSets.push({ ...s, exerciseId: exercise.id, progressionKey: exercise.progressionKey, exerciseName: exercise.name })
          })
        }
      }

      // Save PRs
      const prSets = allSets.filter(s => s.isPR && s.isComplete)
      for (const s of prSets) {
        await savePR({
          progressionKey: s.progressionKey,
          exerciseName: s.exerciseName,
          weightKg: parseFloat(s.weightKg) || 0,
          reps: parseInt(s.completedReps) || 0,
          achievedAt: s.completedAt ?? new Date().toISOString(),
          week: week?.number ?? 1,
        })
      }

      // Save session
      await saveSession({
        dayId: day.id,
        dayName: day.name,
        weekNumber: week?.number ?? 1,
        startedAt: sessionState.startedAt,
        completedAt: new Date().toISOString(),
        sets: allSets,
        metconResult: sessionState.metconResult,
      })

      // Update streak
      const streak = await getStreak()
      const current = (streak?.current ?? 0) + 1
      const record = Math.max(current, streak?.record ?? 0)
      await updateStreak({
        current,
        record,
        lastSessionAt: new Date().toISOString(),
        weeklyCompletionRate: null,
      })

      localStorage.removeItem(`forge-session-${day.id}`)
      markComplete()
      router.push('/')
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <span className="text-forge-muted font-mono text-sm animate-pulse">CARGANDO...</span>
      </div>
    )
  }

  if (!day || !sessionState) {
    return (
      <div className="min-h-screen bg-forge-bg flex flex-col items-center justify-center gap-4">
        <p className="text-forge-muted font-mono text-sm">SESIÓN NO ENCONTRADA</p>
        <button onClick={() => router.push('/')} className="text-forge-red font-mono text-sm">
          ← VOLVER
        </button>
      </div>
    )
  }

  const sessionProgress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  return (
    <div className="min-h-screen bg-forge-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-forge-bg/95 backdrop-blur-sm border-b border-forge-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => router.back()}
            className="text-forge-muted font-mono text-sm hover:text-forge-text transition-colors"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-forge-muted font-mono text-[10px] uppercase tracking-widest">
              {getDayName(day.dayOfWeek).toUpperCase()} — SEMANA {week?.number}
            </p>
            <h1 className="text-forge-text font-semibold text-sm truncate">{day.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-forge-muted font-mono text-xs">{completedSets}/{totalSets}</span>
            <ProgressRing value={sessionProgress} size={32} strokeWidth={3} color="#E24B4A" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-32">
        <div className="flex flex-col gap-6 max-w-lg mx-auto">
          {day.blocks.map(block => (
            <section key={block.id}>
              <p className="text-forge-muted text-[10px] font-mono uppercase tracking-widest mb-3 px-1">
                {block.label}
              </p>
              <div className="flex flex-col gap-3">
                {block.exercises.map(exercise => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    sets={sessionState.sets[exercise.id] ?? []}
                    onUpdateSet={(idx, data) => updateSet(exercise.id, idx, data)}
                    onCompleteSet={idx =>
                      handleCompleteSet(exercise.id, idx, exercise.progressionKey, exercise.restSeconds)
                    }
                    isAllComplete={allExerciseSetsComplete(exercise.id)}
                  />
                ))}
              </div>
            </section>
          ))}

          <section>
            <p className="text-forge-muted text-[10px] font-mono uppercase tracking-widest mb-3 px-1">
              METCON — {day.metcon.format}
            </p>
            <MetconCard
              metcon={day.metcon}
              result={sessionState.metconResult}
              onChange={updateMetconResult}
            />
          </section>
        </div>
      </main>

      {/* Complete session button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-gradient-to-t from-forge-bg via-forge-bg/95 to-transparent">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleCompleteSession}
            disabled={saving}
            className={[
              'w-full h-14 rounded-xl font-mono font-semibold text-base transition-all',
              saving
                ? 'bg-forge-surface border border-forge-border text-forge-muted cursor-not-allowed'
                : 'bg-forge-red text-white active:scale-95 hover:bg-[#c73f3e]',
            ].join(' ')}
          >
            {saving ? 'GUARDANDO...' : 'COMPLETAR SESIÓN'}
          </button>
        </div>
      </div>

      {/* Rest timer overlay */}
      {restTimer.running && (
        <RestTimer
          seconds={restTimer.seconds}
          total={restTimer.total}
          onSkip={restTimer.stop}
        />
      )}
    </div>
  )
}
