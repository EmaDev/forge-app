'use client'
import { motion, AnimatePresence } from 'motion/react'
import { formatTime } from '@/lib/utils'

interface RestTimerProps {
  seconds: number
  total: number
  onSkip: () => void
}

export function RestTimer({ seconds, total, onSkip }: RestTimerProps) {
  const size = 160
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? seconds / total : 0
  const dashOffset = circumference * (1 - progress)
  const isAlmostDone = seconds <= 5 && seconds > 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forge-bg/95 backdrop-blur-sm"
      >
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-forge-muted font-mono text-xs uppercase tracking-widest mb-8"
        >
          DESCANSO
        </motion.p>

        <div className="relative">
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#2A2A2A"
              strokeWidth={strokeWidth}
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={isAlmostDone ? '#F5A623' : '#E24B4A'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.5, ease: 'linear' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={seconds}
              initial={{ scale: 1.2, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-mono font-bold text-4xl text-forge-text"
            >
              {formatTime(seconds)}
            </motion.span>
          </div>
        </div>

        {seconds === 0 ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="mt-8 text-forge-green font-mono font-bold text-xl"
          >
            ¡LISTO!
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onSkip}
            className="mt-8 h-11 px-8 rounded-xl border border-forge-border text-forge-muted font-mono text-sm hover:text-forge-text hover:border-forge-muted transition-all"
          >
            SALTAR
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
