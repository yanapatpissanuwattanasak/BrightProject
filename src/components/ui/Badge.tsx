import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string
}

export function Badge({ className, color, style, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono font-medium border border-surface-border',
        className,
      )}
      style={color ? { color, borderColor: `${color}40`, ...style } : style}
      {...props}
    >
      {children}
    </span>
  )
}
