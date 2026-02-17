# Technical Specification

## Summary

Comprehensive specification for a user management REST API with JWT authentication, role-based authorization, and complete CRUD operations. Includes health monitoring, audit logging, and security best practices.

## API Specification

See [api-spec.json](./api-spec.json) for the complete OpenAPI specification.

**Endpoints:** 8 paths, 12 operations

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users` | Get all users |
| POST | `/users` | Create new user |
| GET | `/health` | Health check |
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update current user profile |
| POST | `/auth/login` | User login |
| GET | `/users/{id}` | Get user by ID |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |
| POST | `/auth/logout` | User logout |
| POST | `/auth/refresh` | Refresh access token |
| PATCH | `/users/me/password` | Change password |

**Data Schemas:** 8 models

## Database Schema

See [database-schema.json](./database-schema.json) for the complete schema.

**Tables:** 3

| Table | Columns | Description |
|-------|---------|-------------|
| `users` | 10 | - |
| `refresh_tokens` | 6 | - |
| `audit_logs` | 9 | - |

## Architecture

See [architecture.json](./architecture.json) for complete architecture details.

## Authentication

See [authentication.json](./authentication.json) for complete auth details.

