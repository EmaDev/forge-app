'use client'
import { motion } from 'motion/react'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { PR } from '@/types/program'

interface PRBadgeProps {
  pr: PR
  index?: number
}

export function PRBadge({ pr, index = 0 }: PRBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="flex items-center gap-3 py-3 px-4 rounded-xl bg-forge-amber/8 border border-forge-amber/25"
    >
      <Badge variant="warning" className="shrink-0">PR</Badge>
      <div className="flex-1 min-w-0">
        <p className="text-forge-text text-sm font-semibold truncate">{pr.exerciseName}</p>
        <p className="text-forge-muted font-mono text-xs">Semana {pr.week}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-forge-amber font-mono font-bold text-lg leading-none">{pr.weightKg}kg</p>
        {pr.reps > 0 && (
          <p className="text-forge-muted font-mono text-xs">×{pr.reps}</p>
        )}
      </div>
    </motion.div>
  )
}
