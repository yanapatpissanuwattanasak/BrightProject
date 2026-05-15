import { Helmet } from 'react-helmet-async'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedProjectCard } from '@/components/home/FeaturedProjectCard'
import { ProjectsGrid } from '@/components/home/ProjectsGrid'
import { SkillsSection } from '@/components/home/SkillsSection'
import { WelcomeOverlay } from '@/components/home/WelcomeOverlay'
import { AnonymousChat } from '@/components/home/AnonymousChat'
import { usePublishedProjects } from '@/hooks/usePublishedProjects'

export default function HomePage() {
  const { data: projects, isLoading } = usePublishedProjects()

  const featuredProject = projects?.find((p) => p.isFeatured)
  const otherProjects = projects?.filter((p) => !p.isFeatured).slice(0, 6)

  return (
    <>
      <WelcomeOverlay />
      <Helmet>
        <title>Bright — Full-Stack Software Engineer | React + NestJS + PostgreSQL</title>
        <meta
          name="description"
          content="Software engineer specialising in React, NestJS, and Clean Architecture. Building production-grade tools for fintech and developer productivity."
        />
      </Helmet>

      <HeroSection />

      {featuredProject && (
        <section className="mx-auto max-w-6xl px-6 py-section">
          <FeaturedProjectCard project={featuredProject} />
        </section>
      )}

      <ProjectsGrid projects={otherProjects} isLoading={isLoading} />

      <SkillsSection />
      <AnonymousChat />
    </>
  )
}
