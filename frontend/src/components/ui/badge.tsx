import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gray'
}

export function Badge({ className, variant = 'gray', ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-400/12 dark:text-primary-200',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-200',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-400/12 dark:text-amber-200',
    danger: 'bg-red-100 text-red-700 dark:bg-red-400/12 dark:text-red-200',
    gray: 'bg-slate-100 text-slate-600 dark:bg-slate-700/55 dark:text-slate-300',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
