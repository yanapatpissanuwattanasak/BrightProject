export interface AdminUser {
  id: string
  email: string
  lastLoginAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
}

export interface CreateProjectDto {
  title: string
  slug: string
  summary: string
  problem: string
  solution: string
  techStack: string[]
  metrics: Array<{ label: string; value: string }>
  loomUrl?: string
  demoUrl?: string
  githubUrl?: string
  thumbnailUrl?: string
  sortOrder: number
  isFeatured: boolean
  tagIds: string[]
}

export type UpdateProjectDto = Partial<CreateProjectDto>

export interface ReorderProjectsDto {
  orderedIds: string[]
}
