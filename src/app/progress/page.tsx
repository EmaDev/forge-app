'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'motion/react'
import { useProgram } from '@/hooks/useProgram'
import { useSessions } from '@/hooks/useSessions'
import { LiftChart, type ChartPoint } from '@/components/progress/LiftChart'
import { MetconChart, type MetconPoint } from '@/components/progress/MetconChart'
import { PRBadge } from '@/components/progress/PRBadge'
import { Card } from '@/components/ui/Card'

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function ProgressPage() {
  const router = useRouter()
  const { week } = useProgram(1)
  const { sessions, prs, loading } = useSessions()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Anchor exercises from week data
  const anchorExercises = week?.days
    .flatMap(d => d.blocks.flatMap(b => b.exercises))
    .filter(e => e.isAnchor) ?? []

  const activeKey = selectedKey ?? anchorExercises[0]?.progressionKey ?? null

  // Build lift chart data for selected key
  const liftData: ChartPoint[] = sessions
    .flatMap(sess => {
      const relevantSets = sess.sets.filter(
        s => s.progressionKey === activeKey && s.isComplete && parseFloat(s.weightKg) > 0
      )
      if (relevantSets.length === 0) return []
      const maxWeight = Math.max(...relevantSets.map(s => parseFloat(s.weightKg)))
      const hasPR = relevantSets.some(s => s.isPR)
      return [{
        label: `S${sess.weekNumber}`,
        value: maxWeight,
        isPR: hasPR,
      }]
    })
    .sort((a, b) => a.label.localeCompare(b.label))

  const selectedExercise = anchorExercises.find(e => e.progressionKey === activeKey)

  // Build metcon chart data (Fran as benchmark)
  const franData: MetconPoint[] = sessions
    .flatMap(sess => {
      const result = sess.metconResult as Record<string, unknown>
      if (sess.dayId?.includes('d3') && result?.timeSeconds) {
        return [{ label: `S${sess.weekNumber}`, value: result.timeSeconds as number, isTime: true }]
      }
      return []
    })
    .sort((a, b) => a.label.localeCompare(b.label))

  if (loading) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <span className="text-forge-muted font-mono text-sm animate-pulse">CARGANDO...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forge-bg flex flex-col">
      <header className="px-4 pt-10 pb-4 border-b border-forge-border">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-forge-muted font-mono text-sm hover:text-forge-text transition-colors"
          >
            ←
          </button>
          <h1 className="text-forge-text font-semibold text-lg">Progreso</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-5 max-w-lg mx-auto"
        >
          {/* Lift progression */}
          <motion.div variants={item}>
            <Card className="border border-forge-border">
              <p className="text-forge-muted text-[10px] font-mono uppercase tracking-widest mb-3">
                PROGRESIÓN DE CARGA
              </p>

              {/* Exercise selector */}
              {anchorExercises.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                  {anchorExercises.map(ex => (
                    <button
                      key={ex.progressionKey}
                      onClick={() => setSelectedKey(ex.progressionKey)}
                      className={[
                        'shrink-0 h-8 px-3 rounded-lg font-mono text-xs transition-all border',
                        activeKey === ex.progressionKey
                          ? 'bg-forge-red text-white border-forge-red'
                          : 'bg-forge-surface2 text-forge-muted border-forge-border hover:border-forge-muted',
                      ].join(' ')}
                    >
                      {ex.name.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

              {selectedExercise && (
                <div className="flex items-center justify-between mb-3">
                  <p className="text-forge-text font-semibold text-sm">{selectedExercise.name}</p>
                  {liftData.length > 0 && (
                    <div className="text-right">
                      <p className="text-forge-text font-mono font-bold text-xl leading-none">
                        {liftData[liftData.length - 1].value}kg
                      </p>
                      <p className="text-forge-muted font-mono text-xs">ÚLTIMO</p>
                    </div>
                  )}
                </div>
              )}

              <LiftChart data={liftData} unit="kg" color="#E24B4A" />

              {liftData.length === 0 && (
                <p className="text-forge-muted font-mono text-xs text-center mt-2">
                  Completá sesiones para ver tu progresión
                </p>
              )}
            </Card>
          </motion.div>

          {/* Benchmark WOD — Fran */}
          <motion.div variants={item}>
            <Card className="border border-forge-border">
              <p className="text-forge-muted text-[10px] font-mono uppercase tracking-widest mb-1">
                BENCHMARK — FRAN
              </p>
              <p className="text-forge-text font-semibold text-sm mb-3">21-15-9 Thruster + Pull-up</p>
              <MetconChart data={franData} isTime label="" />
              {franData.length > 0 && (
                <p className="text-forge-muted font-mono text-xs text-right mt-1">
                  Mejor: {franData.reduce((a, b) => a.value < b.value ? a : b).value
                    ? Math.floor(franData.reduce((a, b) => a.value < b.value ? a : b).value / 60) + 'min ' +
                      franData.reduce((a, b) => a.value < b.value ? a : b).value % 60 + 's'
                    : '—'
                  }
                </p>
              )}
              {franData.length === 0 && (
                <p className="text-forge-muted font-mono text-xs text-center">
                  Sin datos — completá el día Miércoles
                </p>
              )}
            </Card>
          </motion.div>

          {/* PRs */}
          <motion.div variants={item}>
            <p className="text-forge-muted text-[10px] font-mono uppercase tracking-widest mb-3 px-1">
              RÉCORDS PERSONALES
            </p>
            {prs.length > 0 ? (
              <div className="flex flex-col gap-2">
                {prs.slice(0, 10).map((pr, i) => (
                  <PRBadge key={pr.id ?? i} pr={pr} index={i} />
                ))}
              </div>
            ) : (
              <Card className="border border-forge-border">
                <p className="text-forge-muted font-mono text-xs text-center py-4">
                  Todavía no hay PRs registrados.{' '}
                  <span className="text-forge-text">Empezá a entrenar.</span>
                </p>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
