'use client'
import { motion, AnimatePresence } from 'motion/react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SetRow } from './SetRow'
import type { Exercise } from '@/types/program'
import type { SetInput } from '@/hooks/useSession'

const TYPE_LABELS: Record<string, string> = {
  olympic: 'OLÍMPICO',
  strength: 'FUERZA',
  hypertrophy: 'HIPER',
  accessory: 'ACCESORIO',
  grip: 'GRIP',
  explosive: 'EXPLOSIVO',
}

interface ExerciseCardProps {
  exercise: Exercise
  sets: SetInput[]
  onUpdateSet: (setIndex: number, data: Partial<SetInput>) => void
  onCompleteSet: (setIndex: number) => void
  isAllComplete: boolean
}

export function ExerciseCard({
  exercise,
  sets,
  onUpdateSet,
  onCompleteSet,
  isAllComplete,
}: ExerciseCardProps) {
  const isGrip = exercise.type === 'grip'
  const firstIncompleteIdx = sets.findIndex(s => !s.isComplete)

  return (
    <AnimatePresence>
      {isAllComplete ? (
        <motion.div
          key="complete"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 py-3 px-4 rounded-xl bg-forge-green/10 border border-forge-green/20"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="text-forge-green text-lg"
          >
            ✓
          </motion.span>
          <span className="text-forge-text font-semibold text-sm flex-1">{exercise.name}</span>
          <span className="text-forge-muted font-mono text-xs">
            {sets.length}×{exercise.targetReps}{isGrip ? 's' : ''}
          </span>
        </motion.div>
      ) : (
        <motion.div
          key="active"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="border border-forge-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="muted" className="text-[10px]">
                    {TYPE_LABELS[exercise.type] ?? exercise.type}
                  </Badge>
                  {exercise.isAnchor && (
                    <Badge variant="danger" className="text-[10px]">ANCLA</Badge>
                  )}
                </div>
                <h3 className="text-forge-text font-semibold text-base leading-tight">
                  {exercise.name}
                </h3>
              </div>
              <div className="text-right ml-3">
                <p className="text-forge-text font-mono font-bold text-lg leading-none">
                  {sets.length}×{exercise.targetReps}{isGrip ? 's' : ''}
                </p>
                {exercise.targetWeightKg > 0 && (
                  <p className="text-forge-muted font-mono text-sm mt-0.5">
                    {exercise.targetWeightKg}kg
                  </p>
                )}
              </div>
            </div>

            {exercise.notes && (
              <p className="text-forge-muted text-xs mb-3 leading-relaxed border-l-2 border-forge-border pl-2">
                {exercise.notes}
              </p>
            )}

            <div className="flex flex-col gap-2">
              {sets.map((set, idx) => (
                <SetRow
                  key={idx}
                  setIndex={idx}
                  targetReps={exercise.targetReps}
                  targetWeightKg={exercise.targetWeightKg}
                  isGrip={isGrip}
                  data={set}
                  onChange={data => onUpdateSet(idx, data)}
                  onComplete={() => onCompleteSet(idx)}
                  isActive={idx === firstIncompleteIdx}
                />
              ))}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-forge-border">
              <span className="text-forge-muted font-mono text-xs">
                DESCANSO {exercise.restSeconds}s
              </span>
              <span className="text-forge-muted font-mono text-xs">
                RPE OBJ {exercise.targetRPE}
              </span>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
