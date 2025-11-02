import { Router } from 'express';
import * as issueController from '../controllers/issue.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/issues - Get all issues
router.get('/', issueController.getAllIssues);

// GET /api/issues/stats - Get issue statistics
router.get('/stats', issueController.getIssueStats);

// GET /api/issues/search - Search issues
router.get('/search', issueController.searchIssues);

// GET /api/issues/:id - Get single issue
router.get('/:id', issueController.getIssueById);

// POST /api/issues - Create new issue
router.post('/', issueController.createIssue);

// PATCH /api/issues/:id - Update issue
router.patch('/:id', issueController.updateIssue);

// DELETE /api/issues/:id - Delete issue
router.delete('/:id', issueController.deleteIssue);

// PATCH /api/issues/:id/status - Update issue status
router.patch('/:id/status', issueController.updateIssueStatus);

// PATCH /api/issues/:id/assign - Assign issue
router.patch('/:id/assign', issueController.assignIssue);

// POST /api/issues/:id/labels - Add label
router.post('/:id/labels', issueController.addLabel);

// DELETE /api/issues/:id/labels/:label - Remove label
router.delete('/:id/labels/:label', issueController.removeLabel);

// POST /api/issues/:id/execute - Execute Claude command for issue
router.post('/:id/execute', issueController.executeClaudeCommand);

export default router;