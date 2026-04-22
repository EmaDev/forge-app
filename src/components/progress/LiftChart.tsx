'use client'
import { useState } from 'react'
import { motion } from 'motion/react'

export interface ChartPoint {
  label: string
  value: number
  isPR?: boolean
}

interface LiftChartProps {
  data: ChartPoint[]
  unit?: string
  color?: string
}

export function LiftChart({ data, unit = 'kg', color = '#E24B4A' }: LiftChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center">
        <p className="text-forge-muted font-mono text-xs">SIN DATOS AÚN</p>
      </div>
    )
  }

  if (data.length === 1) {
    return (
      <div className="h-40 flex flex-col items-center justify-center gap-2">
        <span className="text-forge-text font-mono font-bold text-3xl">{data[0].value}{unit}</span>
        <span className="text-forge-muted font-mono text-xs">{data[0].label}</span>
      </div>
    )
  }

  const W = 320
  const H = 140
  const PAD = { top: 20, right: 16, bottom: 28, left: 44 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom

  const values = data.map(d => d.value)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const range = maxV - minV || 1
  const paddedMin = minV - range * 0.15
  const paddedMax = maxV + range * 0.15

  const xScale = (i: number) => PAD.left + (i / (data.length - 1)) * cW
  const yScale = (v: number) => PAD.top + cH - ((v - paddedMin) / (paddedMax - paddedMin)) * cH

  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(d.value).toFixed(1)}`)
    .join(' ')

  const areaD = `${pathD} L ${xScale(data.length - 1).toFixed(1)} ${(PAD.top + cH).toFixed(1)} L ${xScale(0).toFixed(1)} ${(PAD.top + cH).toFixed(1)} Z`

  // Y axis labels
  const yTicks = [minV, (minV + maxV) / 2, maxV].map(v => Math.round(v))

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke="#2A2A2A"
            strokeWidth={1}
          />
        ))}

        {/* Y labels */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={PAD.left - 6}
            y={yScale(tick) + 4}
            textAnchor="end"
            fill="#888888"
            fontSize={9}
            fontFamily="var(--font-geist-mono)"
          >
            {tick}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaD} fill={color} fillOpacity={0.06} />

        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        />

        {/* Points */}
        {data.map((d, i) => {
          const cx = xScale(i)
          const cy = yScale(d.value)
          const isHovered = hoveredIdx === i
          const pointColor = d.isPR ? '#F5A623' : color

          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : d.isPR ? 5 : 3.5}
                fill={pointColor}
                stroke="#0A0A0A"
                strokeWidth={2}
                style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onTouchStart={() => setHoveredIdx(i)}
              />
              {/* X label */}
              <text
                x={cx}
                y={H - 4}
                textAnchor="middle"
                fill="#888888"
                fontSize={8}
                fontFamily="var(--font-geist-mono)"
              >
                {d.label}
              </text>
            </g>
          )
        })}

        {/* Tooltip */}
        {hoveredIdx !== null && (() => {
          const d = data[hoveredIdx]
          const cx = xScale(hoveredIdx)
          const cy = yScale(d.value)
          const tooltipX = hoveredIdx > data.length * 0.7 ? cx - 64 : cx + 8
          const tooltipY = cy < PAD.top + 28 ? cy + 4 : cy - 32

          return (
            <g>
              <rect
                x={tooltipX}
                y={tooltipY}
                width={58}
                height={22}
                rx={4}
                fill="#1A1A1A"
                stroke="#2A2A2A"
              />
              <text
                x={tooltipX + 29}
                y={tooltipY + 14}
                textAnchor="middle"
                fill="#F5F5F5"
                fontSize={10}
                fontFamily="var(--font-geist-mono)"
                fontWeight="bold"
              >
                {d.value}{unit}
                {d.isPR ? ' ★' : ''}
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
