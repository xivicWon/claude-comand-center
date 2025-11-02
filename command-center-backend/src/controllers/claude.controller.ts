import { Request, Response, NextFunction } from 'express';
import * as claudeService from '../services/claude.service';
import { io } from '../index';

export const executeCommand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const execution = await claudeService.executeCommand(req.body);

    // Notify via WebSocket
    io.emit('execution:started', {
      executionId: execution.id,
      issueId: req.body.issueId,
    });

    res.json({
      success: true,
      data: {
        executionId: execution.id,
        jobId: execution.jobId,
        streamUrl: `ws://localhost:8000/executions/${execution.id}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getExecution = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const execution = await claudeService.getExecution(req.params.id);

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: { message: 'Execution not found' },
      });
    }

    res.json({
      success: true,
      data: execution,
    });
  } catch (error) {
    next(error);
  }
};

export const getExecutionsByIssue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { issue_id } = req.query;
    const executions = await claudeService.getExecutionsByIssue(issue_id as string);

    res.json({
      success: true,
      data: executions,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelExecution = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await claudeService.cancelExecution(req.params.id);

    io.to(`execution:${req.params.id}`).emit('execution:cancelled', {
      executionId: req.params.id,
    });

    res.json({
      success: true,
      message: 'Execution cancelled',
    });
  } catch (error) {
    next(error);
  }
};

export const retryExecution = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newExecution = await claudeService.retryExecution(req.params.id);

    res.json({
      success: true,
      data: {
        executionId: newExecution.id,
        jobId: newExecution.jobId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getExecutionLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const logs = await claudeService.getExecutionLogs(req.params.id);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const getExecutionResult = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await claudeService.getExecutionResult(req.params.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const generateCommand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { issueId } = req.body;
    const command = await claudeService.generateCommand(issueId);

    res.json({
      success: true,
      data: command,
    });
  } catch (error) {
    next(error);
  }
};

export const previewCommand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const preview = await claudeService.previewCommand(req.body);

    res.json({
      success: true,
      data: preview,
    });
  } catch (error) {
    next(error);
  }
};

export const getModels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const models = await claudeService.getAvailableModels();

    res.json({
      success: true,
      data: models,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsageStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period } = req.query;
    const stats = await claudeService.getUsageStats(period as string);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};