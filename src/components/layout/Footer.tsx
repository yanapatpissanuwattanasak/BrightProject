import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface mt-section">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col sm:flex-row justify-between gap-6 text-text-muted text-sm">
        <div className="flex flex-col gap-1">
          <p>© {new Date().getFullYear()} Bright. Built with React + NestJS.</p>
          <div className="flex flex-wrap gap-4 mt-1">
            <a href="mailto:ynp.bright@gmail.com" className="hover:text-text-secondary transition-colors">ynp.bright@gmail.com</a>
            <a href="tel:+660868464543" className="hover:text-text-secondary transition-colors">086-846-4543</a>
            <a href="https://github.com/yanapatpissanuwattanasak" target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary transition-colors">GitHub ↗</a>
          </div>
        </div>
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
