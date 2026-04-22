import { ProgressionSignal, AIDecision } from '@/types/program'

export function analyzeSet(signals: Record<string, ProgressionSignal>): Partial<AIDecision>[] {
  const decisions: Partial<AIDecision>[] = []

  for (const [key, signal] of Object.entries(signals)) {
    if (!signal.repsCompleted) continue

    const allCompleted = signal.allSetsCompleted
    const avgRPE = signal.avgRPE ?? 0
    const streak = signal.sameWeightStreak ?? 0

    if (allCompleted && avgRPE <= 8 && !signal.failedLastSet) {
      decisions.push({ progressionKey: key, action: 'INCREASE', deltaKg: 2.5 })
    } else if (!allCompleted && avgRPE >= 9) {
      decisions.push({ progressionKey: key, action: 'DECREASE', deltaKg: -2.5 })
    } else if (streak >= 3) {
      decisions.push({ progressionKey: key, action: 'CHANGE_VARIANT' })
    } else {
      decisions.push({ progressionKey: key, action: 'MAINTAIN' })
    }
  }

  return decisions
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function calcular1RM(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30))
}
