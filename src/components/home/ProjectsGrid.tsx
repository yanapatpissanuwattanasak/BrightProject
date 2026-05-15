import { useRef } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ProjectCard, ProjectCardSkeleton } from '@/components/projects/ProjectCard'
import type { Project } from '@/types/project.types'

interface ProjectsGridProps {
  projects?: Project[]
  isLoading?: boolean
  title?: string
  appendCards?: React.ReactNode
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
}

export function ProjectsGrid({ projects, isLoading, title = 'More Projects', appendCards }: ProjectsGridProps) {
  const shouldReduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section className="mx-auto max-w-6xl px-6 py-section">
      <ScrollReveal>
        <h2 className="text-2xl font-bold text-text-primary mb-8">{title}</h2>
      </ScrollReveal>

      <motion.div
        ref={ref}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={shouldReduce ? undefined : containerVariants}
        initial={shouldReduce ? undefined : 'hidden'}
        animate={shouldReduce ? undefined : isInView ? 'visible' : 'hidden'}
      >
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)
          : projects?.map((project) => (
              <motion.div key={project.id} variants={shouldReduce ? undefined : itemVariants}>
                <ProjectCard project={project} />
              </motion.div>
            ))}
        {!isLoading && appendCards && (
          <motion.div variants={shouldReduce ? undefined : itemVariants}>
            {appendCards}
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
