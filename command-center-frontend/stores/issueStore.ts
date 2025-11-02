import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface Issue {
  id: string
  code: string
  title: string
  description: string
  type: 'TASK' | 'BUG' | 'FEATURE' | 'HOTFIX' | 'IMPROVEMENT'
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'TESTING' | 'DONE' | 'BLOCKED'
  assignee?: string
  labels: string[]
  attachments?: string[]
  context_files?: string[]
  acceptance_criteria?: string[]
  estimated_hours?: number
  created_at: string
  updated_at: string
}

interface IssueFilters {
  search?: string
  type?: Issue['type']
  priority?: Issue['priority']
  status?: Issue['status']
  assignee?: string
  labels?: string[]
}

interface IssueStore {
  // State
  issues: Issue[]
  selectedIssue: Issue | null
  filters: IssueFilters
  isLoading: boolean
  error: string | null

  // Actions
  setIssues: (issues: Issue[]) => void
  addIssue: (issue: Issue) => void
  updateIssue: (id: string, updates: Partial<Issue>) => void
  deleteIssue: (id: string) => void
  selectIssue: (issue: Issue | null) => void
  setFilters: (filters: IssueFilters) => void
  clearFilters: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed
  getFilteredIssues: () => Issue[]
  getIssuesByStatus: (status: Issue['status']) => Issue[]
}

export const useIssueStore = create<IssueStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        issues: [],
        selectedIssue: null,
        filters: {},
        isLoading: false,
        error: null,

        // Actions
        setIssues: (issues) => set({ issues }),

        addIssue: (issue) =>
          set((state) => ({ issues: [...state.issues, issue] })),

        updateIssue: (id, updates) =>
          set((state) => ({
            issues: state.issues.map((issue) =>
              issue.id === id
                ? { ...issue, ...updates, updated_at: new Date().toISOString() }
                : issue
            ),
          })),

        deleteIssue: (id) =>
          set((state) => ({
            issues: state.issues.filter((issue) => issue.id !== id),
            selectedIssue:
              state.selectedIssue?.id === id ? null : state.selectedIssue,
          })),

        selectIssue: (issue) => set({ selectedIssue: issue }),

        setFilters: (filters) => set({ filters }),

        clearFilters: () => set({ filters: {} }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        // Computed
        getFilteredIssues: () => {
          const { issues, filters } = get()
          let filtered = [...issues]

          if (filters.search) {
            const search = filters.search.toLowerCase()
            filtered = filtered.filter(
              (issue) =>
                issue.title.toLowerCase().includes(search) ||
                issue.code.toLowerCase().includes(search) ||
                issue.description?.toLowerCase().includes(search)
            )
          }

          if (filters.type) {
            filtered = filtered.filter((issue) => issue.type === filters.type)
          }

          if (filters.priority) {
            filtered = filtered.filter(
              (issue) => issue.priority === filters.priority
            )
          }

          if (filters.status) {
            filtered = filtered.filter(
              (issue) => issue.status === filters.status
            )
          }

          if (filters.assignee) {
            filtered = filtered.filter(
              (issue) => issue.assignee === filters.assignee
            )
          }

          if (filters.labels && filters.labels.length > 0) {
            filtered = filtered.filter((issue) =>
              filters.labels!.some((label) => issue.labels.includes(label))
            )
          }

          return filtered
        },

        getIssuesByStatus: (status) => {
          const { issues } = get()
          return issues.filter((issue) => issue.status === status)
        },
      }),
      {
        name: 'issue-store',
        partialize: (state) => ({
          issues: state.issues,
          filters: state.filters,
        }),
      }
    )
  )
)