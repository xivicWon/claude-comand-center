import type { Project, User } from '@/types'

/**
 * API 응답 타입 (백엔드에서 받는 실제 데이터 구조)
 * Optional 필드가 많아 신뢰할 수 없는 구조
 */
export interface ProjectApiResponse {
  id: string
  name: string
  key: string
  description?: string | null
  members?: UserApiResponse[] | null
  created_at: string
  updated_at: string
}

export interface UserApiResponse {
  id: string
  name?: string | null
  email: string
  avatar?: string | null
  role?: string | null
  permissions?: string[] | null
}

/**
 * Project Mapper
 * API 응답을 안전한 도메인 모델로 변환
 *
 * 목적:
 * 1. API 의존성 분리 - 백엔드 구조가 변경되어도 영향 최소화
 * 2. 데이터 정규화 - null/undefined를 안전한 기본값으로 변환
 * 3. 타입 안전성 - 도메인 레이어에서는 항상 안전한 타입 사용
 */
export const projectMapper = {
  /**
   * API 응답을 도메인 모델로 변환
   */
  toDomain(apiProject: ProjectApiResponse): Project {
    return {
      id: apiProject.id,
      name: apiProject.name,
      key: apiProject.key,
      description: apiProject.description || '',
      members: Array.isArray(apiProject.members)
        ? apiProject.members.map(this.mapUser)
        : [],
      created_at: apiProject.created_at,
      updated_at: apiProject.updated_at,
    }
  },

  /**
   * 여러 프로젝트를 한 번에 변환
   */
  toDomainList(apiProjects: ProjectApiResponse[]): Project[] {
    return apiProjects.map((project) => this.toDomain(project))
  },

  /**
   * User API 응답을 도메인 모델로 변환
   */
  mapUser(apiUser: UserApiResponse): User {
    return {
      id: apiUser.id,
      name: apiUser.name || 'Unknown',
      email: apiUser.email,
      avatar: apiUser.avatar || undefined,
      role: (apiUser.role as User['role']) || 'viewer',
      permissions: Array.isArray(apiUser.permissions) ? apiUser.permissions : [],
    }
  },

  /**
   * 도메인 모델을 API 요청 형식으로 변환 (생성/수정 시)
   */
  toApiRequest(project: Partial<Project>): Partial<ProjectApiResponse> {
    return {
      name: project.name,
      key: project.key,
      description: project.description,
      // members는 보통 별도 API로 관리하므로 제외
    }
  },
}

export default projectMapper
