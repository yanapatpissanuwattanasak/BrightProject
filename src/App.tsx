import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/context/AuthContext'

// Public pages — eagerly loaded
import HomePage from '@/pages/HomePage'
import ProjectsPage from '@/pages/ProjectsPage'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { TimeBlockingPage } from '@/pages/TimeBlockingPage'

// Admin pages — lazy-loaded, separate chunk
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminProjectFormPage = lazy(() => import('@/pages/admin/AdminProjectFormPage'))
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })))

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.ADMIN.LOGIN} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<RootLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.PROJECTS} element={<ProjectsPage />} />
          <Route path={ROUTES.PROJECT_DETAIL} element={<ProjectDetailPage />} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={ROUTES.CONTACT} element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Time Blocking — standalone (no nav layout) */}
        <Route path="/time-blocking" element={<TimeBlockingPage />} />

        {/* Admin login (no layout) */}
        <Route
          path={ROUTES.ADMIN.LOGIN}
          element={
            <Suspense fallback={null}>
              <AdminLoginPage />
            </Suspense>
          }
        />

        {/* Protected admin */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <Suspense fallback={null}>
                <AdminLayout />
              </Suspense>
            </RequireAuth>
          }
        >
          <Route index element={<Suspense fallback={null}><AdminDashboardPage /></Suspense>} />
          <Route path="projects/new" element={<Suspense fallback={null}><AdminProjectFormPage /></Suspense>} />
          <Route path="projects/:id" element={<Suspense fallback={null}><AdminProjectFormPage /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
