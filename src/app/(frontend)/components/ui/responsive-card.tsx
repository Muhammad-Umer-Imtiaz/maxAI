import { Card, CardContent, CardHeader, CardTitle } from './card'
import { LucideIcon } from 'lucide-react'

interface ResponsiveCardProps {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  className?: string
}

export function ResponsiveCard({
  title,
  icon: Icon,
  children,
  className = '',
}: ResponsiveCardProps) {
  return (
    <Card className={`glass-card border-maxfit-medium-grey/20 ${className}`}>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-3 text-maxfit-white text-lg sm:text-xl">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green flex-shrink-0" />
          <span className="truncate">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">{children}</CardContent>
    </Card>
  )
}
