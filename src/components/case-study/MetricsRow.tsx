import { MetricHighlight } from './MetricHighlight'
import type { ProjectMetric } from '@/types/project.types'

interface MetricsRowProps {
  metrics: ProjectMetric[]
}

export function MetricsRow({ metrics }: MetricsRowProps) {
  if (!metrics.length) return null
  return (
    <section aria-label="Project metrics">
      <div className={`grid gap-4 grid-cols-${Math.min(metrics.length, 4)}`}>
        {metrics.map((m) => (
          <MetricHighlight key={m.label} {...m} />
        ))}
      </div>
    </section>
  )
}
