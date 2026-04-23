'use client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SetRow } from './SetRow'
import type { Day, Metcon, MetconFormat, MetconResult } from '@/types/program'
import type { SessionRecord } from '@/hooks/useSessions'
import type { SetInput } from '@/hooks/useSession'

function formatMetconScore(format: MetconFormat, result: MetconResult): string {
  if (format === 'AMRAP') {
    const r = result.rounds ?? 0
    const p = result.partialReps ?? 0
    return p > 0 ? `${r}+${p}` : `${r} rondas`
  }
  if (format === 'FOR_TIME' && result.timeSeconds != null) {
    const m = Math.floor(result.timeSeconds / 60)
    const s = result.timeSeconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }
  if (format === 'EMOM') return `${result.completedMinutes ?? 0} min completados`
  if (format === 'DEATH_BY') return `Último min: ${result.lastMinuteCompleted ?? 0}`
  return ''
}

function MetconResultView({ metcon, result }: { metcon: Metcon; result: MetconResult }) {
  const score = formatMetconScore(metcon.format, result)

  return (
    <Card className="border border-forge-amber/20 bg-forge-amber/5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="warning" className="text-[10px]">{metcon.format}</Badge>
            <span className="text-forge-muted font-mono text-xs">{metcon.durationMinutes} MIN</span>
          </div>
          <h3 className="text-forge-text font-semibold text-base">{metcon.label}</h3>
        </div>
        {score && (
          <span className="text-forge-amber font-mono font-bold text-lg ml-3 shrink-0">{score}</span>
        )}
      </div>

      <div className="flex flex-col gap-1 mb-3">
        {metcon.movements.map((m, i) => (
          <div key={i} className="flex items-baseline gap-2">
            <span className="text-forge-red font-mono font-bold text-sm w-12 text-right">{m.reps}</span>
            <span className="text-forge-text text-sm">{m.name}</span>
            {m.load && <span className="text-forge-muted font-mono text-xs">@ {m.load}</span>}
          </div>
        ))}
      </div>

      {result.notes && (
        <p className="text-forge-muted text-xs border-l-2 border-forge-amber/40 pl-2 leading-relaxed">
          {result.notes}
        </p>
      )}
    </Card>
  )
}

interface Props {
  day: Day
  session: SessionRecord
}

export function CompletedSessionView({ day, session }: Props) {
  const setsByExercise = session.sets.reduce<Record<string, typeof session.sets>>((acc, s) => {
    if (!acc[s.exerciseId]) acc[s.exerciseId] = []
    acc[s.exerciseId].push(s)
    return acc
  }, {})

  const completedAt = new Date(session.completedAt)
  const dateStr = completedAt.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-forge-green/10 border border-forge-green/20">
        <span className="text-forge-green text-xl">✓</span>
        <div>
          <p className="text-forge-green font-mono font-semibold text-sm tracking-widest">SESIÓN COMPLETADA</p>
          <p className="text-forge-muted font-mono text-xs capitalize">{dateStr}</p>
        </div>
      </div>

      {day.blocks.map(block => (
        <section key={block.id}>
          <p className="text-forge-muted text-[10px] font-mono uppercase tracking-widest mb-3 px-1">
            {block.label}
          </p>
          <div className="flex flex-col gap-3">
            {block.exercises.map(exercise => {
              const sets = setsByExercise[exercise.id] ?? []
              const isGrip = exercise.type === 'grip'

              return (
                <Card key={exercise.id} className="border border-forge-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-forge-green">✓</span>
                      <h3 className="text-forge-text font-semibold text-sm">{exercise.name}</h3>
                    </div>
                    <span className="text-forge-muted font-mono text-xs">
                      {sets.length}×{exercise.targetReps}{isGrip ? 's' : ''}
                    </span>
                  </div>

                  {sets.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {sets.map((set, idx) => (
                        <SetRow
                          key={idx}
                          setIndex={idx}
                          targetReps={exercise.targetReps}
                          targetWeightKg={exercise.targetWeightKg}
                          isGrip={isGrip}
                          data={set as SetInput}
                          onChange={() => {}}
                          onComplete={() => {}}
                          isActive={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-forge-muted font-mono text-xs">Sin datos registrados</p>
                  )}
                </Card>
              )
            })}
          </div>
        </section>
      ))}

      <section>
        <p className="text-forge-muted text-[10px] font-mono uppercase tracking-widest mb-3 px-1">
          METCON — {day.metcon.format}
        </p>
        <MetconResultView
          metcon={day.metcon}
          result={session.metconResult as MetconResult}
        />
      </section>
    </div>
  )
}
