# Issue Tracker API Usage Guide

## Base URL
```
http://localhost:3000/api
```

## Authentication Flow
The API uses JWT (JSON Web Token) for authentication. Here's how it works:
1. User registers with email/password
2. User logs in with credentials and receives a JWT token
3. Include token in subsequent requests in Authorization header
4. Token expires after 24 hours, requiring new login

## API Routes

### 1. User Management

#### Register User
```http
POST /api/users
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"  // Will be hashed automatically
}

Response (201 Created):
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Get All Users (Protected)
```http
GET /api/users
Authorization: Bearer YOUR_TOKEN

Response (200 OK):
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-..."
  }
]
```

#### Get User by ID (Protected)
```http
GET /api/users/:id
Authorization: Bearer YOUR_TOKEN

Response (200 OK):
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-..."
}
```

## Password Security
- Passwords are hashed using bcrypt before storage
- Original passwords are never stored in database
- Password comparison is done through bcrypt.compare()
- Minimum password length: 6 characters

## Token Authentication
1. Get token from login response
2. Include in requests:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Testing with Postman

### 1. Create a Collection
1. Open Postman
2. Create New Collection "Issue Tracker API"
3. Add Environment Variables:
   - `baseUrl`: http://localhost:3000/api
   - `token`: (will be set after login)

### 2. Register User Request
```
POST {{baseUrl}}/users
Body (raw JSON):
{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
}
```

### 3. Login Request with Test Script
```
POST {{baseUrl}}/auth/login
Body (raw JSON):
{
    "email": "test@example.com",
    "password": "password123"
}

// Add this Test script to automatically save token
pm.test("Save token", function() {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
});
```

### 4. Protected Requests
Add Authorization header:
```
Authorization: Bearer {{token}}
```

## Example Usage Flow

1. **Register New User**
```bash
curl -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "name": "Test User",
  "password": "password123"
}'
```

2. **Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "password123"
}'

# Save the token from response
```

3. **Access Protected Route**
```bash
curl http://localhost:3000/api/users \
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Error Responses

### Validation Errors
```json
{
  "errors": [
    {
      "msg": "Must be a valid email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Authentication Errors
```json
{
  "error": "Invalid credentials"
}
```

### Authorization Errors
```json
{
  "error": "No token provided"
}
```

## Security Notes
1. Passwords must be at least 6 characters long
2. Emails must be valid format
3. Names must be at least 3 characters
4. Tokens expire after 24 hours
5. Passwords are hashed with 10 rounds of bcrypt
6. Protected routes require valid JWT token
7. Each token is specific to a user

## Example Implementation Flow
1. Register new user
2. Login to get token
3. Use token for all subsequent requests
4. If token expires (after 24h), login again
5. Never send plain passwords in requests except during login/register

Would you like me to add any specific examples or explain any part in more detail?
