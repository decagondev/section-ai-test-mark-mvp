# Deca Test Mark API Documentation

## 🚀 Quick Access

**Swagger UI is now live at:** `http://localhost:3001/api-docs`

## 📋 What's Included

### ✅ Complete API Documentation
- **Interactive Swagger UI** - Test endpoints directly in your browser
- **Comprehensive Schemas** - All data models and request/response formats
- **Authentication Support** - JWT token management in the UI
- **Real Examples** - Pre-filled request examples for testing
- **Error Documentation** - All possible error responses and codes

### 🔧 Features
- **Try It Out** - Execute API calls directly from the documentation
- **Authorize Button** - Easy JWT token management
- **Schema Validation** - Automatic request validation
- **Response Visualization** - Formatted JSON responses
- **Search & Filter** - Find endpoints quickly

## 🎯 How to Use

### 1. Start the Server
```bash
cd BACKEND-CODE
npm install
npm run dev
```

### 2. Open Swagger UI
Navigate to: `http://localhost:3001/api-docs`

### 3. Test the API Flow

#### Step 1: Register/Login
1. Find **POST /api/auth/signup** or **POST /api/auth/login**
2. Click "Try it out"
3. Enter your credentials
4. Execute the request
5. Copy the `token` from the response

#### Step 2: Authorize
1. Click the **Authorize** button (🔒) at the top
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click "Authorize"

#### Step 3: Submit for Grading
1. Find **POST /api/submissions/grade**
2. Click "Try it out"
3. Enter a GitHub repository URL
4. Select project type (express/react/fullstack)
5. Execute the request
6. Note the `submissionId` from the response

#### Step 4: Check Results
1. Find **GET /api/submissions/{id}**
2. Click "Try it out"
3. Enter the `submissionId` from step 3
4. Execute to see grading results

## 📊 Available Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user profile

### Submissions
- `POST /api/submissions/grade` - Submit repository for grading
- `GET /api/submissions` - List all submissions (with filtering)
- `GET /api/submissions/{id}` - Get specific submission details
- `GET /api/submissions/{id}/report.md` - Download markdown report
- `PATCH /api/submissions/{id}` - Update submission (admin only)
- `DELETE /api/submissions/{id}` - Delete submission (admin only)

### User Management
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create user (admin only)
- `GET /api/users/{id}` - Get user details (admin only)
- `PATCH /api/users/{id}` - Update user (admin only)
- `DELETE /api/users/{id}` - Delete user (admin only)
- `PATCH /api/users/me` - Update own profile
- `POST /api/users/me/change-password` - Change password

### Health Checks
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system health
- `GET /health/database` - Database health
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

## 🔐 Authentication Flow

### JWT Token Management
1. **Get Token**: Use `/api/auth/login` or `/api/auth/signup`
2. **Authorize**: Click Authorize button and enter `Bearer TOKEN`
3. **Use**: All protected endpoints will automatically include the token

### Token Format
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MGQ1ZWNiNTRiMjRhMTAwMWY1ZDJjOGUiLCJlbWFpbCI6InN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTYzMjU5NjAwMCwiZXhwIjoxNjMzMjAzNjAwfQ.EXAMPLE_SIGNATURE
```

## 📝 Example Requests

### Register User
```json
POST /api/auth/signup
{
  "email": "student@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Submit Repository
```json
POST /api/submissions/grade
{
  "githubUrl": "https://github.com/username/express-project",
  "projectType": "express",
  "fileGlobs": ["README.md", "package.json", "src/**/*.js"]
}
```

### Get Submission Status
```
GET /api/submissions/60d5ecb54b24a1001f5d2c8e
```

## 🌐 WebSocket Support

While not documented in Swagger, the API supports real-time updates:

```javascript
const socket = io('http://localhost:3001');

socket.on('submission:progress', (data) => {
  console.log('Progress:', data.status, data.progress + '%');
});

socket.on('submission:complete', (data) => {
  console.log('Completed:', data.submission);
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

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## 🔄 Rate Limiting

- **1000 requests per 15 minutes** per IP address
- **10 concurrent grading jobs** maximum
- Rate limit headers included in responses

## 🛠 Development

### Adding New Endpoints
To document a new endpoint, add JSDoc comments:

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
Schemas are defined in `src/config/swagger.ts` in the `components.schemas` section.

## 🚀 Production

In production, Swagger UI will be available at:
```
https://your-domain.com/api-docs
```

### Security Notes
- Swagger UI is enabled in both development and production
- All sensitive endpoints require authentication
- Rate limiting prevents abuse
- CORS is properly configured

## 📞 Support

For questions about the API:
1. **Check the interactive documentation** at `/api-docs`
2. **Test endpoints directly** in the Swagger UI
3. **Review health endpoints** for system status
4. **Check error responses** for troubleshooting

---

**🎉 Your API is now fully documented and ready for testing!**

Visit `http://localhost:3001/api-docs` to start exploring the interactive documentation. 