'use client'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none',
          {
            'bg-forge-red text-white hover:bg-[#c73f3e]': variant === 'primary',
            'bg-forge-surface2 text-forge-text border border-forge-border hover:border-forge-muted': variant === 'secondary',
            'text-forge-muted hover:text-forge-text': variant === 'ghost',
            'bg-transparent border border-forge-red text-forge-red hover:bg-forge-red hover:text-white': variant === 'danger',
          },
          {
            'h-9 px-4 text-sm rounded-md': size === 'sm',
            'h-12 px-6 text-base rounded-lg': size === 'md',
            'h-14 px-8 text-lg rounded-xl w-full': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
