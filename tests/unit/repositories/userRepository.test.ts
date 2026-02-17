import { UserRepository } from '../../../src/repositories/userRepository';
import { Database } from '../../../src/database/connection';
import { User } from '../../../src/models/user';
import { DatabaseError } from '../../../src/errors/databaseError';

jest.mock('../../../src/database/connection');

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockDatabase: jest.Mocked<Database>;

  beforeEach(() => {
    mockDatabase = new Database() as jest.Mocked<Database>;
    userRepository = new UserRepository(mockDatabase);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userData = {
      email: 'test@example.com',
      name: 'John Doe',
      hashedPassword: 'hashedPassword123'
    };

    it('should create user with valid data', async () => {
      const createdUser = { id: '1', ...userData };
      mockDatabase.query.mockResolvedValue({ rows: [createdUser], rowCount: 1 });

      const result = await userRepository.create(userData);

      expect(result).toEqual(createdUser);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([userData.email, userData.name, userData.hashedPassword])
      );
    });

    it('should throw DatabaseError when database query fails', async () => {
      mockDatabase.query.mockRejectedValue(new Error('Connection failed'));

      await expect(userRepository.create(userData)).rejects.toThrow(DatabaseError);
    });

    it('should throw DatabaseError when no rows returned', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await expect(userRepository.create(userData)).rejects.toThrow(DatabaseError);
    });

    it('should handle null email', async () => {
      const invalidData = { ...userData, email: null as any };
      mockDatabase.query.mockRejectedValue(new Error('NULL constraint violation'));

      await expect(userRepository.create(invalidData)).rejects.toThrow(DatabaseError);
    });
  });

  describe('findById', () => {
    const userId = '1';
    const user = { id: userId, email: 'test@example.com', name: 'John Doe' };

    it('should return user when found', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [user], rowCount: 1 });

      const result = await userRepository.findById(userId);

      expect(result).toEqual(user);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE id = $1'),
        [userId]
      );
    });

    it('should return null when user not found', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await userRepository.findById(userId);

      expect(result).toBeNull();
    });

    it('should throw DatabaseError when query fails', async () => {
      mockDatabase.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findById(userId)).rejects.toThrow(DatabaseError);
    });

    it('should handle numeric ID as string', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [user], rowCount: 1 });

      const result = await userRepository.findById('123');

      expect(result).toEqual(user);
    });
  });

  describe('findByEmail', () => {
    const email = 'test@example.com';
    const user = { id: '1', email, name: 'John Doe' };

    it('should return user when found', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [user], rowCount: 1 });

      const result = await userRepository.findByEmail(email);

      expect(result).toEqual(user);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE email = $1'),
        [email]
      );
    });

    it('should return null when user not found', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await userRepository.findByEmail(email);

      expect(result).toBeNull();
    });

    it('should be case insensitive', async () => {
      const upperCaseEmail = 'TEST@EXAMPLE.COM';
      mockDatabase.query.mockResolvedValue({ rows: [user], rowCount: 1 });

      const result = await userRepository.findByEmail(upperCaseEmail);

      expect(result).toEqual(user);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(email) = LOWER($1)'),
        [upperCaseEmail]
      );
    });

    it('should throw DatabaseError when query fails', async () => {
      mockDatabase.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findByEmail(email)).rejects.toThrow(DatabaseError);
    });
  });

  describe('findAll', () => {
    const users = [
      { id: '1', email: 'user1@example.com', name: 'User 1' },
      { id: '2', email: 'user2@example.com', name: 'User 2' }
    ];

    it('should return all users', async () => {
      mockDatabase.query.mockResolvedValue({ rows: users, rowCount: 2 });

      const result = await userRepository.findAll();

      expect(result).toEqual(users);
      expect(mockDatabase.query).toHaveBeenCalledWith('SELECT * FROM users ORDER BY created_at DESC');
    });

    it('should return empty array when no users exist', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await userRepository.findAll();

      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when query fails', async () => {
      mockDatabase.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findAll()).rejects.toThrow(DatabaseError);
    });
  });

  describe('update', () => {
    const userId = '1';
    const updateData = { name: 'Updated Name', email: 'updated@example.com' };
    const updatedUser = { id: userId, ...updateData };

    it('should update user with valid data', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [updatedUser], rowCount: 1 });

      const result = await userRepository.update(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET'),
        expect.arrayContaining([updateData.name, updateData.email, userId])
      );
    });

    it('should update only provided fields', async () => {
      const partialUpdate = { name: 'New Name Only' };
      const partiallyUpdatedUser = { id: userId, name: partialUpdate.name, email: 'old@example.com' };
      mockDatabase.query.mockResolvedValue({ rows: [partiallyUpdatedUser], rowCount: 1 });

      const result = await userRepository.update(userId, partialUpdate);

      expect(result).toEqual(partiallyUpdatedUser);
    });

    it('should return null when user not found', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await userRepository.update(userId, updateData);

      expect(result).toBeNull();
    });

    it('should throw DatabaseError when query fails', async () => {
      mockDatabase.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.update(userId, updateData)).rejects.toThrow(DatabaseError);
    });

    it('should handle empty update object', async () => {
      const originalUser = { id: userId, name: 'Original', email: 'original@example.com' };
      mockDatabase.query.mockResolvedValue({ rows: [originalUser], rowCount: 1 });

      const result = await userRepository.update(userId, {});

      expect(result).toEqual(originalUser);
    });
  });

  describe('delete', () => {
    const userId = '1';

    it('should delete user successfully', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [], rowCount: 1 });

      await userRepository.delete(userId);

      expect(mockDatabase.query).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = $1',
        [userId]
      );
    });

    it('should throw DatabaseError when user not found', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await expect(userRepository.delete(userId)).rejects.toThrow(DatabaseError);
    });

    it('should throw DatabaseError when query fails', async () => {
      mockDatabase.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.delete(userId)).rejects.toThrow(DatabaseError);
    });

    it('should handle foreign key constraint violation', async () => {
      mockDatabase.query.mockRejectedValue(new Error('Foreign key constraint'));

      await expect(userRepository.delete(userId)).rejects.toThrow(DatabaseError);
    });
  });
});