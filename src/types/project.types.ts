export type ProjectStatus = 'draft' | 'published' | 'archived'

export interface Tag {
  id: string
  name: string
  slug: string
  color: string
}

export interface ProjectMetric {
  label: string
  value: string
}

export interface ArchitectureDecision {
  context: string
  decision: string
  rationale: string
  consequences: string
}

export type CaseStudySectionType = 'text' | 'code' | 'image' | 'callout'

export interface CaseStudySection {
  type: CaseStudySectionType
  content: string
  language?: string // for code blocks
}

export interface CaseStudy {
  id: string
  projectId: string
  architectureDecisions: ArchitectureDecision[]
  content: CaseStudySection[]
}

export interface Project {
  id: string
  title: string
  slug: string
  summary: string
  problem: string
  solution: string
  techStack: string[]
  metrics: ProjectMetric[]
  loomUrl?: string
  demoUrl?: string
  githubUrl?: string
  thumbnailUrl?: string
  sortOrder: number
  isFeatured: boolean
  status: ProjectStatus
  publishedAt?: string
  createdAt: string
  updatedAt: string
  tags: Tag[]
  caseStudy?: CaseStudy
}

export interface ProjectFilters {
  tag?: string
  featured?: boolean
  limit?: number
}
