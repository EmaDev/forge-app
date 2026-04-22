'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RPESelector } from '@/components/ui/RPESelector'
import { Badge } from '@/components/ui/Badge'
import { useStopwatch } from '@/hooks/useTimer'
import { formatTime } from '@/lib/utils'
import type { SetInput } from '@/hooks/useSession'

interface SetRowProps {
  setIndex: number
  targetReps: string
  targetWeightKg: number
  isGrip: boolean
  data: SetInput
  onChange: (data: Partial<SetInput>) => void
  onComplete: () => void
  isActive: boolean
}

export function SetRow({
  setIndex,
  targetReps,
  targetWeightKg,
  isGrip,
  data,
  onChange,
  onComplete,
  isActive,
}: SetRowProps) {
  const sw = useStopwatch()
  const [expanded, setExpanded] = useState(false)

  const canComplete = isGrip
    ? (data.completedReps !== '' && data.rpe !== null)
    : (data.completedReps !== '' && data.rpe !== null)

  function handleComplete() {
    if (!canComplete) return
    if (isGrip && sw.running) sw.stop()
    onComplete()
  }

  function handleStopwatch() {
    if (sw.running) {
      sw.stop()
      onChange({ completedReps: String(sw.seconds) })
    } else {
      sw.reset()
      sw.start()
    }
  }

  if (data.isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-forge-green/10 border border-forge-green/20"
      >
        <span className="text-forge-green font-mono text-xs w-5">✓</span>
        <span className="text-forge-muted font-mono text-xs w-12">SET {setIndex + 1}</span>
        <span className="text-forge-text font-mono text-sm font-semibold flex-1">
          {data.completedReps}{isGrip ? 's' : ' reps'}
          {data.weightKg && parseFloat(data.weightKg) > 0 && (
            <span className="text-forge-muted"> · {data.weightKg}kg</span>
          )}
        </span>
        {data.isPR && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Badge variant="warning" className="text-[10px] font-mono">PR</Badge>
          </motion.div>
        )}
        <span className="text-forge-muted font-mono text-xs">RPE {data.rpe}</span>
      </motion.div>
    )
  }

  return (
    <div
      className={[
        'rounded-lg border transition-all',
        isActive
          ? 'border-forge-red/40 bg-forge-red/5'
          : 'border-forge-border bg-forge-surface2 opacity-60',
      ].join(' ')}
    >
      <button
        className="w-full flex items-center gap-3 py-2.5 px-3 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-forge-muted font-mono text-xs w-12">SET {setIndex + 1}</span>
        <span className="text-forge-muted font-mono text-xs flex-1">
          {targetReps}{isGrip ? 's' : ' reps'}{targetWeightKg > 0 ? ` · ${targetWeightKg}kg` : ''}
        </span>
        <span className="text-forge-muted text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {(isActive || expanded) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 flex flex-col gap-3">
              <div className="flex gap-2">
                {isGrip ? (
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-forge-muted text-[10px] font-mono uppercase tracking-widest">
                      TIEMPO
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xl font-bold text-forge-text w-16">
                        {formatTime(sw.running ? sw.seconds : (parseInt(data.completedReps) || 0))}
                      </span>
                      <button
                        onClick={handleStopwatch}
                        className={[
                          'h-10 px-4 rounded-lg font-mono text-sm font-semibold transition-all',
                          sw.running
                            ? 'bg-forge-amber text-black'
                            : 'bg-forge-surface border border-forge-border text-forge-text',
                        ].join(' ')}
                      >
                        {sw.running ? 'STOP' : data.completedReps ? 'RESET' : 'START'}
                      </button>
                    </div>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="o escribir segundos"
                      value={data.completedReps}
                      onChange={e => onChange({ completedReps: e.target.value })}
                      className="h-10 w-full rounded-lg bg-forge-surface border border-forge-border text-forge-text font-mono text-sm px-3 placeholder:text-forge-border focus:outline-none focus:border-forge-muted"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-forge-muted text-[10px] font-mono uppercase tracking-widest">REPS</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder={targetReps}
                        value={data.completedReps}
                        onChange={e => onChange({ completedReps: e.target.value })}
                        className="h-12 w-full rounded-lg bg-forge-surface border border-forge-border text-forge-text font-mono text-xl text-center font-bold placeholder:text-forge-border focus:outline-none focus:border-forge-muted"
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-forge-muted text-[10px] font-mono uppercase tracking-widest">KG</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        placeholder={String(targetWeightKg || '')}
                        value={data.weightKg}
                        onChange={e => onChange({ weightKg: e.target.value })}
                        className="h-12 w-full rounded-lg bg-forge-surface border border-forge-border text-forge-text font-mono text-xl text-center font-bold placeholder:text-forge-border focus:outline-none focus:border-forge-muted"
                      />
                    </div>
                  </>
                )}
              </div>

              <RPESelector value={data.rpe} onChange={rpe => onChange({ rpe })} />

              <button
                onClick={handleComplete}
                disabled={!canComplete}
                className={[
                  'h-11 w-full rounded-lg font-mono text-sm font-semibold transition-all',
                  canComplete
                    ? 'bg-forge-red text-white active:scale-95'
                    : 'bg-forge-surface border border-forge-border text-forge-muted cursor-not-allowed',
                ].join(' ')}
              >
                COMPLETAR SET
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
