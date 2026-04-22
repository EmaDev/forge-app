'use client'
import { motion, type Variants } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useProgram } from '@/hooks/useProgram'
import { useStreak } from '@/hooks/useStreak'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { getTodayDayOfWeek, getDayName } from '@/lib/utils'
import type { Day } from '@/types/program'

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
}

export default function Dashboard() {
  const router = useRouter()
  const { week, aiAnalysis, loading } = useProgram(1)
  const { streak } = useStreak()

  const todayDow = getTodayDayOfWeek()
  const todaySession: Day | undefined = week?.days.find(d => d.dayOfWeek === todayDow)
  const completedCount = week?.days.filter(d => d.isCompleted).length ?? 0
  const totalDays = week?.days.length ?? 5

  if (loading) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <div className="text-forge-muted font-mono text-sm animate-pulse">CARGANDO...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forge-bg flex flex-col">
      {/* Header */}
      <header className="px-4 pt-10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-forge-red font-mono font-bold text-2xl tracking-widest">FORGE</h1>
          {week && (
            <p className="text-forge-muted text-xs font-mono mt-0.5">
              SEMANA {week.number} — {week.phase.toUpperCase()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {streak.current > 0 && (
            <Badge variant="warning" className="font-mono text-sm px-3 py-1">
              {streak.current} DÍAS
            </Badge>
          )}
          <ProgressRing
            value={completedCount}
            max={totalDays}
            size={44}
            strokeWidth={3}
            color="#E24B4A"
            label={`${completedCount}/${totalDays}`}
          />
        </div>
      </header>

      <main className="flex-1 px-4 pb-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4 max-w-lg mx-auto"
        >
          {/* Today's session */}
          <motion.div variants={item}>
            {todaySession ? (
              <Card className="border border-forge-border bg-forge-surface relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-forge-red" />
                <CardContent className="pl-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-forge-muted text-xs font-mono uppercase tracking-widest mb-1">
                        HOY — {getDayName(todaySession.dayOfWeek).toUpperCase()}
                      </p>
                      <h2 className="text-forge-text font-semibold text-xl leading-tight">
                        {todaySession.name}
                      </h2>
                    </div>
                    {todaySession.isCompleted && (
                      <Badge variant="success">COMPLETO</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {todaySession.focus.map(f => (
                      <Badge key={f} variant="muted" className="capitalize">
                        {f}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-forge-muted text-sm font-mono">
                    <span>{todaySession.estimatedMinutes} MIN</span>
                    <span>·</span>
                    <span>{todaySession.blocks.reduce((acc, b) => acc + b.exercises.length, 0)} EJERCICIOS</span>
                    <span>·</span>
                    <span>{todaySession.metcon.format}</span>
                  </div>

                  {!todaySession.isCompleted && (
                    <Button
                      size="lg"
                      onClick={() => router.push(`/session/${todaySession.id}`)}
                    >
                      EMPEZAR SESIÓN
                    </Button>
                  )}
                  {todaySession.isCompleted && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => router.push(`/session/${todaySession.id}`)}
                    >
                      VER SESIÓN
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-forge-border">
                <CardContent>
                  <p className="text-forge-muted text-sm font-mono text-center py-4">
                    HOY NO HAY SESIÓN PROGRAMADA.{' '}
                    <span className="text-forge-text">DESCANSÁ.</span>
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Week grid */}
          <motion.div variants={item}>
            <p className="text-forge-muted text-xs font-mono uppercase tracking-widest mb-2 px-1">
              SEMANA
            </p>
            <div className="grid grid-cols-5 gap-2">
              {DAY_ORDER.map(dow => {
                const day = week?.days.find(d => d.dayOfWeek === dow)
                const isToday = dow === todayDow
                const isCompleted = day?.isCompleted
                const isPast = !isCompleted && DAY_ORDER.indexOf(dow) < DAY_ORDER.indexOf(todayDow)

                return (
                  <button
                    key={dow}
                    onClick={() => day && router.push(`/session/${day.id}`)}
                    className={[
                      'rounded-lg p-2 flex flex-col items-center gap-1 transition-all',
                      isToday && !isCompleted
                        ? 'bg-forge-red/10 border border-forge-red/50'
                        : isCompleted
                          ? 'bg-forge-green/10 border border-forge-green/30'
                          : isPast
                            ? 'bg-forge-surface border border-forge-border opacity-40'
                            : 'bg-forge-surface border border-forge-border',
                    ].join(' ')}
                  >
                    <span className="text-forge-muted text-[10px] font-mono uppercase">
                      {getDayName(dow).slice(0, 3)}
                    </span>
                    <span className={[
                      'text-xs font-mono font-semibold',
                      isCompleted ? 'text-forge-green' : isToday ? 'text-forge-red' : 'text-forge-text',
                    ].join(' ')}>
                      {isCompleted ? '✓' : day ? day.order.toString() : '—'}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* AI message */}
          {aiAnalysis?.motivationalMessage && (
            <motion.div variants={item}>
              <Card className="border border-forge-amber/20 bg-forge-amber/5">
                <CardContent>
                  <p className="text-forge-muted text-[10px] font-mono uppercase tracking-widest mb-2">
                    IA — ANÁLISIS SEMANAL
                  </p>
                  <p className="text-forge-text text-sm leading-relaxed">
                    {aiAnalysis.motivationalMessage}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Nav shortcuts */}
          <motion.div variants={item} className="grid grid-cols-3 gap-2 mt-2">
            {[
              { label: 'SEMANA', path: '/weekly' },
              { label: 'PROGRESO', path: '/progress' },
              { label: 'HISTORIAL', path: '/history' },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => router.push(path)}
                className="bg-forge-surface border border-forge-border rounded-lg py-3 text-forge-muted text-xs font-mono tracking-wider hover:text-forge-text hover:border-forge-muted transition-all"
              >
                {label}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
