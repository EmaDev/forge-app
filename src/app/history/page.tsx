'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, type Variants } from 'motion/react'
import { useSessions } from '@/hooks/useSessions'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { SessionRecord } from '@/hooks/useSessions'

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

function SessionCard({ session, index }: { session: SessionRecord; index: number }) {
  const [expanded, setExpanded] = useState(false)

  const completedSets = session.sets.filter(s => s.isComplete)
  const prSets = completedSets.filter(s => s.isPR)

  // Group sets by exercise
  const byExercise = completedSets.reduce<Record<string, typeof completedSets>>((acc, s) => {
    if (!acc[s.exerciseName]) acc[s.exerciseName] = []
    acc[s.exerciseName].push(s)
    return acc
  }, {})

  const metcon = session.metconResult as Record<string, unknown>
  const hasMetcon = Object.values(metcon).some(v => v != null && v !== '')

  return (
    <motion.div variants={item}>
      <Card className="border border-forge-border">
        <button className="w-full flex items-start gap-3 text-left" onClick={() => setExpanded(e => !e)}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-forge-muted font-mono text-[10px] uppercase tracking-widest">
                Semana {session.weekNumber}
              </span>
              {prSets.length > 0 && (
                <Badge variant="warning" className="text-[10px] py-0">
                  {prSets.length} PR{prSets.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <h3 className="text-forge-text font-semibold text-sm">{session.dayName}</h3>
            <p className="text-forge-muted font-mono text-xs mt-0.5">
              {session.completedAt ? formatDate(session.completedAt) : '—'}
            </p>
          </div>
          <div className="text-right shrink-0 flex flex-col items-end gap-1">
            <span className="text-forge-text font-mono text-sm font-semibold">
              {completedSets.length} sets
            </span>
            <span className="text-forge-muted text-xs">{expanded ? '▲' : '▼'}</span>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-3 border-t border-forge-border flex flex-col gap-3">
                {/* Sets by exercise */}
                {Object.entries(byExercise).map(([name, sets]) => (
                  <div key={name}>
                    <p className="text-forge-muted font-mono text-[10px] uppercase tracking-widest mb-1.5">
                      {name}
                    </p>
                    <div className="flex flex-col gap-1">
                      {sets.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-forge-surface2"
                        >
                          <span className="text-forge-muted font-mono text-xs w-12">
                            SET {s.completedReps && parseFloat(s.weightKg) === 0 ? '' : (i + 1)}
                          </span>
                          <span className="text-forge-text font-mono text-sm font-semibold flex-1">
                            {s.completedReps}
                            {parseFloat(s.weightKg) > 0 && (
                              <span className="text-forge-muted font-normal"> × {s.weightKg}kg</span>
                            )}
                          </span>
                          {s.isPR && <Badge variant="warning" className="text-[10px]">PR</Badge>}
                          {s.rpe && (
                            <span className="text-forge-muted font-mono text-xs">RPE {s.rpe}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Metcon result */}
                {hasMetcon && (
                  <div>
                    <p className="text-forge-muted font-mono text-[10px] uppercase tracking-widest mb-1.5">
                      METCON
                    </p>
                    <div className="py-2 px-3 rounded-lg bg-forge-surface2">
                      {metcon.timeSeconds != null && (
                        <p className="text-forge-text font-mono text-sm">
                          Tiempo:{' '}
                          <span className="font-bold text-forge-amber">
                            {Math.floor((metcon.timeSeconds as number) / 60)}:{String((metcon.timeSeconds as number) % 60).padStart(2, '0')}
                          </span>
                        </p>
                      )}
                      {metcon.rounds != null && (
                        <p className="text-forge-text font-mono text-sm">
                          Rondas:{' '}
                          <span className="font-bold text-forge-green">
                            {metcon.rounds as number}
                            {metcon.partialReps != null ? ` + ${metcon.partialReps}` : ''}
                          </span>
                        </p>
                      )}
                      {metcon.completedMinutes != null && (
                        <p className="text-forge-text font-mono text-sm">
                          Minutos:{' '}
                          <span className="font-bold text-forge-green">{metcon.completedMinutes as number}</span>
                        </p>
                      )}
                      {typeof metcon.notes === 'string' && metcon.notes !== '' && (
                        <p className="text-forge-muted text-xs mt-1">{metcon.notes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

export default function HistoryPage() {
  const router = useRouter()
  const { sessions, loading } = useSessions()

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
          <div>
            <h1 className="text-forge-text font-semibold text-lg">Historial</h1>
            {!loading && (
              <p className="text-forge-muted font-mono text-xs">
                {sessions.length} SESIÓN{sessions.length !== 1 ? 'ES' : ''} COMPLETADA{sessions.length !== 1 ? 'S' : ''}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-forge-muted font-mono text-sm animate-pulse">CARGANDO...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-forge-muted font-mono text-sm">SIN SESIONES REGISTRADAS</p>
            <button
              onClick={() => router.push('/')}
              className="text-forge-red font-mono text-sm"
            >
              EMPEZAR A ENTRENAR →
            </button>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3 max-w-lg mx-auto"
          >
            {sessions.map((session, i) => (
              <SessionCard key={session.id ?? i} session={session} index={i} />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}
