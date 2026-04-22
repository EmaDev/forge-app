'use client'
import { motion } from 'motion/react'
import { formatTime } from '@/lib/utils'

export interface MetconPoint {
  label: string
  value: number
  isTime?: boolean
}

interface MetconChartProps {
  data: MetconPoint[]
  isTime?: boolean
  label?: string
}

export function MetconChart({ data, isTime = false, label }: MetconChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center">
        <p className="text-forge-muted font-mono text-xs">SIN DATOS AÚN</p>
      </div>
    )
  }

  const W = 320
  const H = 100
  const PAD = { top: 12, right: 16, bottom: 24, left: 8 }
  const cW = W - PAD.left - PAD.right

  const values = data.map(d => d.value)
  const maxV = Math.max(...values)
  const barW = Math.max(20, Math.min(48, (cW / data.length) * 0.7))
  const gap = cW / data.length

  const barColor = (v: number) => {
    const ratio = v / maxV
    if (isTime) return ratio <= 0.85 ? '#1D9E75' : '#F5A623'
    return ratio >= 0.85 ? '#1D9E75' : '#F5A623'
  }

  return (
    <div>
      {label && (
        <p className="text-forge-muted font-mono text-[10px] uppercase tracking-widest mb-2">{label}</p>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {data.map((d, i) => {
          const barH = maxV > 0 ? ((d.value / maxV) * (H - PAD.top - PAD.bottom)) : 4
          const x = PAD.left + i * gap + (gap - barW) / 2
          const y = H - PAD.bottom - barH
          const color = barColor(d.value)

          return (
            <g key={i}>
              <motion.rect
                x={x}
                y={y}
                width={barW}
                rx={3}
                fill={color}
                fillOpacity={0.8}
                initial={{ height: 0, y: H - PAD.bottom }}
                animate={{ height: barH, y }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
              />
              <text
                x={x + barW / 2}
                y={H - 4}
                textAnchor="middle"
                fill="#888888"
                fontSize={8}
                fontFamily="var(--font-geist-mono)"
              >
                {d.label}
              </text>
              {i === data.length - 1 && (
                <text
                  x={x + barW / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fill="#F5F5F5"
                  fontSize={9}
                  fontFamily="var(--font-geist-mono)"
                  fontWeight="bold"
                >
                  {isTime ? formatTime(d.value) : d.value}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
