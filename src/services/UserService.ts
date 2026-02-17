import { UserRepository } from '../repositories/UserRepository';
import { User, CreateUserInput, UpdateUserInput, ChangePasswordInput, UserResponse } from '../models/User';
import { NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: UserResponse[]; total: number; totalPages: number; currentPage: number }> {
    if (page < 1 || limit < 1 || limit > 100) {
      throw new ValidationError('Invalid pagination parameters');
    }

    const { users, total } = await this.userRepository.findAll(page, limit);
    const totalPages = Math.ceil(total / limit);

    const userResponses: UserResponse[] = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt
    }));

    return {
      users: userResponses,
      total,
      totalPages,
      currentPage: page
    };
  }

  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt
    };
  }

  async createUser(userData: CreateUserInput): Promise<UserResponse> {
    // Additional business logic validation
    if (userData.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Check password complexity
    const hasUppercase = /[A-Z]/.test(userData.password);
    const hasLowercase = /[a-z]/.test(userData.password);
    const hasNumbers = /\d/.test(userData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(userData.password);

    if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChar) {
      throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    const user = await this.userRepository.create(userData);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt
    };
  }

  async updateUser(id: string, userData: UpdateUserInput): Promise<UserResponse> {
    const user = await this.userRepository.update(id, userData);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt
    };
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async changePassword(userId: string, passwordData: ChangePasswordInput): Promise<void> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(passwordData.currentPassword, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Validate new password
    if (passwordData.newPassword === passwordData.currentPassword) {
      throw new ValidationError('New password must be different from current password');
    }

    // Check new password complexity
    const hasUppercase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowercase = /[a-z]/.test(passwordData.newPassword);
    const hasNumbers = /\d/.test(passwordData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChar) {
      throw new ValidationError('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    await this.userRepository.updatePassword(userId, passwordData.newPassword);
  }

  async verifyUserEmail(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      throw new ValidationError('Email is already verified');
    }

    await this.userRepository.verifyEmail(userId);
  }

  async deactivateUser(id: string): Promise<UserResponse> {
    return this.updateUser(id, { isActive: false });
  }

  async activateUser(id: string): Promise<UserResponse> {
    return this.updateUser(id, { isActive: true });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.updateLastLogin(userId);
  }
}