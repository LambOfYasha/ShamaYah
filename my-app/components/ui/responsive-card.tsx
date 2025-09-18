import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"

interface ResponsiveCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode
  title?: string
  description?: string
  footer?: React.ReactNode
  compact?: boolean
  mobileCompact?: boolean
}

export function ResponsiveCard({
  children,
  title,
  description,
  footer,
  compact = false,
  mobileCompact = true,
  className,
  ...props
}: ResponsiveCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-200',
        compact && 'sm:p-4',
        mobileCompact && 'p-3 sm:p-6',
        !compact && !mobileCompact && 'p-4 sm:p-6',
        className
      )}
      {...props}
    >
      {(title || description) && (
        <CardHeader className={cn(
          'pb-3 sm:pb-4',
          compact && 'pb-2 sm:pb-3'
        )}>
          {title && (
            <CardTitle className={cn(
              'text-lg sm:text-xl',
              compact && 'text-base sm:text-lg'
            )}>
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className={cn(
              'text-sm sm:text-base',
              compact && 'text-xs sm:text-sm'
            )}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(
        'pt-0',
        compact && 'pt-0',
        !compact && 'pt-0 sm:pt-0'
      )}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className={cn(
          'pt-3 sm:pt-4',
          compact && 'pt-2 sm:pt-3'
        )}>
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
