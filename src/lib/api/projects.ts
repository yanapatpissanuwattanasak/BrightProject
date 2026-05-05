import { apiClient } from './client'
import type { ApiResponse } from '@/types/api.types'
import type { Project, ProjectFilters } from '@/types/project.types'

export async function fetchPublishedProjects(filters?: ProjectFilters): Promise<Project[]> {
  const { data } = await apiClient.get<ApiResponse<Project[]>>('/api/projects', { params: filters })
  return data.data
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<ApiResponse<Project[]>>('/api/projects', {
    params: { featured: true },
  })
  return data.data
}

export async function fetchProjectBySlug(slug: string): Promise<Project> {
  const { data } = await apiClient.get<ApiResponse<Project>>(`/api/projects/${slug}`)
  return data.data
}
