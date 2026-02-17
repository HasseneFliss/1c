# Task Management API

A RESTful API for managing tasks and projects with user authentication.

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables (see below)
4. Run migrations: `npm run migrate`
5. Start server: `npm start`

## Features

- User authentication with JWT
- CRUD operations for tasks and projects
- Task filtering and sorting
- Role-based access control
- Input validation and error handling

## Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Usage

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Complete project","description":"Finish the task management API"}'
```

## License

MIT