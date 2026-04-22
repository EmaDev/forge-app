import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium',
        {
          'bg-forge-surface2 text-forge-text border border-forge-border': variant === 'default',
          'bg-forge-green/20 text-forge-green border border-forge-green/30': variant === 'success',
          'bg-forge-amber/20 text-forge-amber border border-forge-amber/30': variant === 'warning',
          'bg-forge-red/20 text-forge-red border border-forge-red/30': variant === 'danger',
          'bg-transparent text-forge-muted border border-forge-border': variant === 'muted',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
