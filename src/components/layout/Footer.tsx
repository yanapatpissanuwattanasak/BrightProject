import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface mt-section">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col sm:flex-row justify-between gap-6 text-text-muted text-sm">
        <p>© {new Date().getFullYear()} Bright. Built with React + NestJS.</p>
        <nav aria-label="Footer navigation">
          <ul className="flex gap-6" role="list">
            <li><Link to={ROUTES.PROJECTS} className="hover:text-text-secondary transition-colors">Projects</Link></li>
            <li><Link to={ROUTES.ABOUT} className="hover:text-text-secondary transition-colors">About</Link></li>
            <li><Link to={ROUTES.CONTACT} className="hover:text-text-secondary transition-colors">Contact</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
