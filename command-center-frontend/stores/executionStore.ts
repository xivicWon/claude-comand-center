import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Execution {
  id: string
  issueId: string
  issueCode: string
  command: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  logs: string[]
  result?: any
  error?: string
  startTime: Date
  endTime?: Date
  tokensUsed?: number
  filesModified?: string[]
}

interface ExecutionStore {
  // State
  executions: Map<string, Execution>
  activeExecution: string | null
  isConnected: boolean

  // Actions
  startExecution: (issueId: string, issueCode: string, command: string) => string
  updateProgress: (id: string, progress: number) => void
  addLog: (id: string, log: string) => void
  completeExecution: (id: string, result: any) => void
  failExecution: (id: string, error: string) => void
  setActiveExecution: (id: string | null) => void
  clearExecution: (id: string) => void
  setConnectionStatus: (connected: boolean) => void

  // Computed
  getExecution: (id: string) => Execution | undefined
  getExecutionsByIssue: (issueId: string) => Execution[]
  getActiveExecution: () => Execution | undefined
}

export const useExecutionStore = create<ExecutionStore>()(
  devtools((set, get) => ({
    // Initial state
    executions: new Map(),
    activeExecution: null,
    isConnected: false,

    // Actions
    startExecution: (issueId, issueCode, command) => {
      const id = `exec-${Date.now()}`
      const execution: Execution = {
        id,
        issueId,
        issueCode,
        command,
        status: 'pending',
        progress: 0,
        logs: [],
        startTime: new Date(),
      }

      set((state) => {
        const newExecutions = new Map(state.executions)
        newExecutions.set(id, execution)
        return {
          executions: newExecutions,
          activeExecution: id,
        }
      })

      return id
    },

    updateProgress: (id, progress) =>
      set((state) => {
        const execution = state.executions.get(id)
        if (execution) {
          const updated = {
            ...execution,
            status: 'running' as const,
            progress,
          }
          const newExecutions = new Map(state.executions)
          newExecutions.set(id, updated)
          return { executions: newExecutions }
        }
        return state
      }),

    addLog: (id, log) =>
      set((state) => {
        const execution = state.executions.get(id)
        if (execution) {
          const updated = {
            ...execution,
            logs: [...execution.logs, `[${new Date().toISOString()}] ${log}`],
          }
          const newExecutions = new Map(state.executions)
          newExecutions.set(id, updated)
          return { executions: newExecutions }
        }
        return state
      }),

    completeExecution: (id, result) =>
      set((state) => {
        const execution = state.executions.get(id)
        if (execution) {
          const updated = {
            ...execution,
            status: 'completed' as const,
            progress: 100,
            result,
            endTime: new Date(),
          }
          const newExecutions = new Map(state.executions)
          newExecutions.set(id, updated)
          return {
            executions: newExecutions,
            activeExecution: state.activeExecution === id ? null : state.activeExecution,
          }
        }
        return state
      }),

    failExecution: (id, error) =>
      set((state) => {
        const execution = state.executions.get(id)
        if (execution) {
          const updated = {
            ...execution,
            status: 'failed' as const,
            error,
            endTime: new Date(),
          }
          const newExecutions = new Map(state.executions)
          newExecutions.set(id, updated)
          return {
            executions: newExecutions,
            activeExecution: state.activeExecution === id ? null : state.activeExecution,
          }
        }
        return state
      }),

    setActiveExecution: (id) => set({ activeExecution: id }),

    clearExecution: (id) =>
      set((state) => {
        const newExecutions = new Map(state.executions)
        newExecutions.delete(id)
        return {
          executions: newExecutions,
          activeExecution: state.activeExecution === id ? null : state.activeExecution,
        }
      }),

    setConnectionStatus: (connected) => set({ isConnected: connected }),

    // Computed
    getExecution: (id) => get().executions.get(id),

    getExecutionsByIssue: (issueId) => {
      const executions = Array.from(get().executions.values())
      return executions.filter((exec) => exec.issueId === issueId)
    },

    getActiveExecution: () => {
      const { activeExecution, executions } = get()
      return activeExecution ? executions.get(activeExecution) : undefined
    },
  }))
)