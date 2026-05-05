import { useContactForm } from '@/hooks/useContactForm'
import { Button } from '@/components/ui/Button'
import { ContactFormField } from './ContactFormField'

export function ContactForm() {
  const { form, status, onSubmit } = useContactForm()
  const { register, formState: { errors } } = form

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-card bg-success/10 border border-success/30 p-8 text-center"
      >
        <p className="text-success font-semibold text-lg mb-2">Message sent!</p>
        <p className="text-text-secondary text-sm">I'll get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <ContactFormField
          label="Name"
          id="name"
          required
          placeholder="Your name"
          error={errors.name?.message}
          {...register('name')}
        />
        <ContactFormField
          label="Email"
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div>
        <label htmlFor="projectType" className="block text-sm font-medium text-text-secondary mb-1.5">
          Enquiry type
        </label>
        <select
          id="projectType"
          {...register('projectType')}
          className="w-full rounded-xl border border-surface-border bg-surface-raised px-4 py-3 text-text-primary text-sm focus:outline focus:outline-2 focus:outline-primary"
        >
          <option value="freelance">Freelance project</option>
          <option value="fulltime">Full-time role</option>
          <option value="consulting">Consulting</option>
          <option value="other">Other</option>
        </select>
      </div>

      <ContactFormField
        as="textarea"
        label="Message"
        id="message"
        required
        placeholder="Tell me about your project or question…"
        error={errors.message?.message}
        {...register('message')}
      />

      {status === 'error' && (
        <p role="alert" aria-live="assertive" className="text-sm text-error">
          Something went wrong. Please try again or email me directly.
        </p>
      )}

      <Button type="submit" disabled={status === 'submitting'} size="lg">
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
