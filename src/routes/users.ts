import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandlers';

const router = Router();
const userController = new UserController();

// Apply authentication to all user routes
router.use(authenticate);

// Get current user profile
router.get('/profile', asyncHandler(userController.getProfile.bind(userController)));

// Update current user profile
router.put('/profile', asyncHandler(userController.updateProfile.bind(userController)));

// Change password
router.post('/change-password', asyncHandler(userController.changePassword.bind(userController)));

// Verify email
router.post('/verify-email', asyncHandler(userController.verifyEmail.bind(userController)));

// Admin only routes
router.use(authorize('admin'));

// Get all users (admin only)
router.get('/', asyncHandler(userController.getAllUsers.bind(userController)));

// Get user by ID (admin only)
router.get('/:id', asyncHandler(userController.getUserById.bind(userController)));

// Create new user (admin only)
router.post('/', asyncHandler(userController.createUser.bind(userController)));

// Update user (admin only)
router.put('/:id', asyncHandler(userController.updateUser.bind(userController)));

// Delete user (admin only)
router.delete('/:id', asyncHandler(userController.deleteUser.bind(userController)));

// Deactivate user (admin only)
router.post('/:id/deactivate', asyncHandler(userController.deactivateUser.bind(userController)));

// Activate user (admin only)
router.post('/:id/activate', asyncHandler(userController.activateUser.bind(userController)));

export default router;