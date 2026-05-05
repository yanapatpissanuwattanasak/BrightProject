export interface ApiResponse<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

export interface ApiError {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: ValidationError[]
  }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
}

export interface ValidationError {
  field: string
  message: string
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'PUBLISH_PRECONDITION_FAILED'
  | 'INTERNAL_ERROR'
