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
  description: string        // 필수로 변경 (빈 문자열 보장)
  members: User[]            // 필수로 변경 (빈 배열 보장)
  created_at: string
  updated_at: string
}

export type IssueType = 'TASK' | 'BUG' | 'FEATURE' | 'HOTFIX' | 'IMPROVEMENT'
export type IssuePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'TESTING' | 'DONE'

export interface Issue {
  id: string
  code: string
  project_id: string
  title: string
  description?: string
  type: IssueType
  priority: IssuePriority
  status: IssueStatus
  assignee?: User
  reporter?: User
  labels: string[]
  tags?: string[]
  attachments?: string[]
  context_files?: string[]
  acceptance_criteria?: string[]
  estimated_hours?: number
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