import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import {
  createProject,
  deleteProject,
  fetchAdminProjects,
  publishProject,
  reorderProjects,
  unpublishProject,
  updateProject,
} from '@/lib/api/admin'
import type { CreateProjectDto, ReorderProjectsDto, UpdateProjectDto } from '@/types/admin.types'

export function useAdminProjects() {
  return useQuery({
    queryKey: queryKeys.projects.adminList(),
    queryFn: fetchAdminProjects,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateProjectDto) => createProject(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects.adminList() }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProjectDto }) => updateProject(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects.adminList() }),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects.adminList() }),
  })
}

export function usePublishProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => publishProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.adminList() })
      qc.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

export function useUnpublishProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unpublishProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.adminList() })
      qc.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

export function useReorderProjects() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: ReorderProjectsDto) => reorderProjects(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects.adminList() }),
  })
}
