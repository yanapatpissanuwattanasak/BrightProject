import type { CaseStudySection as Section } from '@/types/project.types'
import { cn } from '@/lib/utils'

interface CaseStudySectionProps {
  section: Section
}

export function CaseStudySection({ section }: CaseStudySectionProps) {
  switch (section.type) {
    case 'text':
      return <p className="text-text-secondary leading-relaxed">{section.content}</p>

    case 'code':
      return (
        <pre className={cn('rounded-card bg-surface p-5 overflow-x-auto border border-surface-border')}>
          <code className={`font-mono text-sm text-text-primary language-${section.language ?? 'text'}`}>
            {section.content}
          </code>
        </pre>
      )

    case 'callout':
      return (
        <aside className="rounded-card border-l-4 border-primary bg-primary/5 px-5 py-4">
          <p className="text-text-secondary text-sm leading-relaxed">{section.content}</p>
        </aside>
      )

    case 'image':
      return (
        <figure>
          <img
            src={section.content}
            alt=""
            className="rounded-card w-full border border-surface-border"
            loading="lazy"
          />
        </figure>
      )
  }
}
