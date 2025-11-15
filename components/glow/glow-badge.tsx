// Glow Badge Component
// Badge com efeito neon glow

import { cn } from '@/lib/utils/cn'
import { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-gray-700 text-gray-300 border border-gray-600',
        success: 'bg-green-500/10 text-green-400 border border-green-500/30 shadow-sm shadow-green-500/50',
        warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 shadow-sm shadow-yellow-500/50',
        danger: 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-sm shadow-red-500/50',
        info: 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/50',
        purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-sm shadow-purple-500/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface GlowBadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: ReactNode
}

export function GlowBadge({
  children,
  className,
  variant,
  ...props
}: GlowBadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    >
      {children}
    </span>
  )
}
