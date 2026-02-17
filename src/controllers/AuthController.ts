import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { loginSchema, createUserSchema } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { ValidationError } from '../utils/errors';

export class AuthController {
  private authService: AuthService;
  private userService: UserService;

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
  }

  async login(req: Request, res: Response): Promise<void> {
    const validatedData = loginSchema.parse(req.body);
    const authResponse = await this.authService.login(validatedData);
    
    res.json({
      success: true,
      data: authResponse,
      message: 'Login successful'
    });
  }

  async register(req: Request, res: Response): Promise<void> {
    const validatedData = createUserSchema.parse(req.body);
    
    // Regular users can only register with 'user' role
    const userData = {
      ...validatedData,
      role: 'user' as const
    };
    
    const user = await this.userService.createUser(userData);
    
    // Auto-login after registration
    const authResponse = await this.authService.login({
      email: validatedData.email,
      password: validatedData.password
    });
    
    res.status(201).json({
      success: true,
      data: {
        user: user,
        ...authResponse
      },
      message: 'Registration successful'
    });
  }

  async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const tokenResponse = await this.authService.refreshToken(req.user.id);
    
    res.json({
      success: true,
      data: tokenResponse,
      message: 'Token refreshed successfully'
    });
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return a success response
    // The client should remove the token from storage
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}