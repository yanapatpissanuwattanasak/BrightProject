import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ProjectCard, ProjectCardSkeleton } from '@/components/projects/ProjectCard'
import type { Project } from '@/types/project.types'

interface ProjectsGridProps {
  projects?: Project[]
  isLoading?: boolean
  title?: string
}

export function ProjectsGrid({ projects, isLoading, title = 'More Projects' }: ProjectsGridProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-section">
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-text-primary mb-8">{title}</h2>
      </ScrollReveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)
          : projects?.map((project, i) => (
              <ScrollReveal key={project.id} delay={i * 0.08}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
      </div>
    </section>
  )
}
