import { Link } from 'react-router-dom'
import { projectDetailPath } from '@/constants/routes'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { Project } from '@/types/project.types'

interface FeaturedProjectCardProps {
  project: Project
}

export function FeaturedProjectCard({ project }: FeaturedProjectCardProps) {
  return (
    <ScrollReveal>
      <article className="rounded-card bg-surface-raised border border-surface-border overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt=""
              className="w-full h-64 md:h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="h-64 md:h-full bg-surface flex items-center justify-center">
              <span className="font-mono text-xs text-text-muted">Featured</span>
            </div>
          )}

          <div className="p-8 flex flex-col justify-center">
            <span className="font-mono text-xs text-primary uppercase tracking-widest mb-3">
              Featured Project
            </span>
            <h2 className="text-2xl font-bold text-text-primary mb-3">{project.title}</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">{project.summary}</p>

            <ul className="flex flex-wrap gap-1.5 mb-6" role="list">
              {project.techStack.map((tech) => (
                <li key={tech}><Badge>{tech}</Badge></li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to={projectDetailPath(project.slug)}>Case Study</Link>
              </Button>
              {project.githubUrl && (
                <Button asChild variant="secondary">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    GitHub ↗
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </article>
    </ScrollReveal>
  )
}
