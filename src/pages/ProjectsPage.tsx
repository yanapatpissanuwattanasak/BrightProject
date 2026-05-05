import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { usePublishedProjects } from '@/hooks/usePublishedProjects'
import { useProjectTags } from '@/hooks/useProjectTags'
import { ProjectCard, ProjectCardSkeleton } from '@/components/projects/ProjectCard'
import { TagFilterBar } from '@/components/projects/TagFilterBar'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export default function ProjectsPage() {
  const [selectedTag, setSelectedTag] = useState<string | undefined>()
  const { data: tags = [] } = useProjectTags()
  const { data: projects, isLoading } = usePublishedProjects({ tag: selectedTag })

  return (
    <>
      <Helmet>
        <title>Projects — Bright</title>
        <meta name="description" content="Full-stack projects built with React, NestJS, and PostgreSQL." />
      </Helmet>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <ScrollReveal>
          <h1 className="text-4xl font-bold text-text-primary mb-4">Projects</h1>
          <p className="text-text-secondary mb-10 max-w-xl">
            Production software with documented architecture decisions, live demos, and case studies.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <TagFilterBar tags={tags} selectedSlug={selectedTag} onSelect={setSelectedTag} />
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)
            : projects?.map((project, i) => (
                <ScrollReveal key={project.id} delay={i * 0.06}>
                  <ProjectCard project={project} />
                </ScrollReveal>
              ))}
          {!isLoading && projects?.length === 0 && (
            <p className="col-span-3 text-text-muted text-center py-16">No projects found.</p>
          )}
        </div>
      </div>
    </>
  )
}
