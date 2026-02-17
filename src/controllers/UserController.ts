import { Response } from 'express';
import { UserService } from '../services/UserService';
import { createUserSchema, updateUserSchema, changePasswordSchema } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { ValidationError, ForbiddenError } from '../utils/errors';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.userService.getAllUsers(page, limit);
    
    res.json({
      success: true,
      data: result.users,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        total: result.total,
        limit
      }
    });
  }

  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await this.userService.getUserById(id);
    
    res.json({
      success: true,
      data: user
    });
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const user = await this.userService.getUserById(req.user.id);
    
    res.json({
      success: true,
      data: user
    });
  }

  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const validatedData = createUserSchema.parse(req.body);
    const user = await this.userService.createUser(validatedData);
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  }

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);
    
    const user = await this.userService.updateUser(id, validatedData);
    
    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const validatedData = updateUserSchema.parse(req.body);
    
    // Users can't change their own role or active status
    if (validatedData.role || validatedData.isActive !== undefined) {
      throw new ForbiddenError('Cannot modify role or active status');
    }
    
    const user = await this.userService.updateUser(req.user.id, validatedData);
    
    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  }

  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    
    // Prevent users from deleting themselves
    if (req.user?.id === id) {
      throw new ForbiddenError('Cannot delete your own account');
    }
    
    await this.userService.deleteUser(id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  }

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const validatedData = changePasswordSchema.parse(req.body);
    
    await this.userService.changePassword(req.user.id, validatedData);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  }

  async verifyEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    await this.userService.verifyUserEmail(req.user.id);
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  }

  async deactivateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    
    // Prevent users from deactivating themselves
    if (req.user?.id === id) {
      throw new ForbiddenError('Cannot deactivate your own account');
    }
    
    const user = await this.userService.deactivateUser(id);
    
    res.json({
      success: true,
      data: user,
      message: 'User deactivated successfully'
    });
  }

  async activateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await this.userService.activateUser(id);
    
    res.json({
      success: true,
      data: user,
      message: 'User activated successfully'
    });
  }
}