// Glow Loading Component
// Loading spinner com efeito neon glow

import { cn } from '@/lib/utils/cn'
import { HTMLAttributes } from 'react'

interface GlowLoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'purple' | 'pink' | 'green'
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
}

const colors = {
  blue: 'border-blue-500 border-t-transparent',
  purple: 'border-purple-500 border-t-transparent',
  pink: 'border-pink-500 border-t-transparent',
  green: 'border-green-500 border-t-transparent',
}

export function GlowLoading({
  className,
  size = 'md',
  color = 'blue',
  ...props
}: GlowLoadingProps) {
  return (
    <div
      className={cn(
        'inline-block rounded-full animate-spin',
        sizes[size],
        colors[color],
        className
      )}
      {...props}
    />
  )
}

export function GlowLoadingOverlay({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <GlowLoading size="lg" color="blue" />
        <p className="mt-4 text-gray-300">{text}</p>
      </div>
    </div>
  )
}
