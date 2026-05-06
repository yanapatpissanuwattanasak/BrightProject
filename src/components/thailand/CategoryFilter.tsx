import { cn } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/types/thailand.types'
import type { AttractionFilter } from '@/types/thailand.types'

const FILTERS: AttractionFilter[] = [
  'all', 'nature', 'temple', 'beach', 'museum', 'market', 'waterfall', 'viewpoint', 'historical',
]

interface Props {
  value: AttractionFilter
  onChange: (filter: AttractionFilter) => void
}

export function CategoryFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={cn(
            'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
            value === filter
              ? 'bg-primary text-white'
              : 'bg-surface-raised text-text-secondary border border-surface-border hover:text-text-primary',
          )}
        >
          {CATEGORY_LABELS[filter]}
        </button>
      ))}
    </div>
  )
}
