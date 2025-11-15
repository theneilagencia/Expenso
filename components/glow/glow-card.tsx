// Glow Card Component
// Card com efeito neon glow minimalista

import { cn } from '@/lib/utils/cn'
import { HTMLAttributes, ReactNode } from 'react'

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  glow?: boolean
  glowColor?: 'blue' | 'purple' | 'pink' | 'green' | 'orange'
}

const glowColors = {
  blue: 'shadow-blue-500/50 border-blue-500/30',
  purple: 'shadow-purple-500/50 border-purple-500/30',
  pink: 'shadow-pink-500/50 border-pink-500/30',
  green: 'shadow-green-500/50 border-green-500/30',
  orange: 'shadow-orange-500/50 border-orange-500/30',
}

export function GlowCard({
  children,
  className,
  glow = true,
  glowColor = 'blue',
  ...props
}: GlowCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-gray-900/50 backdrop-blur-sm p-6',
        glow && `shadow-lg ${glowColors[glowColor]}`,
        !glow && 'border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
