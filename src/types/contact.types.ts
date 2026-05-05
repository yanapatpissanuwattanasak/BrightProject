export type ProjectType = 'freelance' | 'fulltime' | 'consulting' | 'other'

export interface ContactFormData {
  name: string
  email: string
  message: string
  projectType: ProjectType
}

export interface ContactMessage extends ContactFormData {
  id: string
  isRead: boolean
  createdAt: string
}
