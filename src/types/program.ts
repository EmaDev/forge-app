export type ExerciseType = 'olympic' | 'strength' | 'hypertrophy' | 'accessory' | 'grip' | 'explosive'
export type MetconFormat = 'AMRAP' | 'EMOM' | 'FOR_TIME' | 'DEATH_BY'
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

export interface Set {
  id: string
  exerciseId: string
  setNumber: number
  targetReps: number | string
  completedReps: number | null
  weightKg: number | null
  rpe: number | null
  isPR: boolean
  notes?: string
  completedAt?: string
}

export interface Exercise {
  id: string
  name: string
  type: ExerciseType
  isAnchor: boolean
  targetSets: number
  targetReps: string
  targetWeightKg: number
  targetRPE: number
  restSeconds: number
  loadPercent1RM: number | null
  notes: string | null
  progressionKey: string
  sets: Set[]
}

export interface Block {
  id: string
  type: ExerciseType
  order: number
  label: string
  exercises: Exercise[]
}

export interface MetconMovement {
  name: string
  reps: number | string
  load: string | null
  notes: string | null
}

export interface MetconResult {
  rounds?: number | null
  partialReps?: number | null
  timeSeconds?: number | null
  lastMinuteCompleted?: number | null
  completedMinutes?: number | null
  totalMinutes?: number | null
  notes?: string | null
}

export interface Metcon {
  id: string
  format: MetconFormat
  durationMinutes: number
  label: string
  focusArea: string
  movements: MetconMovement[]
  result: MetconResult
  progressionKey: string
  scoringNote?: string
  isBenchmarkWOD?: boolean
}

export interface Day {
  id: string
  dayOfWeek: DayOfWeek
  order: number
  name: string
  focus: string[]
  estimatedMinutes: number
  blocks: Block[]
  metcon: Metcon
  completedAt?: string
  isCompleted?: boolean
}

export interface Week {
  number: number
  phase: string
  generatedAt: string
  generatedBy: string
  aiNotes: string
  days: Day[]
}

export interface ProgressionSignal {
  allSetsCompleted: boolean | null
  failedLastSet: boolean | null
  repsCompleted: number[] | null
  avgRPE: number | null
  sameWeightStreak: number
  prHit: boolean
  prWeightKg?: number
  decision?: string
}

export interface MetconSignal {
  score: number | null
  previousScore: number | null
  improved: boolean | null
  decision?: string
}

export interface WeeklyFeedback {
  weekNumber: number
  submittedAt: string | null
  energyAvg: number | null
  sleepAvg: number | null
  sorenessAvg: number | null
  motivation: number | null
  missedSessions: number | null
  userComment: string | null
  progressionSignals: Record<string, ProgressionSignal | MetconSignal>
}

export interface AIDecision {
  progressionKey: string
  action: 'INCREASE' | 'MAINTAIN' | 'DECREASE' | 'CHANGE_VARIANT' | 'DELOAD' | 'MAINTAIN_WITH_TEST'
  weeklyTargetKg?: number
  deltaKg?: number
  testWeightKg?: number
  reason: string
}

export interface AIAnalysis {
  weekNumber: number
  generatedAt: string
  model: string
  overallAssessment: string
  decisions: AIDecision[]
  metconTargets: Record<string, { target: number | null; note: string }>
  gripProgression: Record<string, { target: number; note: string }>
  alerts: Array<{ type: string; severity: 'high' | 'medium' | 'info'; message: string }>
  motivationalMessage: string
}

export interface PR {
  id: string
  progressionKey: string
  exerciseName: string
  weightKg: number
  reps: number
  achievedAt: string
  week: number
}

export interface Streak {
  current: number
  record: number
  lastSessionAt: string | null
  weeklyCompletionRate: number | null
}

export interface Program {
  id: string
  userId: string
  createdAt: string
  currentWeek: number
  totalWeeks: number
  phase: string
  goal: string
  benchmarks: {
    fran_time_seconds: number | null
    estimated_1rm: Record<string, number>
    body: Record<string, number | string>
  }
}
