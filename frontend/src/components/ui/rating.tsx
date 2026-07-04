import { Star } from 'lucide-react'

interface RatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md'
}

export function Rating({ value, max = 5, size = 'md' }: RatingProps) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          } transition-colors`}
        />
      ))}
    </div>
  )
}