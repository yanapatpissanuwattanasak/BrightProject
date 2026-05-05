import { apiClient } from './client'
import type { ApiResponse } from '@/types/api.types'
import type { Project } from '@/types/project.types'
import type { ContactMessage } from '@/types/contact.types'
import type {
  AuthTokens,
  CreateProjectDto,
  LoginCredentials,
  ReorderProjectsDto,
  UpdateProjectDto,
} from '@/types/admin.types'

export async function login(credentials: LoginCredentials): Promise<AuthTokens> {
  const { data } = await apiClient.post<ApiResponse<AuthTokens>>('/api/auth/login', credentials)
  return data.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout')
}

export async function fetchAdminProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<ApiResponse<Project[]>>('/api/admin/projects')
  return data.data
}

export async function createProject(dto: CreateProjectDto): Promise<Project> {
  const { data } = await apiClient.post<ApiResponse<Project>>('/api/admin/projects', dto)
  return data.data
}

export async function updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
  const { data } = await apiClient.put<ApiResponse<Project>>(`/api/admin/projects/${id}`, dto)
  return data.data
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/projects/${id}`)
}

export async function publishProject(id: string): Promise<Project> {
  const { data } = await apiClient.patch<ApiResponse<Project>>(`/api/admin/projects/${id}/publish`)
  return data.data
}

export async function unpublishProject(id: string): Promise<Project> {
  const { data } = await apiClient.patch<ApiResponse<Project>>(`/api/admin/projects/${id}/unpublish`)
  return data.data
}

export async function reorderProjects(dto: ReorderProjectsDto): Promise<void> {
  await apiClient.post('/api/admin/projects/reorder', dto)
}

export async function fetchContactMessages(unreadOnly = false): Promise<ContactMessage[]> {
  const { data } = await apiClient.get<ApiResponse<ContactMessage[]>>('/api/admin/contact-messages', {
    params: { unread: unreadOnly || undefined },
  })
  return data.data
}

export async function markMessageRead(id: string): Promise<void> {
  await apiClient.patch(`/api/admin/contact-messages/${id}/read`)
}
