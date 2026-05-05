import { apiClient } from './client'
import type { ApiResponse } from '@/types/api.types'
import type { ContactFormData } from '@/types/contact.types'

export async function submitContactMessage(payload: ContactFormData): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/api/contact', payload)
}
