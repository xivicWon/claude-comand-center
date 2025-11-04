import { io } from '../index';

interface Execution {
  id: string;
  jobId: string;
  issueId: string;
  status: string;
  progress: number;
  logs: string[];
  result?: any;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

let mockExecutions: Execution[] = [];

export const executeCommand = async (command: any): Promise<Execution> => {
  const execution: Execution = {
    id: `exec-${Date.now()}`,
    jobId: `job-${Date.now()}`,
    issueId: command.issueId,
    status: 'pending',
    progress: 0,
    logs: [],
    startedAt: new Date(),
  };

  mockExecutions.push(execution);

  // Simulate async execution
  setTimeout(() => simulateExecution(execution.id), 1000);

  return execution;
};

export const executeForIssue = async (issue: any, options?: any): Promise<Execution> => {
  return executeCommand({
    issueId: issue.id,
    issueCode: issue.code,
    prompt: `Process issue: ${issue.title}`,
    context: {
      description: issue.description,
      type: issue.type,
    },
    options,
  });
};

const simulateExecution = async (executionId: string) => {
  const execution = mockExecutions.find(e => e.id === executionId);
  if (!execution) return;

  // Update status to running
  execution.status = 'running';
  io.to(`execution:${executionId}`).emit('execution:progress', {
    executionId,
    progress: 0,
    status: 'running',
  });

  // Simulate progress
  for (let i = 1; i <= 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    execution.progress = i * 10;
    execution.logs.push(`Step ${i} completed`);

    io.to(`execution:${executionId}`).emit('execution:progress', {
      executionId,
      progress: execution.progress,
      log: `Step ${i} completed`,
    });
  }

  // Complete execution
  execution.status = 'completed';
  execution.completedAt = new Date();
  execution.result = {
    success: true,
    filesModified: ['file1.ts', 'file2.ts'],
    testsRun: 5,
    coverage: 85,
  };

  io.to(`execution:${executionId}`).emit('execution:completed', {
    executionId,
    result: execution.result,
  });

  // Auto-move to REVIEW if configured
  await handleExecutionCompletion(execution);
};

const handleExecutionCompletion = async (execution: Execution) => {
  try {
    // Import services dynamically to avoid circular dependencies
    const issueService = await import('./issue.service');

    // Get issue
    const issue = await issueService.getIssueById(execution.issueId);
    if (!issue) return;

    // Get project settings
    const project = await issueService.getIssueProject(execution.issueId);
    if (!project) return;

    const success = execution.status === 'completed';

    // Send Slack notification about completion
    if (project.slackWebhookUrl) {
      const slackService = await import('./slack.service');
      await slackService.notifyClaudeExecutionCompleted(
        project.slackWebhookUrl,
        issue,
        execution,
        success
      );
    }

    // Auto-move to REVIEW if successful and configured
    if (success && project.autoMoveToReview && issue.status === 'IN_PROGRESS') {
      console.log(`🔄 Auto-moving issue ${issue.code} to REVIEW`);

      // Update issue status
      await issueService.updateIssueStatus(execution.issueId, 'REVIEW');

      // Send Slack notification about auto-move
      if (project.slackWebhookUrl) {
        const slackService = await import('./slack.service');
        await slackService.notifyAutoMovedToReview(
          project.slackWebhookUrl,
          { ...issue, status: 'REVIEW' }
        );
      }

      // Emit socket event
      io.emit('issue:statusChanged', {
        issueId: execution.issueId,
        status: 'REVIEW',
        oldStatus: 'IN_PROGRESS',
        autoMoved: true,
      });
    }
  } catch (error) {
    console.error('Error handling execution completion:', error);
  }
};

export const getExecution = async (id: string): Promise<Execution | null> => {
  return mockExecutions.find(e => e.id === id) || null;
};

export const getExecutionsByIssue = async (issueId: string): Promise<Execution[]> => {
  return mockExecutions.filter(e => e.issueId === issueId);
};

export const cancelExecution = async (id: string): Promise<void> => {
  const execution = mockExecutions.find(e => e.id === id);
  if (execution && execution.status === 'running') {
    execution.status = 'cancelled';
    execution.completedAt = new Date();
  }
};

export const retryExecution = async (id: string): Promise<Execution> => {
  const original = mockExecutions.find(e => e.id === id);
  if (!original) throw new Error('Execution not found');

  return executeCommand({
    issueId: original.issueId,
    retry: true,
  });
};

export const getExecutionLogs = async (id: string): Promise<string[]> => {
  const execution = mockExecutions.find(e => e.id === id);
  return execution?.logs || [];
};

export const getExecutionResult = async (id: string): Promise<any> => {
  const execution = mockExecutions.find(e => e.id === id);
  return execution?.result || null;
};

export const generateCommand = async (issueId: string) => {
  return {
    prompt: `Analyze and process issue ${issueId}`,
    context: {
      issueId,
      timestamp: new Date().toISOString(),
    },
    estimatedTokens: 1500,
  };
};

export const previewCommand = async (command: any) => {
  return {
    prompt: command.prompt || 'Generated prompt',
    estimatedTokens: 1500,
    estimatedCost: 0.03,
    warnings: [],
  };
};

export const getAvailableModels = async () => {
  return [
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      contextWindow: 200000,
      costPer1kTokens: 0.015,
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      contextWindow: 200000,
      costPer1kTokens: 0.003,
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      contextWindow: 200000,
      costPer1kTokens: 0.00025,
    },
  ];
};

export const getUsageStats = async (period?: string) => {
  return {
    totalExecutions: mockExecutions.length,
    successRate: 0.95,
    totalTokensUsed: 45000,
    totalCost: 0.675,
    averageExecutionTime: 12.5,
    topIssueTypes: [
      { type: 'BUG', count: 15 },
      { type: 'FEATURE', count: 10 },
      { type: 'TASK', count: 8 },
    ],
  };
};