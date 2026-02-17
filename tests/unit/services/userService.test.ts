import { UserService } from '../../../src/services/userService';
import { UserRepository } from '../../../src/repositories/userRepository';
import { EmailService } from '../../../src/services/emailService';
import { User } from '../../../src/models/user';
import { ValidationError } from '../../../src/errors/validationError';
import { NotFoundError } from '../../../src/errors/notFoundError';

jest.mock('../../../src/repositories/userRepository');
jest.mock('../../../src/services/emailService');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockEmailService = new EmailService() as jest.Mocked<EmailService>;
    userService = new UserService(mockUserRepository, mockEmailService);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const validUserData = {
      email: 'test@example.com',
      name: 'John Doe',
      password: 'SecurePass123!'
    };

    it('should create user with valid data', async () => {
      const expectedUser = { id: '1', ...validUserData, hashedPassword: 'hashed123' };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(expectedUser);
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await userService.createUser(validUserData);

      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validUserData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: validUserData.email,
        name: validUserData.name
      }));
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(expectedUser);
    });

    it('should throw ValidationError when email is invalid', async () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };

      await expect(userService.createUser(invalidData)).rejects.toThrow(ValidationError);
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when email already exists', async () => {
      const existingUser = { id: '1', email: validUserData.email };
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(userService.createUser(validUserData)).rejects.toThrow(ValidationError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when name is empty', async () => {
      const invalidData = { ...validUserData, name: '' };

      await expect(userService.createUser(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when name is null', async () => {
      const invalidData = { ...validUserData, name: null as any };

      await expect(userService.createUser(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when password is too short', async () => {
      const invalidData = { ...validUserData, password: '123' };

      await expect(userService.createUser(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should handle repository creation failure', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(userService.createUser(validUserData)).rejects.toThrow('Database error');
    });

    it('should handle email service failure gracefully', async () => {
      const expectedUser = { id: '1', ...validUserData };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(expectedUser);
      mockEmailService.sendWelcomeEmail.mockRejectedValue(new Error('Email failed'));

      const result = await userService.createUser(validUserData);

      expect(result).toEqual(expectedUser);
    });
  });

  describe('getUserById', () => {
    it('should return user when valid ID provided', async () => {
      const userId = '1';
      const expectedUser = { id: userId, email: 'test@example.com', name: 'John Doe' };
      mockUserRepository.findById.mockResolvedValue(expectedUser);

      const result = await userService.getUserById(userId);

      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const userId = '999';
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById(userId)).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when ID is empty', async () => {
      await expect(userService.getUserById('')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when ID is null', async () => {
      await expect(userService.getUserById(null as any)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when ID is undefined', async () => {
      await expect(userService.getUserById(undefined as any)).rejects.toThrow(ValidationError);
    });

    it('should handle repository failure', async () => {
      const userId = '1';
      mockUserRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      await expect(userService.getUserById(userId)).rejects.toThrow('Database connection failed');
    });
  });

  describe('updateUser', () => {
    const userId = '1';
    const existingUser = { id: userId, email: 'old@example.com', name: 'Old Name' };
    const updateData = { name: 'New Name', email: 'new@example.com' };

    it('should update user with valid data', async () => {
      const updatedUser = { ...existingUser, ...updateData };
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(NotFoundError);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when email format is invalid', async () => {
      const invalidUpdate = { email: 'invalid-email' };
      mockUserRepository.findById.mockResolvedValue(existingUser);

      await expect(userService.updateUser(userId, invalidUpdate)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when name is empty string', async () => {
      const invalidUpdate = { name: '' };
      mockUserRepository.findById.mockResolvedValue(existingUser);

      await expect(userService.updateUser(userId, invalidUpdate)).rejects.toThrow(ValidationError);
    });

    it('should update user when only name provided', async () => {
      const nameOnlyUpdate = { name: 'New Name Only' };
      const updatedUser = { ...existingUser, name: nameOnlyUpdate.name };
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(userId, nameOnlyUpdate);

      expect(result).toEqual(updatedUser);
    });

    it('should update user when only email provided', async () => {
      const emailOnlyUpdate = { email: 'newemail@example.com' };
      const updatedUser = { ...existingUser, email: emailOnlyUpdate.email };
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(userId, emailOnlyUpdate);

      expect(result).toEqual(updatedUser);
    });

    it('should handle empty update object', async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(existingUser);

      const result = await userService.updateUser(userId, {});

      expect(result).toEqual(existingUser);
    });
  });

  describe('deleteUser', () => {
    const userId = '1';
    const existingUser = { id: userId, email: 'test@example.com', name: 'John Doe' };

    it('should delete user when valid ID provided', async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await userService.deleteUser(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser(userId)).rejects.toThrow(NotFoundError);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when ID is empty', async () => {
      await expect(userService.deleteUser('')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when ID is null', async () => {
      await expect(userService.deleteUser(null as any)).rejects.toThrow(ValidationError);
    });

    it('should handle repository deletion failure', async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.delete.mockRejectedValue(new Error('Deletion failed'));

      await expect(userService.deleteUser(userId)).rejects.toThrow('Deletion failed');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [
        { id: '1', email: 'user1@example.com', name: 'User 1' },
        { id: '2', email: 'user2@example.com', name: 'User 2' }
      ];
      mockUserRepository.findAll.mockResolvedValue(users);

      const result = await userService.getAllUsers();

      expect(result).toEqual(users);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const result = await userService.getAllUsers();

      expect(result).toEqual([]);
    });

    it('should handle repository failure', async () => {
      mockUserRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(userService.getAllUsers()).rejects.toThrow('Database error');
    });
  });

  describe('getUserByEmail', () => {
    const email = 'test@example.com';
    const user = { id: '1', email, name: 'John Doe' };

    it('should return user when valid email provided', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await userService.getUserByEmail(email);

      expect(result).toEqual(user);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.getUserByEmail(email)).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when email is invalid format', async () => {
      await expect(userService.getUserByEmail('invalid-email')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when email is empty', async () => {
      await expect(userService.getUserByEmail('')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when email is null', async () => {
      await expect(userService.getUserByEmail(null as any)).rejects.toThrow(ValidationError);
    });

    it('should handle repository failure', async () => {
      mockUserRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      await expect(userService.getUserByEmail(email)).rejects.toThrow('Database error');
    });
  });
});