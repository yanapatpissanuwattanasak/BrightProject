import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { submitContactMessage } from '@/lib/api/contact'
import type { ContactFormData } from '@/types/contact.types'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  projectType: z.enum(['freelance', 'fulltime', 'consulting', 'other']),
})

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function useContactForm() {
  const [status, setStatus] = useState<Status>('idle')

  const form = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: '', projectType: 'other' },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setStatus('submitting')
    try {
      await submitContactMessage(data)
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  })

  return { form, status, onSubmit }
}
