import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon-sm'
  isLoading?: boolean
  asChild?: boolean
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  asChild,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50'

  const variants = {
    primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-500 dark:bg-primary-500 dark:text-slate-950 dark:hover:bg-primary-400',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-100 dark:hover:bg-surface-elevated',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-100 dark:hover:bg-primary-400/10',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/20 dark:bg-red-500/90 dark:hover:bg-red-400',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-primary-400/10 dark:hover:text-primary-100',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    'icon-sm': 'h-8 w-8 p-0 text-sm',
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: cn(baseStyles, variants[variant], sizes[size], child.props.className, className),
    })
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}
