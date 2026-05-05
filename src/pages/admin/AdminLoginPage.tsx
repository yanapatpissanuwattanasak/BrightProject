import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { login } from '@/lib/api/admin'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type Fields = z.infer<typeof schema>

export default function AdminLoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(schema),
  })

  const onSubmit = handleSubmit(async (data) => {
    setError('')
    try {
      const tokens = await login(data)
      signIn(tokens.accessToken)
      navigate(ROUTES.ADMIN.DASHBOARD)
    } catch {
      setError('Invalid credentials')
    }
  })

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
        <h1 className="text-2xl font-bold text-text-primary">Admin Login</h1>

        <div>
          <label htmlFor="email" className="block text-sm text-text-secondary mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full rounded-xl border border-surface-border bg-surface-raised px-4 py-3 text-text-primary text-sm focus:outline focus:outline-2 focus:outline-primary"
          />
          {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">Password</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full rounded-xl border border-surface-border bg-surface-raised px-4 py-3 text-text-primary text-sm focus:outline focus:outline-2 focus:outline-primary"
          />
          {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
        </div>

        {error && <p role="alert" className="text-sm text-error">{error}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}
