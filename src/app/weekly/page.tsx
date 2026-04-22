'use client'
import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'motion/react'
import { useProgram } from '@/hooks/useProgram'
import { DayCard } from '@/components/weekly/DayCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { getTodayDayOfWeek } from '@/lib/utils'

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}

export default function WeeklyPage() {
  const router = useRouter()
  const { week, loading } = useProgram(1)

  const todayDow = getTodayDayOfWeek()
  const todayIdx = DAY_ORDER.indexOf(todayDow)

  const completedCount = week?.days.filter(d => d.isCompleted).length ?? 0
  const totalDays = week?.days.length ?? 5

  const totalExercises = week?.days.reduce(
    (acc, d) => acc + d.blocks.reduce((a, b) => a + b.exercises.length, 0),
    0
  ) ?? 0

  const completedExercises = week?.days
    .filter(d => d.isCompleted)
    .reduce((acc, d) => acc + d.blocks.reduce((a, b) => a + b.exercises.length, 0), 0) ?? 0

  if (loading) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <span className="text-forge-muted font-mono text-sm animate-pulse">CARGANDO...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forge-bg flex flex-col">
      {/* Header */}
      <header className="px-4 pt-10 pb-4 border-b border-forge-border">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/')}
              className="text-forge-muted font-mono text-sm hover:text-forge-text transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-forge-text font-semibold text-lg">
                Semana {week?.number}
              </h1>
              {week?.phase && (
                <p className="text-forge-muted font-mono text-xs uppercase tracking-widest">
                  {week.phase}
                </p>
              )}
            </div>
          </div>

          {/* Progress stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 bg-forge-surface rounded-xl p-3 border border-forge-border">
              <ProgressRing
                value={completedCount}
                max={totalDays}
                size={52}
                strokeWidth={4}
                color="#E24B4A"
                label={`${completedCount}/${totalDays}`}
              />
              <span className="text-forge-muted font-mono text-[10px] uppercase tracking-widest">
                DÍAS
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 bg-forge-surface rounded-xl p-3 border border-forge-border">
              <ProgressRing
                value={completedExercises}
                max={totalExercises}
                size={52}
                strokeWidth={4}
                color="#1D9E75"
                label={`${completedExercises}/${totalExercises}`}
              />
              <span className="text-forge-muted font-mono text-[10px] uppercase tracking-widest">
                EJERC
              </span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 bg-forge-surface rounded-xl p-3 border border-forge-border">
              <span className="text-forge-text font-mono font-bold text-2xl">
                {week?.days.reduce((acc, d) => acc + (d.isCompleted ? d.estimatedMinutes : 0), 0) ?? 0}
              </span>
              <span className="text-forge-muted font-mono text-[10px] uppercase tracking-widest">
                MINUTOS
              </span>
            </div>
          </div>

          {/* AI notes */}
          {week?.aiNotes && (
            <p className="text-forge-muted text-xs leading-relaxed mt-3 border-l-2 border-forge-border pl-3">
              {week.aiNotes}
            </p>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3 max-w-lg mx-auto"
        >
          {DAY_ORDER.map((dow, idx) => {
            const day = week?.days.find(d => d.dayOfWeek === dow)
            if (!day) return null
            const isToday = dow === todayDow
            const isPast = idx < todayIdx

            return (
              <DayCard
                key={day.id}
                day={day}
                isToday={isToday}
                isPast={isPast}
              />
            )
          })}
        </motion.div>
      </main>
    </div>
  )
}
