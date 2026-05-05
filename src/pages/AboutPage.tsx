import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ROUTES } from '@/constants/routes'

const ADR_LINKS = [
  { label: 'ADR-001: React SPA over Next.js', href: 'https://github.com/ynpbright/bright-portfolio/blob/main/docs/decisions/ADR-001-react-spa-over-nextjs.md' },
  { label: 'ADR-002: TanStack Query cache strategy', href: 'https://github.com/ynpbright/bright-portfolio/blob/main/docs/decisions/ADR-002-tanstack-query-cache-strategy.md' },
  { label: 'ADR-003: Framer Motion constraint', href: 'https://github.com/ynpbright/bright-portfolio/blob/main/docs/decisions/ADR-003-framer-motion-constraint.md' },
  { label: 'ADR-004: Dark mode first', href: 'https://github.com/ynpbright/bright-portfolio/blob/main/docs/decisions/ADR-004-dark-mode-first.md' },
]

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Bright — Software Engineer</title>
        <meta name="description" content="Full-stack software engineer specialising in React, NestJS, and Clean Architecture." />
      </Helmet>

      <div className="mx-auto max-w-3xl px-6 py-16 space-y-16">
        <ScrollReveal>
          <section>
            <h1 className="text-4xl font-bold text-text-primary mb-6">About</h1>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                I'm a full-stack software engineer who works across the entire product stack — from
                React component design to PostgreSQL schema decisions to deployment pipelines. I
                default to Clean Architecture because the boundary between "how it works" and "why
                it works that way" needs to be explicit.
              </p>
              <p>
                I specialise in fintech tools and developer-facing products, where precision matters
                more than speed-to-market. My background includes trading systems, CMS platforms, and
                APIs that third-party teams depend on.
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* Meta case study — the portfolio itself */}
        <ScrollReveal>
          <section className="rounded-card bg-surface-raised border border-surface-border p-8">
            <h2 className="text-xl font-bold text-text-primary mb-3">
              This portfolio is a portfolio piece
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              The architecture behind this site demonstrates the same patterns I apply in production:
              React SPA decoupled from NestJS API, Clean Architecture layers, CMS-driven content
              without code deploys. Every tradeoff is documented in ADRs — including why I chose a
              backend that's slower than static when a static site was the obvious option.
            </p>
            <ul className="space-y-2">
              {ADR_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline font-mono"
                  >
                    {label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Currently</h2>
            <p className="text-text-secondary leading-relaxed">
              Open to full-stack roles (backend-leaning) and select freelance engagements. Available
              for remote work worldwide.{' '}
              <Link to={ROUTES.CONTACT} className="text-primary hover:underline">
                Get in touch →
              </Link>
            </p>
          </section>
        </ScrollReveal>
      </div>
    </>
  )
}
