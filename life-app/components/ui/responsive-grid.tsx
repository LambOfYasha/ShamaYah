import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  autoFit?: boolean
  autoFill?: boolean
}

const gapClasses = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

const getGridCols = (cols: ResponsiveGridProps['cols']) => {
  if (!cols) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  
  const classes = []
  
  if (cols.xs) classes.push(`grid-cols-${cols.xs}`)
  if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`)
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`)
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`)
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`)
  if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`)
  
  return classes.length > 0 ? classes.join(' ') : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
}

export function ResponsiveGrid({
  children,
  cols,
  gap = 'md',
  autoFit = false,
  autoFill = false,
  className,
  ...props
}: ResponsiveGridProps) {
  const gridClasses = autoFit 
    ? 'grid auto-rows-auto grid-cols-[repeat(auto-fit,minmax(250px,1fr))]'
    : autoFill
    ? 'grid auto-rows-auto grid-cols-[repeat(auto-fill,minmax(250px,1fr))]'
    : getGridCols(cols)

  return (
    <div
      className={cn(
        'grid',
        gridClasses,
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
