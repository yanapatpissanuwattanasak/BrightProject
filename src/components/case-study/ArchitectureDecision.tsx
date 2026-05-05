import type { ArchitectureDecision as ADR } from '@/types/project.types'

interface ArchitectureDecisionProps {
  adr: ADR
  index: number
}

const ADR_FIELDS: { key: keyof ADR; label: string }[] = [
  { key: 'context', label: 'Context' },
  { key: 'decision', label: 'Decision' },
  { key: 'rationale', label: 'Rationale' },
  { key: 'consequences', label: 'Consequences' },
]

export function ArchitectureDecision({ adr, index }: ArchitectureDecisionProps) {
  return (
    <article className="rounded-card bg-surface-raised border border-surface-border p-6">
      <header className="flex items-center gap-3 mb-5">
        <span className="font-mono text-xs text-text-muted">ADR-{String(index + 1).padStart(3, '0')}</span>
      </header>
      <dl className="space-y-4">
        {ADR_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <dt className="font-mono text-xs text-primary uppercase tracking-wider mb-1">{label}</dt>
            <dd className="text-text-secondary text-sm leading-relaxed">{adr[key]}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
