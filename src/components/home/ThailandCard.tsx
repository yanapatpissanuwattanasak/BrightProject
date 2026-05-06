import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Badge } from '@/components/ui/Badge'

export function ThailandCard() {
  return (
    <article className="group rounded-card bg-surface-raised border border-surface-border overflow-hidden hover:border-primary/40 transition-colors">
      <div
        className="w-full aspect-video flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #1B2D4F 0%, #1B3D3D 50%, #245340 100%)',
        }}
      >
        <span className="font-mono text-xs text-text-muted opacity-60">thailand-map</span>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-text-primary text-lg mb-2 group-hover:text-primary transition-colors">
          <Link to={ROUTES.THAILAND} className="focus-visible:outline-none focus-visible:underline">
            Explore Thailand
          </Link>
        </h3>
        <p className="text-text-secondary text-sm mb-4 leading-relaxed">
          Interactive choropleth map of Thailand — click any province to browse top-rated attractions by category.
        </p>

        <ul className="flex flex-wrap gap-1.5 mb-5" role="list" aria-label="Tech stack">
          {['React', 'TopoJSON', 'TanStack Query', 'react-simple-maps'].map((tech) => (
            <li key={tech}>
              <Badge>{tech}</Badge>
            </li>
          ))}
        </ul>

        <Link
          to={ROUTES.THAILAND}
          className="text-primary hover:text-primary-hover font-medium text-sm transition-colors"
        >
          Try it →
        </Link>
      </div>
    </article>
  )
}
