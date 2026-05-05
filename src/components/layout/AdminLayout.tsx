import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'

export function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate(ROUTES.ADMIN.LOGIN)
  }

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <header className="border-b border-surface-border bg-surface-raised px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to={ROUTES.ADMIN.DASHBOARD} className="font-bold text-text-primary">
            Bright CMS
          </Link>
          <nav>
            <ul className="flex gap-4 text-sm text-text-secondary" role="list">
              <li><Link to={ROUTES.ADMIN.DASHBOARD} className="hover:text-text-primary transition-colors">Projects</Link></li>
              <li><Link to="/admin/messages" className="hover:text-text-primary transition-colors">Messages</Link></li>
            </ul>
          </nav>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign out</Button>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
