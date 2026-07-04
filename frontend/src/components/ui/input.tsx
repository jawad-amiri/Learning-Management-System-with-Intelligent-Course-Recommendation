import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400',
          'focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/15',
          'transition-all duration-200 dark:border-slate-700 dark:bg-surface-subtle dark:text-slate-100 dark:placeholder:text-slate-500',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500/15 dark:border-red-800',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
