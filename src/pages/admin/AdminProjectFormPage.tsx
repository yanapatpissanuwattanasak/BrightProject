import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { useAdminProjects, useCreateProject, useUpdateProject } from '@/hooks/useAdminProjects'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { slugify } from '@/lib/utils'
import type { CreateProjectDto } from '@/types/admin.types'

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Lowercase, hyphens only'),
  summary: z.string().min(10).max(280),
  problem: z.string(),
  solution: z.string(),
  techStack: z.string(), // comma-separated; split on submit
  githubUrl: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
  loomUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0),
  isFeatured: z.boolean(),
})

type Fields = z.infer<typeof schema>

export default function AdminProjectFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const { data: projects } = useAdminProjects()
  const existing = projects?.find((p) => p.id === id)

  const { mutateAsync: createProject } = useCreateProject()
  const { mutateAsync: updateProject } = useUpdateProject()

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { sortOrder: 0, isFeatured: false },
  })

  // Auto-fill slug from title
  const title = watch('title')
  useEffect(() => {
    if (!isEditing) setValue('slug', slugify(title ?? ''))
  }, [title, isEditing, setValue])

  // Populate form when editing
  useEffect(() => {
    if (existing) {
      setValue('title', existing.title)
      setValue('slug', existing.slug)
      setValue('summary', existing.summary)
      setValue('problem', existing.problem ?? '')
      setValue('solution', existing.solution ?? '')
      setValue('techStack', existing.techStack.join(', '))
      setValue('githubUrl', existing.githubUrl ?? '')
      setValue('demoUrl', existing.demoUrl ?? '')
      setValue('loomUrl', existing.loomUrl ?? '')
      setValue('thumbnailUrl', existing.thumbnailUrl ?? '')
      setValue('sortOrder', existing.sortOrder)
      setValue('isFeatured', existing.isFeatured)
    }
  }, [existing, setValue])

  const onSubmit = handleSubmit(async (data) => {
    const dto: CreateProjectDto = {
      ...data,
      techStack: data.techStack.split(',').map((s) => s.trim()).filter(Boolean),
      metrics: [],
      tagIds: [],
      githubUrl: data.githubUrl || undefined,
      demoUrl: data.demoUrl || undefined,
      loomUrl: data.loomUrl || undefined,
      thumbnailUrl: data.thumbnailUrl || undefined,
    }

    if (isEditing && id) {
      await updateProject({ id, dto })
    } else {
      await createProject(dto)
    }
    navigate(ROUTES.ADMIN.DASHBOARD)
  })

  const fieldClass = 'w-full rounded-xl border border-surface-border bg-surface-raised px-4 py-3 text-text-primary text-sm focus:outline focus:outline-2 focus:outline-primary'

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary mb-8">
        {isEditing ? 'Edit Project' : 'New Project'}
      </h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Title *</label>
            <input {...register('title')} className={fieldClass} />
            {errors.title && <p className="mt-1 text-xs text-error">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Slug *</label>
            <input {...register('slug')} className={`${fieldClass} font-mono`} />
            {errors.slug && <p className="mt-1 text-xs text-error">{errors.slug.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Summary * (max 280 chars)</label>
          <textarea {...register('summary')} rows={3} className={`${fieldClass} resize-none`} />
          {errors.summary && <p className="mt-1 text-xs text-error">{errors.summary.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Problem</label>
          <textarea {...register('problem')} rows={4} className={`${fieldClass} resize-none`} />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Solution</label>
          <textarea {...register('solution')} rows={4} className={`${fieldClass} resize-none`} />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Tech Stack (comma-separated)</label>
          <input {...register('techStack')} placeholder="React, NestJS, PostgreSQL" className={fieldClass} />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">GitHub URL</label>
            <input {...register('githubUrl')} type="url" className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Demo URL</label>
            <input {...register('demoUrl')} type="url" className={fieldClass} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Loom URL</label>
            <input {...register('loomUrl')} type="url" className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Thumbnail URL</label>
            <input {...register('thumbnailUrl')} type="url" className={fieldClass} />
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Sort Order</label>
            <input {...register('sortOrder')} type="number" min={0} className={`${fieldClass} w-24`} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer pt-6">
            <input {...register('isFeatured')} type="checkbox" className="w-4 h-4 accent-primary" />
            <span className="text-sm text-text-secondary">Featured</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
