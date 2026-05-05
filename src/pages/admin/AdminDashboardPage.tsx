import { Link } from 'react-router-dom'
import { useAdminProjects, useDeleteProject, usePublishProject, useUnpublishProject } from '@/hooks/useAdminProjects'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { ROUTES, adminProjectEditPath } from '@/constants/routes'

export default function AdminDashboardPage() {
  const { data: projects, isLoading } = useAdminProjects()
  const { mutate: deleteProject } = useDeleteProject()
  const { mutate: publishProject } = usePublishProject()
  const { mutate: unpublishProject } = useUnpublishProject()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
        <Button asChild size="sm">
          <Link to={ROUTES.ADMIN.PROJECT_NEW}>+ New Project</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {projects?.map((project) => (
            <div
              key={project.id}
              className="flex items-center gap-4 rounded-xl bg-surface-raised border border-surface-border px-5 py-4"
            >
              <span className="font-mono text-xs text-text-muted w-6">{project.sortOrder}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{project.title}</p>
                <p className="text-xs text-text-muted font-mono">{project.slug}</p>
              </div>
              <Badge
                color={
                  project.status === 'published'
                    ? '#22C55E'
                    : project.status === 'draft'
                    ? '#F59E0B'
                    : '#475569'
                }
              >
                {project.status}
              </Badge>
              <div className="flex gap-2">
                {project.status === 'published' ? (
                  <Button variant="ghost" size="sm" onClick={() => unpublishProject(project.id)}>
                    Unpublish
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => publishProject(project.id)}>
                    Publish
                  </Button>
                )}
                <Button asChild variant="secondary" size="sm">
                  <Link to={adminProjectEditPath(project.id)}>Edit</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Delete "${project.title}"?`)) deleteProject(project.id)
                  }}
                  className="text-error hover:text-error"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {projects?.length === 0 && (
            <p className="text-text-muted text-center py-12">No projects yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
