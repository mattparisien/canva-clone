import React from 'react'
import { cn } from '@/lib/utils/utils'

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'primary' | 'secondary' | 'muted'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const headingVariants = {
  default: 'text-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  muted: 'text-muted-foreground'
}

const headingSizes = {
  sm: {
    1: 'text-2xl font-bold',
    2: 'text-xl font-semibold',
    3: 'text-lg font-semibold',
    4: 'text-base font-medium',
    5: 'text-sm font-medium',
    6: 'text-xs font-medium'
  },
  md: {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-semibold',
    3: 'text-2xl font-semibold',
    4: 'text-xl font-medium',
    5: 'text-lg font-medium',
    6: 'text-base font-medium'
  },
  lg: {
    1: 'text-5xl font-bold',
    2: 'text-4xl font-semibold',
    3: 'text-3xl font-semibold',
    4: 'text-2xl font-medium',
    5: 'text-xl font-medium',
    6: 'text-lg font-medium'
  },
  xl: {
    1: 'text-6xl font-bold',
    2: 'text-5xl font-semibold',
    3: 'text-4xl font-semibold',
    4: 'text-3xl font-medium',
    5: 'text-2xl font-medium',
    6: 'text-xl font-medium'
  }
}

export function Heading({ 
  level, 
  children, 
  className, 
  variant = 'default',
  size = 'md',
  ...props 
}: HeadingProps) {
  const Component = `h${level}` as keyof JSX.IntrinsicElements
  
  const baseClasses = cn(
    'scroll-m-20 tracking-tight',
    headingVariants[variant],
    headingSizes[size][level],
    className
  )

  return React.createElement(
    Component,
    {
      className: baseClasses,
      ...props
    },
    children
  )
}

// Export default for backwards compatibility
export default Heading
