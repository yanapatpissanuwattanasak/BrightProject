import { Helmet } from 'react-helmet-async'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ContactForm } from '@/components/contact/ContactForm'

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact Bright — Software Engineer</title>
        <meta name="description" content="Get in touch about freelance projects, full-time roles, or consulting." />
      </Helmet>

      <div className="mx-auto max-w-2xl px-6 py-16">
        <ScrollReveal>
          <h1 className="text-4xl font-bold text-text-primary mb-3">Get in Touch</h1>
          <p className="text-text-secondary mb-8">
            I typically respond within 24 hours.
          </p>

          <div className="flex flex-col gap-3 mb-10">
            <a
              href="mailto:ynp.bright@gmail.com"
              className="flex items-center gap-3 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0L12 13.5 2.25 6.75" />
              </svg>
              ynp.bright@gmail.com
            </a>
            <a
              href="tel:+660868464543"
              className="flex items-center gap-3 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              086-846-4543
            </a>
            <a
              href="https://github.com/yanapatpissanuwattanasak"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              github.com/yanapatpissanuwattanasak
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <ContactForm />
        </ScrollReveal>
      </div>
    </>
  )
}
