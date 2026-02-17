import { Request, Response } from 'express';
import { UserController } from '../../../src/controllers/userController';
import { UserService } from '../../../src/services/userService';
import { ValidationError } from '../../../src/errors/validationError';
import { NotFoundError } from '../../../src/errors/notFoundError';

jest.mock('../../../src/services/userService');

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockUserService = new UserService() as jest.Mocked<UserService>;
    userController = new UserController(mockUserService);
    
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const validUserData = {
      email: 'test@example.com',
      name: 'John Doe',
      password: 'SecurePass123!'
    };

    it('should create user and return 201 status', async () => {
      const createdUser = { id: '1', ...validUserData };
      mockRequest.body = validUserData;
      mockUserService.createUser.mockResolvedValue(createdUser);

      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.createUser).toHaveBeenCalledWith(validUserData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdUser);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with ValidationError when data is invalid', async () => {
      const error = new ValidationError('Invalid email format');
      mockRequest.body = { ...validUserData, email: 'invalid' };
      mockUserService.createUser.mockRejectedValue(error);

      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockRequest.body = validUserData;
      mockUserService.createUser.mockRejectedValue(error);

      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle missing request body', async () => {
      mockRequest.body = undefined;
      const error = new ValidationError('Request body is required');
      mockUserService.createUser.mockRejectedValue(error);

      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserById', () => {
    const userId = '1';
    const user = { id: userId, email: 'test@example.com', name: 'John Doe' };

    it('should return user when found', async () => {
      mockRequest.params = { id: userId };
      mockUserService.getUserById.mockResolvedValue(user);

      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when user not found', async () => {
      const error = new NotFoundError('User not found');
      mockRequest.params = { id: userId };
      mockUserService.getUserById.mockRejectedValue(error);

      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should call next with ValidationError for invalid ID', async () => {
      const error = new ValidationError('Invalid user ID');
      mockRequest.params = { id: 'invalid' };
      mockUserService.getUserById.mockRejectedValue(error);

      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle missing ID parameter', async () => {
      mockRequest.params = {};
      const error = new ValidationError('User ID is required');
      mockUserService.getUserById.mockRejectedValue(error);

      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUser', () => {
    const userId = '1';
    const updateData = { name: 'Updated Name', email: 'updated@example.com' };
    const updatedUser = { id: userId, ...updateData };

    it('should update user and return updated data', async () => {
      mockRequest.params = { id: userId };
      mockRequest.body = updateData;
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when user not found', async () => {
      const error = new NotFoundError('User not found');
      mockRequest.params = { id: userId };
      mockRequest.body = updateData;
      mockUserService.updateUser.mockRejectedValue(error);

      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle validation errors', async () => {
      const error = new ValidationError('Invalid email format');
      mockRequest.params = { id: userId };
      mockRequest.body = { email: 'invalid-email' };
      mockUserService.updateUser.mockRejectedValue(error);

      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle empty update body', async () => {
      mockRequest.params = { id: userId };
      mockRequest.body = {};
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, {});
    });
  });

  describe('deleteUser', () => {
    const userId = '1';

    it('should delete user and return 204 status', async () => {
      mockRequest.params = { id: userId };
      mockUserService.deleteUser.mockResolvedValue(undefined);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when user not found', async () => {
      const error = new NotFoundError('User not found');
      mockRequest.params = { id: userId };
      mockUserService.deleteUser.mockRejectedValue(error);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle service errors', async () => {
      const error = new Error('Deletion failed');
      mockRequest.params = { id: userId };
      mockUserService.deleteUser.mockRejectedValue(error);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllUsers', () => {
    const users = [
      { id: '1', email: 'user1@example.com', name: 'User 1' },
      { id: '2', email: 'user2@example.com', name: 'User 2' }
    ];

    it('should return all users', async () => {
      mockUserService.getAllUsers.mockResolvedValue(users);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getAllUsers).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(users);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      mockUserService.getAllUsers.mockResolvedValue([]);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockUserService.getAllUsers.mockRejectedValue(error);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserByEmail', () => {
    const email = 'test@example.com';
    const user = { id: '1', email, name: 'John Doe' };

    it('should return user when found by email', async () => {
      mockRequest.query = { email };
      mockUserService.getUserByEmail.mockResolvedValue(user);

      await userController.getUserByEmail(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when user not found', async () => {
      const error = new NotFoundError('User not found');
      mockRequest.query = { email };
      mockUserService.getUserByEmail.mockRejectedValue(error);

      await userController.getUserByEmail(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle invalid email format', async () => {
      const error = new ValidationError('Invalid email format');
      mockRequest.query = { email: 'invalid-email' };
      mockUserService.getUserByEmail.mockRejectedValue(error);

      await userController.getUserByEmail(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle missing email parameter', async () => {
      mockRequest.query = {};
      const error = new ValidationError('Email parameter is required');
      mockUserService.getUserByEmail.mockRejectedValue(error);

      await userController.getUserByEmail(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});