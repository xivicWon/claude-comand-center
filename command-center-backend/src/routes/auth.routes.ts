import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/auth/login - Login user
router.post('/login', authController.login);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken);

// POST /api/auth/logout - Logout user
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me - Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// PATCH /api/auth/me - Update current user
router.patch('/me', authenticate, authController.updateCurrentUser);

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticate, authController.changePassword);

// GET /api/auth/users - Get all users (for testing)
router.get('/users', authController.getAllUsers);

export default router;