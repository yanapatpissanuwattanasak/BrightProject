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
          <p className="text-text-secondary mb-2">
            I typically respond within 24 hours.
          </p>
          <p className="text-sm text-text-muted mb-10">
            Or email directly:{' '}
            <a href="mailto:ynp.bright@gmail.com" className="text-primary hover:underline">
              ynp.bright@gmail.com
            </a>
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <ContactForm />
        </ScrollReveal>
      </div>
    </>
  )
}
