import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function Card({ className, header, footer, children, ...props }: CardProps) {
  return (
    <div
      className={cn('overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-surface-dark dark:shadow-soft-dark', className)}
      {...props}
    >
      {header && <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700">{footer}</div>}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-b border-slate-200 px-6 py-4 dark:border-slate-700', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-t border-slate-200 px-6 py-4 dark:border-slate-700', className)} {...props}>
      {children}
    </div>
  )
}
