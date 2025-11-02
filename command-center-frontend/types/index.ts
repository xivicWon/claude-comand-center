// Global type definitions

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'developer' | 'viewer'
  permissions: string[]
}

export interface Project {
  id: string
  name: string
  key: string
  description?: string
  members: User[]
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  hasMore: boolean
}