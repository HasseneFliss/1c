import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { LoginInput } from '../models/User';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import { env } from '../config/env';
import { UserService } from './UserService';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  token: string;
  expiresIn: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private userService: UserService;

  constructor() {
    this.userRepository = new UserRepository();
    this.userService = new UserService();
  }

  async login(loginData: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(loginData.email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isValidPassword = await bcrypt.compare(loginData.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login time
    await this.userService.updateLastLogin(user.id);

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token,
      expiresIn: env.JWT_EXPIRES_IN
    };
  }

  async refreshToken(userId: string): Promise<{ token: string; expiresIn: string }> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      expiresIn: env.JWT_EXPIRES_IN
    };
  }

  private generateToken(payload: { userId: string; email: string; role: string }): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
      issuer: 'user-api',
      audience: 'user-app'
    });
  }

  verifyToken(token: string): { userId: string; email: string; role: string } {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: 'user-api',
        audience: 'user-app'
      }) as { userId: string; email: string; role: string };
      
      return decoded;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}