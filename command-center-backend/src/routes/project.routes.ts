import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/projects - Create new project
router.post('/', projectController.createProject);

// GET /api/projects - Get all projects for current user
router.get('/', projectController.getProjects);

// GET /api/projects/:id - Get project by ID
router.get('/:id', projectController.getProjectById);

// PUT /api/projects/:id - Update project
router.put('/:id', projectController.updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', projectController.deleteProject);

// POST /api/projects/:id/rescan - Rescan project directory
router.post('/:id/rescan', projectController.rescanProject);

// POST /api/projects/validate-directory - Validate directory path
router.post('/validate-directory', projectController.validateDirectory);

export default router;
