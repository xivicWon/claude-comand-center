import apiClient from './client'
import type { Project, ApiResponse } from '@/types'
import { projectMapper, type ProjectApiResponse } from '@/lib/mappers/projectMapper'

export interface CreateProjectDTO {
  name: string
  description?: string
  directory?: string
  gitRepo?: string
  gitBranch?: string
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {
  key?: string
}

/**
 * Projects API
 * 모든 응답은 Mapper를 거쳐 안전한 도메인 모델로 변환됩니다.
 */
export const projectsApi = {
  // Get all projects
  async getAll(): Promise<ApiResponse<Project[]>> {
    const response = await apiClient.get<ApiResponse<ProjectApiResponse[]>>('/projects')

    // Mapper를 통해 API 응답을 도메인 모델로 변환
    if (response.success && response.data) {
      return {
        ...response,
        data: projectMapper.toDomainList(response.data),
      }
    }

    return response as ApiResponse<Project[]>
  },

  // Get single project
  async getById(id: string): Promise<ApiResponse<Project>> {
    const response = await apiClient.get<ApiResponse<ProjectApiResponse>>(`/projects/${id}`)

    // Mapper를 통해 변환
    if (response.success && response.data) {
      return {
        ...response,
        data: projectMapper.toDomain(response.data),
      }
    }

    return response as ApiResponse<Project>
  },

  // Create new project
  async create(data: CreateProjectDTO): Promise<ApiResponse<Project>> {
    const response = await apiClient.post<ApiResponse<ProjectApiResponse>>('/projects', data)

    // Mapper를 통해 변환
    if (response.success && response.data) {
      return {
        ...response,
        data: projectMapper.toDomain(response.data),
      }
    }

    return response as ApiResponse<Project>
  },

  // Update project
  async update(id: string, data: UpdateProjectDTO): Promise<ApiResponse<Project>> {
    const response = await apiClient.patch<ApiResponse<ProjectApiResponse>>(
      `/projects/${id}`,
      data
    )

    // Mapper를 통해 변환
    if (response.success && response.data) {
      return {
        ...response,
        data: projectMapper.toDomain(response.data),
      }
    }

    return response as ApiResponse<Project>
  },

  // Delete project
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/projects/${id}`)
  },

  // Validate directory
  async validateDirectory(directory: string): Promise<ApiResponse<{ valid: boolean }>> {
    return apiClient.post<ApiResponse<{ valid: boolean }>>('/projects/validate-directory', {
      directory,
    })
  },
}

export default projectsApi
