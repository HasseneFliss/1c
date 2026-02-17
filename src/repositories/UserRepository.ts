import { Pool, PoolClient } from 'pg';
import { pool } from '../config/database';
import { User, CreateUserInput, UpdateUserInput } from '../models/User';
import { NotFoundError, ConflictError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export class UserRepository {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const countQuery = 'SELECT COUNT(*) FROM users';
    const countResult = await this.pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT id, email, first_name, last_name, role, is_active, email_verified, 
             created_at, updated_at, last_login_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await this.pool.query(query, [limit, offset]);
    
    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      password: '', // Never return password
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      isActive: row.is_active,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at
    }));

    return { users, total };
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password, first_name, last_name, role, is_active, 
             email_verified, created_at, updated_at, last_login_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      isActive: row.is_active,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password, first_name, last_name, role, is_active, 
             email_verified, created_at, updated_at, last_login_at
      FROM users
      WHERE email = $1
    `;
    
    const result = await this.pool.query(query, [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      isActive: row.is_active,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at
    };
  }

  async create(userData: CreateUserInput): Promise<User> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if user already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      const id = uuidv4();
      const hashedPassword = await bcrypt.hash(userData.password, env.BCRYPT_ROUNDS);
      const now = new Date();

      const query = `
        INSERT INTO users (id, email, password, first_name, last_name, role, is_active, 
                          email_verified, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, email, first_name, last_name, role, is_active, email_verified, 
                  created_at, updated_at
      `;
      
      const values = [
        id,
        userData.email.toLowerCase(),
        hashedPassword,
        userData.firstName,
        userData.lastName,
        userData.role,
        true,
        false,
        now,
        now
      ];

      const result = await client.query(query, values);
      await client.query('COMMIT');

      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        password: hashedPassword,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        isActive: row.is_active,
        emailVerified: row.email_verified,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id: string, userData: UpdateUserInput): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check email uniqueness if email is being updated
    if (userData.email && userData.email !== user.email) {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.email) {
      updates.push(`email = $${paramCount++}`);
      values.push(userData.email.toLowerCase());
    }
    if (userData.firstName) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(userData.firstName);
    }
    if (userData.lastName) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(userData.lastName);
    }
    if (userData.role) {
      updates.push(`role = $${paramCount++}`);
      values.push(userData.role);
    }
    if (userData.isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(userData.isActive);
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(new Date());
    values.push(id);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, role, is_active, email_verified, 
                created_at, updated_at, last_login_at
    `;

    const result = await this.pool.query(query, values);
    const row = result.rows[0];

    return {
      id: row.id,
      email: row.email,
      password: user.password,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      isActive: row.is_active,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at
    };
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const query = 'DELETE FROM users WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  async updateLastLogin(id: string): Promise<void> {
    const query = 'UPDATE users SET last_login_at = $1 WHERE id = $2';
    await this.pool.query(query, [new Date(), id]);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    const query = 'UPDATE users SET password = $1, updated_at = $2 WHERE id = $3';
    await this.pool.query(query, [hashedPassword, new Date(), id]);
  }

  async verifyEmail(id: string): Promise<void> {
    const query = 'UPDATE users SET email_verified = true, updated_at = $1 WHERE id = $2';
    await this.pool.query(query, [new Date(), id]);
  }
}