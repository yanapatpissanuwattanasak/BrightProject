import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { Footer } from './Footer'
import { PageTransition } from '@/components/ui/PageTransition'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-surface text-text-primary flex flex-col">
      <Navigation />
      <main id="main-content" className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}
