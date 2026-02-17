import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandlers';
import rateLimit from 'express-rate-limit';

const router = Router();
const authController = new AuthController();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/login', authLimiter, asyncHandler(authController.login.bind(authController)));
router.post('/register', authLimiter, asyncHandler(authController.register.bind(authController)));

// Protected routes
router.post('/refresh', authenticate, asyncHandler(authController.refreshToken.bind(authController)));
router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));

export default router;