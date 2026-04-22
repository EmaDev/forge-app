'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getDayName } from '@/lib/utils'
import type { Day } from '@/types/program'

const TYPE_SHORT: Record<string, string> = {
  olympic: 'OLÍ',
  strength: 'FZA',
  hypertrophy: 'HIP',
  accessory: 'ACC',
  grip: 'GRIP',
  explosive: 'EXP',
}

const FORMAT_COLOR: Record<string, string> = {
  AMRAP: 'text-forge-green',
  EMOM: 'text-forge-amber',
  FOR_TIME: 'text-forge-red',
  DEATH_BY: 'text-forge-red',
}

interface DayCardProps {
  day: Day
  isToday: boolean
  isPast: boolean
}

export function DayCard({ day, isToday, isPast }: DayCardProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(isToday && !day.isCompleted)

  const totalExercises = day.blocks.reduce((acc, b) => acc + b.exercises.length, 0)

  const borderClass = day.isCompleted
    ? 'border-forge-green/30'
    : isToday
      ? 'border-forge-red/50'
      : 'border-forge-border'

  const opacityClass = isPast && !day.isCompleted ? 'opacity-50' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={opacityClass}
    >
      <Card className={`border ${borderClass} relative overflow-hidden`}>
        {/* Left accent bar */}
        {(isToday || day.isCompleted) && (
          <div
            className={`absolute top-0 left-0 w-1 h-full ${day.isCompleted ? 'bg-forge-green' : 'bg-forge-red'}`}
          />
        )}

        <div className={isToday || day.isCompleted ? 'pl-3' : ''}>
          {/* Header row — always visible */}
          <button
            className="w-full flex items-start gap-3 text-left"
            onClick={() => setExpanded(e => !e)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-forge-muted font-mono text-[10px] uppercase tracking-widest">
                  {getDayName(day.dayOfWeek).toUpperCase()}
                </span>
                {isToday && !day.isCompleted && (
                  <Badge variant="danger" className="text-[10px] py-0">HOY</Badge>
                )}
                {day.isCompleted && (
                  <Badge variant="success" className="text-[10px] py-0">✓ COMPLETO</Badge>
                )}
              </div>
              <h3 className="text-forge-text font-semibold text-base leading-tight truncate">
                {day.name}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {day.focus.map(f => (
                  <span key={f} className="text-forge-muted font-mono text-[10px] uppercase">
                    {f}
                  </span>
                )).reduce((acc: React.ReactNode[], el, i) => [
                  ...acc,
                  i > 0 ? <span key={`sep-${i}`} className="text-forge-border font-mono text-[10px]">·</span> : null,
                  el,
                ], [])}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-forge-muted font-mono text-xs">{day.estimatedMinutes} MIN</span>
              <span className="text-forge-muted font-mono text-xs">{totalExercises} EJERC</span>
              <span className="text-forge-muted text-xs mt-1">{expanded ? '▲' : '▼'}</span>
            </div>
          </button>

          {/* Expandable content */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 flex flex-col gap-4">
                  {/* Blocks */}
                  {day.blocks.map(block => (
                    <div key={block.id}>
                      <p className="text-forge-muted text-[10px] font-mono uppercase tracking-widest mb-2">
                        {block.label}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {block.exercises.map(ex => (
                          <div
                            key={ex.id}
                            className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-forge-surface2"
                          >
                            <span className="text-forge-muted font-mono text-[10px] w-8 shrink-0">
                              {TYPE_SHORT[ex.type] ?? ex.type.slice(0, 3).toUpperCase()}
                            </span>
                            <span className="text-forge-text text-sm flex-1 leading-tight">
                              {ex.name}
                            </span>
                            <span className="text-forge-muted font-mono text-xs shrink-0">
                              {ex.targetSets}×{ex.targetReps}
                            </span>
                            {ex.targetWeightKg > 0 && (
                              <span className="text-forge-muted font-mono text-xs shrink-0">
                                {ex.targetWeightKg}kg
                              </span>
                            )}
                            {ex.isAnchor && (
                              <span className="text-forge-red font-mono text-[10px] shrink-0">★</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Metcon */}
                  <div>
                    <p className="text-forge-muted text-[10px] font-mono uppercase tracking-widest mb-2">
                      METCON
                    </p>
                    <div className="rounded-lg bg-forge-surface2 px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-mono text-xs font-bold ${FORMAT_COLOR[day.metcon.format] ?? 'text-forge-text'}`}>
                          {day.metcon.format}
                        </span>
                        <span className="text-forge-muted font-mono text-xs">
                          {day.metcon.durationMinutes} MIN
                        </span>
                        <span className="text-forge-text text-sm font-semibold ml-auto">
                          {day.metcon.label}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {day.metcon.movements.map((m, i) => (
                          <div key={i} className="flex items-baseline gap-2">
                            <span className="text-forge-red font-mono text-xs w-8 text-right shrink-0">
                              {m.reps}
                            </span>
                            <span className="text-forge-text text-xs">{m.name}</span>
                            {m.load && (
                              <span className="text-forge-muted font-mono text-[10px]">@ {m.load}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  {!day.isCompleted && (
                    <button
                      onClick={() => router.push(`/session/${day.id}`)}
                      className={[
                        'w-full h-11 rounded-xl font-mono text-sm font-semibold transition-all active:scale-95',
                        isToday
                          ? 'bg-forge-red text-white hover:bg-[#c73f3e]'
                          : 'bg-forge-surface border border-forge-border text-forge-text hover:border-forge-muted',
                      ].join(' ')}
                    >
                      {isToday ? 'EMPEZAR SESIÓN' : 'VER SESIÓN'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  )
}
