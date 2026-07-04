import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'error'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
}

const icons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
}

const variants = {
  default: 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-200',
  info: 'border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-400/25 dark:bg-primary-400/12 dark:text-primary-100',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-400/12 dark:text-emerald-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/12 dark:text-amber-100',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-400/25 dark:bg-red-400/12 dark:text-red-100',
}

export function Alert({ className, variant = 'default', title, children, ...props }: AlertProps) {
  const Icon = icons[variant]

  return (
    <div
      className={cn(
        'rounded-xl border p-4 flex items-start gap-3',
        variants[variant],
        className
      )}
      {...props}
    >
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        {title && <p className="font-semibold text-sm mb-1">{title}</p>}
        {children && <p className="text-sm">{children}</p>}
      </div>
    </div>
  )
}
