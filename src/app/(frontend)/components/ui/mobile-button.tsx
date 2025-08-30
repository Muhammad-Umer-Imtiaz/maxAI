import { Button } from './button'
import { LucideIcon } from 'lucide-react'

interface MobileButtonProps {
  onClick?: () => void
  icon?: LucideIcon
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
  disabled?: boolean
  fullWidth?: boolean
}

export function MobileButton({
  onClick,
  icon: Icon,
  children,
  variant = 'default',
  className = '',
  disabled = false,
  fullWidth = false,
}: MobileButtonProps) {
  const baseClasses = fullWidth ? 'w-full' : 'w-full sm:w-auto'

  return (
    <Button
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      className={`${baseClasses} text-sm h-10 sm:h-9 ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  )
}
