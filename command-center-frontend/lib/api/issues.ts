import apiClient from './client'
import type { Issue } from '@/types'

export interface CreateIssueDTO {
  title: string
  description: string
  type: Issue['type']
  priority: Issue['priority']
  labels?: string[]
  assignee?: string
  context_files?: string[]
  acceptance_criteria?: string[]
  estimated_hours?: number
}

export interface UpdateIssueDTO extends Partial<CreateIssueDTO> {
  status?: Issue['status']
}

export const issuesApi = {
  // Get all issues
  async getAll(projectId?: string): Promise<Issue[]> {
    const params = projectId ? { project_id: projectId } : undefined
    return apiClient.get<Issue[]>('/issues', params)
  },

  // Get single issue
  async getById(id: string): Promise<Issue> {
    return apiClient.get<Issue>(`/issues/${id}`)
  },

  // Create new issue
  async create(data: CreateIssueDTO): Promise<Issue> {
    return apiClient.post<Issue>('/issues', data)
  },

  // Update issue
  async update(id: string, data: UpdateIssueDTO): Promise<Issue> {
    return apiClient.patch<Issue>(`/issues/${id}`, data)
  },

  // Delete issue
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/issues/${id}`)
  },

  // Move issue to different status
  async updateStatus(id: string, status: Issue['status']): Promise<Issue> {
    return apiClient.patch<Issue>(`/issues/${id}/status`, { status })
  },

  // Assign issue
  async assign(id: string, assignee: string): Promise<Issue> {
    return apiClient.patch<Issue>(`/issues/${id}/assign`, { assignee })
  },

  // Add label
  async addLabel(id: string, label: string): Promise<Issue> {
    return apiClient.post<Issue>(`/issues/${id}/labels`, { label })
  },

  // Remove label
  async removeLabel(id: string, label: string): Promise<Issue> {
    return apiClient.delete<Issue>(`/issues/${id}/labels/${label}`)
  },

  // Search issues
  async search(query: string): Promise<Issue[]> {
    return apiClient.get<Issue[]>('/issues/search', { q: query })
  },

  // Get issue statistics
  async getStats(): Promise<{
    total: number
    byStatus: Record<string, number>
    byType: Record<string, number>
    byPriority: Record<string, number>
  }> {
    return apiClient.get('/issues/stats')
  },
}

export default issuesApi