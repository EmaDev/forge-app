'use client'
import { cn } from '@/lib/utils'

const RPE_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1:  { bg: '#1D9E75', text: '#fff', border: '#1D9E75' },
  2:  { bg: '#1D9E75', text: '#fff', border: '#1D9E75' },
  3:  { bg: '#1D9E75', text: '#fff', border: '#1D9E75' },
  4:  { bg: '#1D9E75', text: '#fff', border: '#1D9E75' },
  5:  { bg: '#1D9E75', text: '#fff', border: '#1D9E75' },
  6:  { bg: '#1D9E75', text: '#fff', border: '#1D9E75' },
  7:  { bg: '#F5A623', text: '#000', border: '#F5A623' },
  8:  { bg: '#F5A623', text: '#000', border: '#F5A623' },
  9:  { bg: '#E24B4A', text: '#fff', border: '#E24B4A' },
  10: { bg: '#E24B4A', text: '#fff', border: '#E24B4A' },
}

interface RPESelectorProps {
  value: number | null
  onChange: (rpe: number) => void
  className?: string
}

export function RPESelector({ value, onChange, className }: RPESelectorProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-forge-muted text-[10px] font-mono uppercase tracking-widest">RPE</span>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
          const selected = value === n
          const colors = RPE_COLORS[n]
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={cn(
                'flex-1 h-9 rounded text-xs font-mono font-bold transition-all border',
                selected
                  ? 'scale-110 shadow-lg'
                  : 'opacity-40 hover:opacity-70'
              )}
              style={selected
                ? { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }
                : { backgroundColor: '#1A1A1A', color: colors.bg, borderColor: '#2A2A2A' }
              }
            >
              {n}
            </button>
          )
        })}
      </div>
    </div>
  )
}
