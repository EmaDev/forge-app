'use client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Metcon, MetconResult } from '@/types/program'

interface MetconCardProps {
  metcon: Metcon
  result: MetconResult
  onChange: (result: MetconResult) => void
}

function TimeInput({ value, onChange }: { value: number | null; onChange: (s: number) => void }) {
  const minutes = value != null ? Math.floor(value / 60) : ''
  const seconds = value != null ? value % 60 : ''

  function handleChange(field: 'min' | 'sec', val: string) {
    const n = parseInt(val) || 0
    const m = field === 'min' ? n : (typeof minutes === 'number' ? minutes : 0)
    const s = field === 'sec' ? n : (typeof seconds === 'number' ? seconds : 0)
    onChange(m * 60 + s)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-1 flex-1">
        <span className="text-forge-muted text-[10px] font-mono uppercase tracking-widest">MIN</span>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          value={typeof minutes === 'number' ? minutes : ''}
          onChange={e => handleChange('min', e.target.value)}
          className="h-12 w-full rounded-lg bg-forge-surface border border-forge-border text-forge-text font-mono text-2xl text-center font-bold placeholder:text-forge-border focus:outline-none focus:border-forge-muted"
        />
      </div>
      <span className="text-forge-muted font-mono text-2xl mt-4">:</span>
      <div className="flex flex-col gap-1 flex-1">
        <span className="text-forge-muted text-[10px] font-mono uppercase tracking-widest">SEG</span>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          max="59"
          value={typeof seconds === 'number' ? seconds : ''}
          onChange={e => handleChange('sec', e.target.value)}
          className="h-12 w-full rounded-lg bg-forge-surface border border-forge-border text-forge-text font-mono text-2xl text-center font-bold placeholder:text-forge-border focus:outline-none focus:border-forge-muted"
        />
      </div>
    </div>
  )
}

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: number | null | undefined
  onChange: (n: number | null) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <span className="text-forge-muted text-[10px] font-mono uppercase tracking-widest">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        placeholder={placeholder ?? '0'}
        value={value ?? ''}
        onChange={e => onChange(e.target.value ? parseInt(e.target.value) : null)}
        className="h-12 w-full rounded-lg bg-forge-surface border border-forge-border text-forge-text font-mono text-2xl text-center font-bold placeholder:text-forge-border focus:outline-none focus:border-forge-muted"
      />
    </div>
  )
}

export function MetconCard({ metcon, result, onChange }: MetconCardProps) {
  return (
    <Card className="border border-forge-amber/20 bg-forge-amber/5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="warning" className="text-[10px]">{metcon.format}</Badge>
            {metcon.isBenchmarkWOD && (
              <Badge variant="warning" className="text-[10px]">BENCHMARK</Badge>
            )}
            <span className="text-forge-muted font-mono text-xs">{metcon.durationMinutes} MIN</span>
          </div>
          <h3 className="text-forge-text font-semibold text-base">{metcon.label}</h3>
        </div>
      </div>

      <div className="flex flex-col gap-1 mb-4">
        {metcon.movements.map((m, i) => (
          <div key={i} className="flex items-baseline gap-2">
            <span className="text-forge-red font-mono font-bold text-sm w-12 text-right">
              {m.reps}
            </span>
            <span className="text-forge-text text-sm">{m.name}</span>
            {m.load && (
              <span className="text-forge-muted font-mono text-xs">@ {m.load}</span>
            )}
          </div>
        ))}
      </div>

      {metcon.scoringNote && (
        <p className="text-forge-muted text-xs mb-4 border-l-2 border-forge-amber/40 pl-2 leading-relaxed">
          {metcon.scoringNote}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {metcon.format === 'AMRAP' && (
          <div className="flex gap-2">
            <NumberInput
              label="RONDAS"
              value={result.rounds}
              onChange={v => onChange({ ...result, rounds: v })}
            />
            <NumberInput
              label="REPS +PARCIALES"
              value={result.partialReps}
              onChange={v => onChange({ ...result, partialReps: v })}
            />
          </div>
        )}

        {metcon.format === 'FOR_TIME' && (
          <TimeInput
            value={result.timeSeconds ?? null}
            onChange={s => onChange({ ...result, timeSeconds: s })}
          />
        )}

        {metcon.format === 'EMOM' && (
          <NumberInput
            label={`MINUTOS COMPLETADOS (de ${metcon.durationMinutes})`}
            value={result.completedMinutes}
            onChange={v => onChange({ ...result, completedMinutes: v })}
            placeholder={String(metcon.durationMinutes)}
          />
        )}

        {metcon.format === 'DEATH_BY' && (
          <NumberInput
            label="ÚLTIMO MINUTO COMPLETADO"
            value={result.lastMinuteCompleted}
            onChange={v => onChange({ ...result, lastMinuteCompleted: v })}
          />
        )}

        <textarea
          rows={2}
          placeholder="Notas del metcon..."
          value={result.notes ?? ''}
          onChange={e => onChange({ ...result, notes: e.target.value })}
          className="w-full rounded-lg bg-forge-surface border border-forge-border text-forge-text font-mono text-sm px-3 py-2 placeholder:text-forge-border focus:outline-none focus:border-forge-muted resize-none"
        />
      </div>
    </Card>
  )
}
