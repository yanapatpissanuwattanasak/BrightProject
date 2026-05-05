import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useProjectBySlug } from '@/hooks/useProjectBySlug'
import { MetricsRow } from '@/components/case-study/MetricsRow'
import { ArchitectureDecision } from '@/components/case-study/ArchitectureDecision'
import { CaseStudySection } from '@/components/case-study/CaseStudySection'
import { LoomEmbed } from '@/components/case-study/LoomEmbed'
import { TechStackBadge } from '@/components/case-study/TechStackBadge'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Skeleton } from '@/components/ui/Skeleton'
import { ROUTES } from '@/constants/routes'

export default function ProjectDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: project, isLoading, isError } = useProjectBySlug(slug)

  if (isLoading) return <ProjectDetailSkeleton />
  if (isError || !project) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-text-muted mb-4">Project not found.</p>
        <Link to={ROUTES.PROJECTS} className="text-primary hover:underline">← Back to projects</Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{project.title} — Case Study | Bright</title>
        <meta name="description" content={project.summary} />
      </Helmet>

      <article className="mx-auto max-w-3xl px-6 py-16 space-y-16">
        {/* Hero */}
        <header>
          <Link to={ROUTES.PROJECTS} className="text-sm text-text-muted hover:text-text-secondary mb-6 inline-block">
            ← All Projects
          </Link>
          <h1 className="text-4xl font-bold text-text-primary mb-4">{project.title}</h1>
          <p className="text-xl text-text-secondary mb-6">{project.summary}</p>
          <ul className="flex flex-wrap gap-2 mb-6" role="list">
            {project.techStack.map((tech) => (
              <li key={tech}><TechStackBadge tech={tech} /></li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4 text-sm">
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
                Live Demo ↗
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary hover:underline">
                GitHub ↗
              </a>
            )}
          </div>
        </header>

        {/* Loom */}
        {project.loomUrl && (
          <ScrollReveal>
            <section aria-label="Video walkthrough">
              <h2 className="text-xl font-bold text-text-primary mb-4">Walkthrough</h2>
              <LoomEmbed url={project.loomUrl} />
            </section>
          </ScrollReveal>
        )}

        {/* Metrics */}
        {project.metrics.length > 0 && (
          <ScrollReveal>
            <MetricsRow metrics={project.metrics} />
          </ScrollReveal>
        )}

        {/* Problem / Solution */}
        {(project.problem || project.solution) && (
          <ScrollReveal>
            <section className="space-y-8">
              {project.problem && (
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-3">Problem</h2>
                  <p className="text-text-secondary leading-relaxed">{project.problem}</p>
                </div>
              )}
              {project.solution && (
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-3">Solution</h2>
                  <p className="text-text-secondary leading-relaxed">{project.solution}</p>
                </div>
              )}
            </section>
          </ScrollReveal>
        )}

        {/* Case study content */}
        {project.caseStudy?.content?.length ? (
          <ScrollReveal>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-text-primary">Deep Dive</h2>
              {project.caseStudy.content.map((section, i) => (
                <CaseStudySection key={i} section={section} />
              ))}
            </section>
          </ScrollReveal>
        ) : null}

        {/* ADRs */}
        {project.caseStudy?.architectureDecisions?.length ? (
          <ScrollReveal>
            <section>
              <h2 className="text-xl font-bold text-text-primary mb-6">Architecture Decisions</h2>
              <div className="space-y-4">
                {project.caseStudy.architectureDecisions.map((adr, i) => (
                  <ArchitectureDecision key={i} adr={adr} index={i} />
                ))}
              </div>
            </section>
          </ScrollReveal>
        ) : null}
      </article>
    </>
  )
}

function ProjectDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-8">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>
      <Skeleton className="w-full aspect-video" />
    </div>
  )
}
