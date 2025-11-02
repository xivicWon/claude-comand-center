import apiClient from './client'

export interface ClaudeCommand {
  issueId: string
  issueCode: string
  prompt: string
  context?: {
    files?: string[]
    description?: string
    acceptance_criteria?: string[]
  }
  options?: {
    model?: 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku'
    maxTokens?: number
    temperature?: number
    timeout?: number
  }
}

export interface ClaudeExecution {
  id: string
  jobId: string
  issueId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  logs: string[]
  result?: any
  error?: string
  startedAt?: string
  completedAt?: string
  metrics?: {
    tokensUsed: number
    executionTime: number
    filesModified: number
    testsRun?: number
    coverage?: number
  }
}

export interface ClaudeWebSocketMessage {
  type: 'progress' | 'log' | 'result' | 'error'
  executionId: string
  data: any
}

export const claudeApi = {
  // Execute Claude command for an issue
  async execute(command: ClaudeCommand): Promise<{
    executionId: string
    jobId: string
    streamUrl: string
  }> {
    return apiClient.post<{
      executionId: string
      jobId: string
      streamUrl: string
    }>('/claude/execute', command)
  },

  // Get execution status
  async getExecution(executionId: string): Promise<ClaudeExecution> {
    return apiClient.get<ClaudeExecution>(`/claude/executions/${executionId}`)
  },

  // Get all executions for an issue
  async getExecutionsByIssue(issueId: string): Promise<ClaudeExecution[]> {
    return apiClient.get<ClaudeExecution[]>('/claude/executions', {
      issue_id: issueId,
    })
  },

  // Cancel execution
  async cancelExecution(executionId: string): Promise<void> {
    return apiClient.post(`/claude/executions/${executionId}/cancel`)
  },

  // Retry failed execution
  async retryExecution(executionId: string): Promise<{
    executionId: string
    jobId: string
  }> {
    return apiClient.post(`/claude/executions/${executionId}/retry`)
  },

  // Get execution logs
  async getExecutionLogs(executionId: string): Promise<string[]> {
    return apiClient.get<string[]>(`/claude/executions/${executionId}/logs`)
  },

  // Get execution result
  async getExecutionResult(executionId: string): Promise<any> {
    return apiClient.get(`/claude/executions/${executionId}/result`)
  },

  // Generate command from issue
  async generateCommand(issueId: string): Promise<{
    prompt: string
    context: any
    estimatedTokens: number
  }> {
    return apiClient.post(`/claude/generate-command`, { issueId })
  },

  // Preview command (dry run)
  async previewCommand(command: ClaudeCommand): Promise<{
    prompt: string
    estimatedTokens: number
    estimatedCost: number
    warnings?: string[]
  }> {
    return apiClient.post('/claude/preview', command)
  },

  // Get available models
  async getModels(): Promise<
    Array<{
      id: string
      name: string
      contextWindow: number
      costPer1kTokens: number
    }>
  > {
    return apiClient.get('/claude/models')
  },

  // Get usage statistics
  async getUsageStats(period?: 'day' | 'week' | 'month'): Promise<{
    totalExecutions: number
    successRate: number
    totalTokensUsed: number
    totalCost: number
    averageExecutionTime: number
    topIssueTypes: Array<{ type: string; count: number }>
  }> {
    const params = period ? { period } : undefined
    return apiClient.get('/claude/stats', params)
  },
}

// WebSocket connection for real-time updates
export class ClaudeWebSocket {
  private ws: WebSocket | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  connect(url: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.ws = new WebSocket(url)

    this.ws.onmessage = (event) => {
      try {
        const message: ClaudeWebSocketMessage = JSON.parse(event.data)
        this.emit(message.executionId, message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    this.ws.onclose = () => {
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connect(url), 5000)
    }
  }

  subscribe(executionId: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(executionId)) {
      this.listeners.set(executionId, new Set())
    }
    this.listeners.get(executionId)!.add(callback)

    // Send subscription message
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', executionId }))
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(executionId)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(executionId)
          // Send unsubscribe message
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'unsubscribe', executionId }))
          }
        }
      }
    }
  }

  private emit(executionId: string, data: any): void {
    const callbacks = this.listeners.get(executionId)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
  }
}

export const claudeWebSocket = new ClaudeWebSocket()

export default claudeApi