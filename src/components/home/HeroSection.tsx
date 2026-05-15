import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'

export function HeroSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-20" aria-label="Hero">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #6366F1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-3xl">
        <p className="font-mono text-sm text-primary mb-4">Full-Stack Software Engineer</p>
        <h1 className="text-5xl font-bold text-text-primary leading-tight mb-6">
          I build software where judgment matters more than execution.
        </h1>
        <p className="text-xl text-text-secondary mb-10 max-w-xl">
          React · NestJS · PostgreSQL · Clean Architecture. Based in Thailand, available worldwide.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to={ROUTES.PROJECTS}>View Projects</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to={ROUTES.CONTACT}>Get in Touch</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link to={ROUTES.RPS}>⚔️ RPS Game</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
