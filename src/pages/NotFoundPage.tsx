import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <>
      <Helmet><title>404 — Page Not Found | Bright</title></Helmet>
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="font-mono text-6xl text-surface-border mb-6">404</p>
        <h1 className="text-2xl font-bold text-text-primary mb-3">Page not found</h1>
        <p className="text-text-secondary mb-8">
          This page doesn't exist or has been moved.
        </p>
        <Link to={ROUTES.HOME} className="text-primary hover:underline font-medium">
          ← Back to home
        </Link>
      </div>
    </>
  )
}
