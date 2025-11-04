import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/lib/api/projects'
import type { Project } from '@/types'

/**
 * 프로젝트 목록 조회 Hook
 *
 * React Query가 자동으로:
 * - 캐싱 (5분간 fresh 유지)
 * - 백그라운드 리페칭
 * - 중복 요청 방지
 * - 에러 재시도 (3회)
 */
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll()

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch projects')
      }

      return response.data
    },
    // 필요 시 추가 옵션
    // refetchInterval: 30000,  // 30초마다 자동 리페칭
  })
}

/**
 * 단일 프로젝트 조회 Hook
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await projectsApi.getById(id)

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch project')
      }

      return response.data
    },
    enabled: !!id,  // id가 있을 때만 실행
  })
}

/**
 * 프로젝트 생성 Mutation Hook
 *
 * 생성 성공 시 자동으로 프로젝트 목록 리페칭
 */
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: (response) => {
      // 1. 프로젝트 목록 캐시 무효화 → 자동 리페칭!
      queryClient.invalidateQueries({ queryKey: ['projects'] })

      // 2. 새 프로젝트를 캐시에 즉시 추가 (Optimistic Update)
      if (response.success && response.data) {
        queryClient.setQueryData<Project[]>(['projects'], (old) => {
          return old ? [...old, response.data!] : [response.data!]
        })
      }
    },
  })
}

/**
 * 프로젝트 수정 Mutation Hook
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      projectsApi.update(id, data),
    onSuccess: (response, variables) => {
      // 1. 해당 프로젝트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] })

      // 2. 프로젝트 목록도 무효화
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

/**
 * 프로젝트 삭제 Mutation Hook
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: (_, deletedId) => {
      // 1. 캐시에서 즉시 제거 (Optimistic Update)
      queryClient.setQueryData<Project[]>(['projects'], (old) => {
        return old ? old.filter((p) => p.id !== deletedId) : []
      })

      // 2. 프로젝트 목록 리페칭
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
