import { Star } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  isFavorite?: boolean
  onToggle: () => void
  className?: string
}

export function FavoriteButton({ isFavorite, onToggle, className }: FavoriteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('h-7 px-2 text-xs', className)}
      onClick={onToggle}
    >
      <Star 
        size={14} 
        className={cn('mr-1', isFavorite && 'fill-yellow-500 text-yellow-500')}
        weight={isFavorite ? 'fill' : 'regular'}
      />
      {isFavorite ? 'Favorited' : 'Favorite'}
    </Button>
  )
}
