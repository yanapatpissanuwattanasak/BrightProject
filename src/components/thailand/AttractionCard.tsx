import { Skeleton } from '@/components/ui/Skeleton'
import { StarRating } from './StarRating'
import { CATEGORY_LABELS } from '@/types/thailand.types'
import type { Attraction } from '@/types/thailand.types'

interface Props {
  attraction?: Attraction
  isLoading?: boolean
}

export function AttractionCard({ attraction, isLoading }: Props) {
  if (isLoading || !attraction) {
    return (
      <div className="flex gap-3 rounded-card border border-surface-border bg-surface-raised p-3">
        <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 rounded-card border border-surface-border bg-surface-raised p-3 transition-colors hover:border-primary/40">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface">
        {attraction.imageUrl ? (
          <img
            src={attraction.imageUrl}
            alt={attraction.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-text-muted">
            {categoryIcon(attraction.category)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-text-primary leading-snug">
            {attraction.name}
          </p>
          <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs text-text-muted border border-surface-border">
            {CATEGORY_LABELS[attraction.category]}
          </span>
        </div>
        <StarRating rating={attraction.rating} />
        {attraction.description && (
          <p className="mt-1 text-xs text-text-muted line-clamp-2 leading-relaxed">
            {attraction.description}
          </p>
        )}
      </div>
    </div>
  )
}

function categoryIcon(category: Attraction['category']): string {
  const icons: Record<Attraction['category'], string> = {
    nature: '🌿',
    temple: '⛩️',
    beach: '🏖️',
    museum: '🏛️',
    market: '🛍️',
    waterfall: '💧',
    viewpoint: '🗻',
    historical: '🏯',
  }
  return icons[category] ?? '📍'
}
