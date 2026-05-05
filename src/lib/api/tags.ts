import { apiClient } from './client'
import type { ApiResponse } from '@/types/api.types'
import type { Tag } from '@/types/project.types'

export async function fetchTags(): Promise<Tag[]> {
  const { data } = await apiClient.get<ApiResponse<Tag[]>>('/api/tags')
  return data.data
}
