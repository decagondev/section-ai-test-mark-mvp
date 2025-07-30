# Deca Test Mark API - Swagger Documentation

## Overview

This backend includes comprehensive Swagger/OpenAPI documentation that provides an interactive UI to explore and test all API endpoints. The documentation is automatically generated from JSDoc comments in the route files and provides a complete reference for the Deca Test Mark API.

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd BACKEND-CODE
npm install
npm run dev
```

### 2. Access Swagger UI

Open your browser and navigate to:
```
http://localhost:3001/api-docs
```

You'll see the interactive Swagger UI with all available endpoints organized by tags.

## 📚 API Documentation Structure

### Authentication Endpoints
- **POST /api/auth/signup** - Register a new user
- **POST /api/auth/login** - Login with email and password
- **GET /api/auth/me** - Get current user profile

### Submission Endpoints
- **POST /api/submissions/grade** - Submit repository for grading
- **GET /api/submissions** - Get all submissions (with filtering)
- **GET /api/submissions/{id}** - Get specific submission details
- **GET /api/submissions/{id}/report.md** - Download markdown report
- **PATCH /api/submissions/{id}** - Update submission (admin only)
- **DELETE /api/submissions/{id}** - Delete submission (admin only)

### User Management Endpoints
- **GET /api/users** - Get all users (admin only)
- **POST /api/users** - Create new user (admin only)
- **GET /api/users/{id}** - Get user by ID (admin only)
- **PATCH /api/users/{id}** - Update user (admin only)
- **DELETE /api/users/{id}** - Delete user (admin only)
- **PATCH /api/users/me** - Update own profile
- **POST /api/users/me/change-password** - Change password

### Health Check Endpoints
- **GET /health** - Basic health check
- **GET /health/detailed** - Detailed system health
- **GET /health/database** - Database-specific health check
- **GET /health/ready** - Kubernetes readiness probe
- **GET /health/live** - Kubernetes liveness probe

## 🔐 Authentication

Most endpoints require authentication using JWT tokens. Here's how to use them in Swagger UI:

### 1. Get a Token
1. Go to **POST /api/auth/login** or **POST /api/auth/signup**
2. Click "Try it out"
3. Enter your credentials
4. Execute the request
5. Copy the `token` from the response

### 2. Use the Token
1. Click the **Authorize** button at the top of the Swagger UI
2. Enter your token in the format: `Bearer YOUR_TOKEN_HERE`
3. Click "Authorize"
4. Now you can access protected endpoints

## 🧪 Testing Workflow

### Complete Grading Flow Example

1. **Register/Login**
   ```
   POST /api/auth/signup
   {
     "email": "student@example.com",
     "password": "password123",
     "name": "John Doe"
   }
   ```

2. **Submit Repository for Grading**
   ```
   POST /api/submissions/grade
   {
     "githubUrl": "https://github.com/username/express-project",
     "projectType": "express",
     "fileGlobs": ["README.md", "package.json", "src/**/*.js"]
   }
   ```

3. **Check Submission Status**
   ```
   GET /api/submissions/{submissionId}
   ```

4. **Download Report**
   ```
   GET /api/submissions/{submissionId}/report.md
   ```

## 📊 Data Models

The documentation includes comprehensive schemas for all data models:

### User Model
```json
{
  "id": "60d5ecb54b24a1001f5d2c8e",
  "email": "student@example.com",
  "role": "student",
  "profile": {
    "name": "John Doe",
    "institution": "University of Technology",
    "course": "CS101 - Introduction to Programming"
  },
  "stats": {
    "totalSubmissions": 15,
    "averageScore": 85.5,
    "lastActive": "2023-06-25T10:30:00.000Z"
  }
}
```

### Submission Model
```json
{
  "id": "60d5ecb54b24a1001f5d2c8e",
  "githubUrl": "https://github.com/username/express-project",
  "status": "completed",
  "grade": "pass",
  "scores": {
    "total": 85,
    "testScore": 90,
    "qualityScore": 80,
    "breakdown": [
      {
        "category": "Code Quality",
        "score": 80,
        "maxScore": 100,
        "feedback": "Good code structure and naming conventions"
      }
    ]
  },
  "report": "# Grading Report\n\n## Summary\nThis project demonstrates...",
  "processingTime": 45,
  "metadata": {
    "projectType": "express",
    "dependencies": ["express", "jest", "nodemon"],
    "testResults": {
      "passed": 8,
      "total": 10,
      "details": "All core functionality tests passed"
    }
  }
}
```

## 🔧 Swagger UI Features

### Interactive Testing
- **Try it out**: Test any endpoint directly from the UI
- **Request/Response Examples**: Pre-filled examples for all endpoints
- **Schema Validation**: Automatic validation of request bodies
- **Response Visualization**: Formatted JSON responses

### Authentication
- **Bearer Token Support**: JWT authentication with persistent tokens
- **Authorize Button**: Easy token management
- **Security Schemes**: Clear documentation of auth requirements

### Documentation
- **Detailed Descriptions**: Comprehensive endpoint documentation
- **Parameter Validation**: Clear parameter requirements and types
- **Error Responses**: Documented error codes and messages
- **Code Examples**: Ready-to-use code snippets

## 🌐 WebSocket Events

While not documented in Swagger (as it's not REST), the API also supports WebSocket connections for real-time updates:

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3001');

// Listen for submission progress
socket.on('submission:progress', (data) => {
  console.log('Progress:', data.status, data.progress + '%');
});

// Listen for completion
socket.on('submission:complete', (data) => {
  console.log('Completed:', data.submission);
});

// Listen for errors
socket.on('submission:error', (data) => {
  console.error('Error:', data.error);
});
```

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Invalid request",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "timestamp": "2023-06-25T10:30:00.000Z"
}
```

Common error codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## 🔄 Rate Limiting

The API implements rate limiting:
- **1000 requests per 15 minutes** per IP address
- **10 concurrent grading jobs** maximum
- Rate limit headers included in responses

## 📝 Development

### Adding New Endpoints

To document a new endpoint, add JSDoc comments above the route:

```typescript
/**
 * @swagger
 * /api/new-endpoint:
 *   get:
 *     summary: Brief description
 *     tags: [Category]
 *     description: Detailed description
 *     parameters:
 *       - in: query
 *         name: param
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseModel'
 */
router.get('/new-endpoint', handler);
```

### Updating Schemas

Schemas are defined in `src/config/swagger.ts`. Add new schemas to the `components.schemas` section.

## 🚀 Production Deployment

In production, the Swagger UI will be available at:
```
https://your-domain.com/api-docs
```

### Security Considerations
- Swagger UI is enabled in development and production
- Sensitive endpoints are protected by authentication
- Rate limiting prevents abuse
- CORS is configured for security

## 📞 Support

For questions about the API or Swagger documentation:
- Check the interactive documentation at `/api-docs`
- Review the endpoint descriptions and examples
- Test endpoints directly in the Swagger UI
- Check the health endpoints for system status

---

**Last Updated:** December 2024  
**API Version:** 1.0.0  
**Swagger Version:** 3.0.0 