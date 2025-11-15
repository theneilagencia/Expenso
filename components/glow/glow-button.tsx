// Glow Button Component
// Botão com efeito neon glow e variantes

import { cn } from '@/lib/utils/cn'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/50 focus:ring-blue-500',
        secondary: 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600',
        outline: 'bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 shadow-lg shadow-blue-500/30',
        ghost: 'bg-transparent hover:bg-gray-800 text-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/50',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface GlowButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode
}

export function GlowButton({
  children,
  className,
  variant,
  size,
  ...props
}: GlowButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </button>
  )
}
