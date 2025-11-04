import { Request, Response, NextFunction } from 'express';
import * as issueService from '../services/issue.service';
import * as claudeService from '../services/claude.service';
import { io } from '../index';

export const getAllIssues = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, status, type, priority, assignee } = req.query;
    const issues = await issueService.getAllIssues({
      projectId: projectId as string,
      status: status as string,
      type: type as string,
      priority: priority as string,
      assignee: assignee as string,
    });

    res.json({
      success: true,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

export const getIssueById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const issue = await issueService.getIssueById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: { message: 'Issue not found' },
      });
    }

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const createIssue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId; // From auth middleware
    const issue = await issueService.createIssue({
      ...req.body,
      createdBy: userId,
    });

    // Emit to all connected clients
    io.emit('issue:created', issue);

    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const issue = await issueService.updateIssue(req.params.id, req.body);

    // Emit to all connected clients
    io.emit('issue:updated', issue);

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await issueService.deleteIssue(req.params.id);

    // Emit to all connected clients
    io.emit('issue:deleted', req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateIssueStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;

    // Get issue with old status
    const issueBeforeUpdate = await issueService.getIssueById(req.params.id);
    if (!issueBeforeUpdate) {
      return res.status(404).json({
        success: false,
        error: { message: 'Issue not found' },
      });
    }

    const oldStatus = issueBeforeUpdate.status;

    // Update issue status
    const issue = await issueService.updateIssueStatus(req.params.id, status);

    // Emit socket event
    io.emit('issue:statusChanged', { issueId: req.params.id, status, oldStatus });

    // Get project settings for automation
    const project = await issueService.getIssueProject(issue.id);

    if (project) {
      // Send Slack notification
      if (project.slackWebhookUrl) {
        const slackService = await import('../services/slack.service');
        await slackService.notifyIssueStatusChange(
          project.slackWebhookUrl,
          issue,
          oldStatus,
          status
        );
      }

      // Auto-execute Claude if moved to IN_PROGRESS
      if (status === 'IN_PROGRESS' && project.claudeAutoExecute) {
        console.log(`🤖 Auto-executing Claude for issue ${issue.code}`);

        // Start Claude execution in background
        const execution = await claudeService.executeForIssue(issue, {
          autoExecuted: true,
          projectId: project.id,
        });

        // Notify Slack about execution start
        if (project.slackWebhookUrl) {
          const slackService = await import('../services/slack.service');
          await slackService.notifyClaudeExecutionStarted(
            project.slackWebhookUrl,
            issue,
            execution
          );
        }
      }
    }

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const assignIssue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { assignee } = req.body;
    const issue = await issueService.assignIssue(req.params.id, assignee);

    io.emit('issue:assigned', { issueId: req.params.id, assignee });

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const addLabel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { label } = req.body;
    const issue = await issueService.addLabel(req.params.id, label);

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const removeLabel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const issue = await issueService.removeLabel(
      req.params.id,
      req.params.label
    );

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const searchIssues = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;
    const issues = await issueService.searchIssues(q as string);

    res.json({
      success: true,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

export const getIssueStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await issueService.getIssueStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const executeClaudeCommand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const issueId = req.params.id;
    const issue = await issueService.getIssueById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: { message: 'Issue not found' },
      });
    }

    // Start Claude execution
    const execution = await claudeService.executeForIssue(issue, req.body.options);

    res.json({
      success: true,
      data: {
        executionId: execution.id,
        jobId: execution.jobId,
        streamUrl: `/api/claude/executions/${execution.id}/stream`,
      },
    });
  } catch (error) {
    next(error);
  }
};