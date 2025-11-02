import { Router } from 'express';
import * as claudeController from '../controllers/claude.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/claude/execute - Execute Claude command
router.post('/execute', claudeController.executeCommand);

// GET /api/claude/executions/:id - Get execution status
router.get('/executions/:id', claudeController.getExecution);

// GET /api/claude/executions - Get executions by issue
router.get('/executions', claudeController.getExecutionsByIssue);

// POST /api/claude/executions/:id/cancel - Cancel execution
router.post('/executions/:id/cancel', claudeController.cancelExecution);

// POST /api/claude/executions/:id/retry - Retry execution
router.post('/executions/:id/retry', claudeController.retryExecution);

// GET /api/claude/executions/:id/logs - Get execution logs
router.get('/executions/:id/logs', claudeController.getExecutionLogs);

// GET /api/claude/executions/:id/result - Get execution result
router.get('/executions/:id/result', claudeController.getExecutionResult);

// POST /api/claude/generate-command - Generate command from issue
router.post('/generate-command', claudeController.generateCommand);

// POST /api/claude/preview - Preview command
router.post('/preview', claudeController.previewCommand);

// GET /api/claude/models - Get available models
router.get('/models', claudeController.getModels);

// GET /api/claude/stats - Get usage statistics
router.get('/stats', claudeController.getUsageStats);

export default router;