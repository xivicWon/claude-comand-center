import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * Project UI Store
 *
 * React Query가 서버 상태(프로젝트 데이터)를 관리하므로
 * 이 Store는 순수한 UI 상태만 관리합니다.
 *
 * 서버 상태는 `/hooks/useProjects.ts`의 React Query hooks를 사용하세요.
 */

export type ProjectViewMode = 'grid' | 'list'
export type ProjectSortBy = 'name' | 'updated' | 'created'

interface ProjectUIStore {
  // UI State
  selectedProjectId: string | null
  viewMode: ProjectViewMode
  sortBy: ProjectSortBy
  searchQuery: string

  // Actions
  setSelectedProjectId: (id: string | null) => void
  setViewMode: (mode: ProjectViewMode) => void
  setSortBy: (sortBy: ProjectSortBy) => void
  setSearchQuery: (query: string) => void
  clearSelection: () => void
}

export const useProjectStore = create<ProjectUIStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        selectedProjectId: null,
        viewMode: 'grid',
        sortBy: 'updated',
        searchQuery: '',

        // Actions
        setSelectedProjectId: (id) => set({ selectedProjectId: id }),
        setViewMode: (mode) => set({ viewMode: mode }),
        setSortBy: (sortBy) => set({ sortBy }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        clearSelection: () => set({ selectedProjectId: null }),
      }),
      {
        name: 'project-ui-store',
        partialize: (state) => ({
          viewMode: state.viewMode,
          sortBy: state.sortBy,
        }),
      }
    )
  )
)
