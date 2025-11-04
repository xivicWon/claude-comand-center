/**
 * Slack Notification Service
 *
 * Sends Slack notifications for issue status changes and Claude executions
 */

interface SlackMessage {
  text: string;
  attachments?: SlackAttachment[];
}

interface SlackAttachment {
  color?: string;
  title?: string;
  text?: string;
  fields?: SlackField[];
  footer?: string;
  ts?: number;
}

interface SlackField {
  title: string;
  value: string;
  short?: boolean;
}

/**
 * Get color based on issue status
 */
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    TODO: '#9E9E9E',
    IN_PROGRESS: '#2196F3',
    REVIEW: '#FF9800',
    TESTING: '#9C27B0',
    DONE: '#4CAF50',
    BLOCKED: '#F44336',
  };
  return colors[status] || '#9E9E9E';
};

/**
 * Get color based on priority
 */
const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    CRITICAL: '#F44336',
    HIGH: '#FF9800',
    MEDIUM: '#FFC107',
    LOW: '#4CAF50',
  };
  return colors[priority] || '#9E9E9E';
};

/**
 * Send Slack notification
 */
export const sendSlackNotification = async (
  webhookUrl: string,
  message: SlackMessage
): Promise<void> => {
  if (!webhookUrl || webhookUrl.trim() === '') {
    console.log('⚠️  No Slack webhook URL configured, skipping notification');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Slack notification sent successfully');
  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error);
    throw error;
  }
};

/**
 * Notify issue status change
 */
export const notifyIssueStatusChange = async (
  webhookUrl: string,
  issue: any,
  oldStatus: string,
  newStatus: string
): Promise<void> => {
  const message: SlackMessage = {
    text: `Task ${issue.code} moved from *${oldStatus}* to *${newStatus}*`,
    attachments: [
      {
        color: getStatusColor(newStatus),
        title: issue.title,
        text: issue.description,
        fields: [
          {
            title: 'Priority',
            value: issue.priority,
            short: true,
          },
          {
            title: 'Type',
            value: issue.type,
            short: true,
          },
          {
            title: 'Status',
            value: newStatus,
            short: true,
          },
          {
            title: 'Previous Status',
            value: oldStatus,
            short: true,
          },
        ],
        footer: 'Command Center',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  await sendSlackNotification(webhookUrl, message);
};

/**
 * Notify Claude execution started
 */
export const notifyClaudeExecutionStarted = async (
  webhookUrl: string,
  issue: any,
  execution: any
): Promise<void> => {
  const message: SlackMessage = {
    text: `🤖 Claude started processing task ${issue.code}`,
    attachments: [
      {
        color: '#2196F3',
        title: issue.title,
        text: issue.description,
        fields: [
          {
            title: 'Execution ID',
            value: execution.id,
            short: true,
          },
          {
            title: 'Priority',
            value: issue.priority,
            short: true,
          },
          {
            title: 'Type',
            value: issue.type,
            short: true,
          },
        ],
        footer: 'Command Center - Claude Execution',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  await sendSlackNotification(webhookUrl, message);
};

/**
 * Notify Claude execution completed
 */
export const notifyClaudeExecutionCompleted = async (
  webhookUrl: string,
  issue: any,
  execution: any,
  success: boolean
): Promise<void> => {
  const emoji = success ? '✅' : '❌';
  const status = success ? 'completed successfully' : 'failed';
  const color = success ? '#4CAF50' : '#F44336';

  const fields: SlackField[] = [
    {
      title: 'Execution ID',
      value: execution.id,
      short: true,
    },
    {
      title: 'Duration',
      value: calculateDuration(execution.startedAt, execution.completedAt),
      short: true,
    },
  ];

  if (success && execution.result) {
    if (execution.result.filesModified) {
      fields.push({
        title: 'Files Modified',
        value: execution.result.filesModified.length.toString(),
        short: true,
      });
    }
    if (execution.result.testsRun) {
      fields.push({
        title: 'Tests Run',
        value: execution.result.testsRun.toString(),
        short: true,
      });
    }
  }

  if (!success && execution.error) {
    fields.push({
      title: 'Error',
      value: execution.error.substring(0, 200),
      short: false,
    });
  }

  const message: SlackMessage = {
    text: `${emoji} Claude ${status} for task ${issue.code}`,
    attachments: [
      {
        color,
        title: issue.title,
        fields,
        footer: 'Command Center - Claude Execution',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  await sendSlackNotification(webhookUrl, message);
};

/**
 * Notify issue auto-moved to review
 */
export const notifyAutoMovedToReview = async (
  webhookUrl: string,
  issue: any
): Promise<void> => {
  const message: SlackMessage = {
    text: `🔄 Task ${issue.code} automatically moved to *REVIEW*`,
    attachments: [
      {
        color: '#FF9800',
        title: issue.title,
        text: 'Claude execution completed successfully. Task is ready for review.',
        fields: [
          {
            title: 'Priority',
            value: issue.priority,
            short: true,
          },
          {
            title: 'Type',
            value: issue.type,
            short: true,
          },
        ],
        footer: 'Command Center - Auto-moved',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  await sendSlackNotification(webhookUrl, message);
};

/**
 * Calculate duration between two dates
 */
const calculateDuration = (start: Date, end: Date): string => {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Test Slack webhook URL
 */
export const testSlackWebhook = async (webhookUrl: string): Promise<boolean> => {
  try {
    const message: SlackMessage = {
      text: '🧪 Test notification from Command Center',
      attachments: [
        {
          color: '#2196F3',
          text: 'If you can see this message, your Slack webhook is configured correctly!',
          footer: 'Command Center',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await sendSlackNotification(webhookUrl, message);
    return true;
  } catch (error) {
    console.error('Slack webhook test failed:', error);
    return false;
  }
};
