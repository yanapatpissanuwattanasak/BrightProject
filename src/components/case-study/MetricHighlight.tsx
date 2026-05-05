import type { ProjectMetric } from '@/types/project.types'

export function MetricHighlight({ label, value }: ProjectMetric) {
  return (
    <div className="rounded-card bg-surface-raised border border-surface-border p-6 text-center">
      <p className="text-3xl font-bold text-primary mb-1">{value}</p>
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  )
}
