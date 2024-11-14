# Issue Tracker API Documentation

## Table of Contents
1. [Installation](#installation)
   - [Prerequisites](#prerequisites)
   - [Windows Setup](#windows-setup)
   - [macOS Setup](#macos-setup)
2. [Database Setup](#database-setup)
3. [API Reference](#api-reference)
4. [Testing](#testing)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm (Node Package Manager)

### Windows Setup

1. **Install Node.js**
   - Download Node.js from [official website](https://nodejs.org/)
   - Run the installer
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Install PostgreSQL**
   - Download PostgreSQL installer from [official website](https://www.postgresql.org/download/windows/)
   - Run the installer
   - Remember the password you set for the postgres user
   - Add PostgreSQL to system PATH if not done automatically
   - Verify installation:
     ```bash
     psql --version
     ```

3. **Clone and Setup Project**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd issue-tracker

   # Install dependencies
   npm install
   ```

### macOS Setup

1. **Install Homebrew** (if not installed)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js**
   ```bash
   brew install node
   ```

3. **Install PostgreSQL**
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

4. **Clone and Setup Project**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd issue-tracker

   # Install dependencies
   npm install
   ```

## Database Setup

1. **Create Database**
   ```bash
   # Windows
   psql -U postgres
   CREATE DATABASE issue_tracker;
   \q

   # macOS
   createdb issue_tracker
   ```

2. **Configure Environment**
   Create `.env` file in project root:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/issue_tracker?schema=public"
   JWT_SECRET="your-secret-key"
   ```

3. **Run Migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

## API Reference

### Authentication Endpoints

#### Register User
```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Protected Endpoints

All protected endpoints require Bearer token authentication:
```http
Authorization: Bearer <your-token>
```

#### Get All Users
```http
GET /api/users
```

#### Get User by ID
```http
GET /api/users/:id
```

## Testing

### Using cURL

1. **Register User**
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
   ```

3. **Get Users (Protected)**
   ```bash
   curl http://localhost:3000/api/users \
   -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Using Postman

1. Download Postman from [official website](https://www.postman.com/downloads/)
2. Import the collection:
   - Click "Import" in Postman
   - Create a new collection
   - Add the following requests:
     - POST /api/users (Register)
     - POST /api/auth/login (Login)
     - GET /api/users (Get All Users)
     - GET /api/users/:id (Get User by ID)

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

Error responses follow this format:
```json
{
  "error": "Error message here"
}
```

## Development

Start development server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`
