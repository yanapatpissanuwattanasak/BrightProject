import { cn } from '@/lib/utils'
import type { Tag } from '@/types/project.types'

interface TagFilterBarProps {
  tags: Tag[]
  selectedSlug: string | undefined
  onSelect: (slug: string | undefined) => void
}

export function TagFilterBar({ tags, selectedSlug, onSelect }: TagFilterBarProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
      role="group"
      aria-label="Filter by tag"
    >
      <button
        onClick={() => onSelect(undefined)}
        className={cn(
          'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
          !selectedSlug
            ? 'bg-primary text-white border-primary'
            : 'border-surface-border text-text-secondary hover:text-text-primary',
        )}
        aria-pressed={!selectedSlug}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onSelect(tag.slug)}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
            selectedSlug === tag.slug
              ? 'bg-primary text-white border-primary'
              : 'border-surface-border text-text-secondary hover:text-text-primary',
          )}
          aria-pressed={selectedSlug === tag.slug}
          style={selectedSlug === tag.slug ? undefined : { borderColor: `${tag.color}40` }}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
