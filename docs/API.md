# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API uses JWT Bearer tokens for authentication. Include the token in the Authorization header: `Authorization: Bearer <token>`. Obtain tokens through the `/auth/login` endpoint after user registration.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| GET | `/tasks` | Get user's tasks |
| POST | `/tasks` | Create new task |
| GET | `/tasks/:id` | Get specific task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| GET | `/projects` | Get user's projects |
| POST | `/projects` | Create new project |
| GET | `/projects/:id` | Get specific project |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |

## Example Request/Response

**POST /api/tasks**

Request:
```json
{
  "title": "Complete documentation",
  "description": "Write API documentation",
  "projectId": 1,
  "priority": "high",
  "dueDate": "2024-01-15"
}
```

Response:
```json
{
  "id": 123,
  "title": "Complete documentation",
  "description": "Write API documentation",
  "projectId": 1,
  "priority": "high",
  "status": "pending",
  "dueDate": "2024-01-15T00:00:00.000Z",
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z"
}
```