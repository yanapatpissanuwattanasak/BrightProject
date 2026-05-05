import { Link } from 'react-router-dom'
import { projectDetailPath } from '@/constants/routes'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { truncate } from '@/lib/utils'
import type { Project } from '@/types/project.types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group rounded-card bg-surface-raised border border-surface-border overflow-hidden hover:border-primary/40 transition-colors">
      {project.thumbnailUrl ? (
        <img
          src={project.thumbnailUrl}
          alt=""
          className="w-full aspect-video object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-video bg-surface flex items-center justify-center">
          <span className="font-mono text-xs text-text-muted">{project.slug}</span>
        </div>
      )}

      <div className="p-6">
        <h3 className="font-bold text-text-primary text-lg mb-2 group-hover:text-primary transition-colors">
          <Link to={projectDetailPath(project.slug)} className="focus-visible:outline-none focus-visible:underline">
            {project.title}
          </Link>
        </h3>
        <p className="text-text-secondary text-sm mb-4 leading-relaxed">
          {truncate(project.summary, 160)}
        </p>

        <ul className="flex flex-wrap gap-1.5 mb-5" role="list" aria-label="Tech stack">
          {project.techStack.slice(0, 5).map((tech) => (
            <li key={tech}>
              <Badge>{tech}</Badge>
            </li>
          ))}
        </ul>

        <div className="flex gap-3 text-sm">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Live Demo ↗
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-card bg-surface-raised border border-surface-border overflow-hidden">
      <Skeleton className="w-full aspect-video rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
    </div>
  )
}
