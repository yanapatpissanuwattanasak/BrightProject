import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

const RESUME_URL = '/resume.pdf'
const GITHUB_URL = 'https://github.com/ynpbright'

const navItems = [
  { label: 'Projects', to: ROUTES.PROJECTS },
  { label: 'About', to: ROUTES.ABOUT },
  { label: 'Contact', to: ROUTES.CONTACT },
  { label: 'Time Blocking', to: ROUTES.TIME_BLOCKING },
]

export function Navigation() {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
        aria-label="Main navigation"
      >
        <NavLink to={ROUTES.HOME} className="font-bold text-text-primary text-lg tracking-tight">
          Bright
        </NavLink>

        <ul className="flex items-center gap-1" role="list">
          {navItems.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-text-primary bg-surface-raised'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised',
                  )
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <a
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              Resume
            </a>
          </li>
          <li>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              GitHub
            </a>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  )
}
