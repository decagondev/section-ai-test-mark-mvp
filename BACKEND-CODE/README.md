# Deca Test Mark - Backend API

## Overview

The backend for Deca Test Mark is a robust Express.js API that powers the AI-driven auto-grading system. It handles GitHub repository processing, executes automated tests, integrates with Groq AI for code quality analysis, and provides real-time feedback through WebSocket connections. Built with TypeScript, MongoDB, and Redis, it's designed for scalability and reliability.

## 🚀 Key Features

- **Automated Grading Pipeline** - Clone, install, test, and analyze GitHub repositories
- **AI Code Quality Analysis** - Groq SDK integration for educational feedback
- **Real-time Processing** - WebSocket updates with queue-based job processing
- **Scalable Architecture** - Redis queue system for concurrent submissions
- **Comprehensive API** - RESTful endpoints with detailed error handling
- **Security First** - Input validation, rate limiting, and secure authentication

## 🛠 Technology Stack

- **Framework:** Express.js with TypeScript
- **Database:** MongoDB with Mongoose ODM
- **AI Integration:** Groq SDK for code analysis
- **Queue System:** Bull Queue with Redis
- **Real-time Communication:** Socket.io
- **Authentication:** Firebase Admin SDK
- **Process Management:** Child Process for git/npm operations
- **Deployment:** Render.com with Docker support
- **Testing:** Jest with Supertest

## 📁 Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── submissionController.ts
│   ├── userController.ts
│   └── authController.ts
├── models/              # Mongoose schemas
│   ├── Submission.ts
│   ├── User.ts
│   └── Rubric.ts
├── routes/              # Express routes
│   ├── submissionRoutes.ts
│   ├── userRoutes.ts
│   └── healthRoutes.ts
├── services/            # Business logic
│   ├── gradingService.ts
│   ├── groqService.ts
│   ├── queueService.ts
│   └── githubService.ts
├── middleware/          # Express middleware
│   ├── authMiddleware.ts
│   ├── errorHandler.ts
│   ├── rateLimiter.ts
│   └── validation.ts
├── utils/               # Utility functions
│   ├── logger.ts
│   ├── cleanup.ts
│   └── constants.ts
├── types/               # TypeScript definitions
│   └── index.ts
└── server.ts           # Application entry point
```

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────┐
│           Backend API (Express.js)      │
├─────────────────────────────────────────┤
│  Services:                              │
│  • GitHub Repository Processing         │
│  • Automated Test Execution             │
│  • AI Code Quality Analysis             │
│  • Real-time Progress Updates           │
│  • User & Submission Management         │
└─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│          External Services              │
├─────────────────────────────────────────┤
│  • MongoDB (Database)                   │
│  • Redis (Queue & Cache)                │
│  • Groq API (AI Analysis)               │
│  • Firebase (Authentication)            │
│  • GitHub (Repository Access)           │
└─────────────────────────────────────────┘
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Redis Cloud account
- Groq API key
- Firebase Admin SDK configuration

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd deca-test-mark-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

```bash
# .env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/deca-test-mark
GROQ_API_KEY=your_groq_api_key_here
REDIS_URL=redis://default:password@host:port
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## 📋 Development Phases

### Phase 1: Foundation & MVP (Days 1-7) - 11 hours

#### Core Server Setup (3 hours)
- **Express.js server** with TypeScript configuration
- **MongoDB connection** with Mongoose ODM
- **CORS configuration** for cross-origin requests
- **Socket.io setup** for real-time communication
- **Health check endpoint** for monitoring

**Key Components:**
```typescript
// Basic server structure
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }));
app.use(express.json());
app.use('/api/submissions', submissionRouter);
app.use(errorHandler);
```

#### Grading Pipeline Core (5 hours)
- **Repository cloning** using child process git commands
- **Dependency installation** with npm install execution
- **Test execution** with npm test and result parsing
- **File system management** with automatic cleanup
- **Basic scoring algorithm** (80% tests, 20% quality)

**Key Features:**
- Temporary directory management
- Process timeout handling
- Error recovery and cleanup
- Test result parsing and scoring

#### Submission API (3 hours)
- **POST /api/grade** - Submit GitHub URL for processing
- **GET /api/submission/:id** - Check submission status
- **WebSocket events** - Real-time progress updates
- **Authentication middleware** - Firebase token verification
- **Input validation** - GitHub URL and rubric validation

### Phase 2: Core Features (Days 8-14) - 8 hours

#### AI Integration (3 hours)
- **Groq SDK setup** and API key configuration
- **Code analysis prompts** tailored for educational feedback
- **Response parsing** and error handling
- **Fallback scoring** when AI analysis fails

**AI Analysis Features:**
```typescript
interface CodeAnalysis {
  score: number;           // 0-100 quality score
  report: string;          // Markdown educational feedback
  suggestions: string[];   // Specific improvements
  strengths: string[];     // Code strengths identified
}
```

#### Queue System (3 hours)
- **Bull Queue setup** with Redis backend
- **Job processing pipeline** with phase tracking
- **Concurrent processing** with configurable workers
- **Queue monitoring** and failure handling

**Processing Phases:**
1. `uploading` - Repository cloning
2. `installing` - Dependency installation
3. `testing` - Test execution
4. `reviewing` - AI code analysis
5. `reporting` - Report generation
6. `completed` - Final results ready

#### Database Models (2 hours)
- **Submission schema** with comprehensive metadata
- **User schema** with role-based access
- **Rubric schema** for custom grading criteria
- **Indexes optimization** for query performance

### Phase 3: Polish & Production (Days 15-21) - 8 hours

#### Error Handling & Edge Cases (3 hours)
- **Global error handler** with structured responses
- **Private repository handling** with clear error messages
- **Large repository timeouts** and resource limits
- **Rate limiting** to prevent abuse

#### Testing & Performance (3 hours)
- **Unit tests** for core services and utilities
- **Integration tests** for API endpoints
- **Performance optimization** with database indexing
- **Load testing** for concurrent submissions

#### Security Hardening (2 hours)
- **Input validation** with Joi/Zod schemas
- **Security headers** using Helmet middleware
- **Dependency scanning** for vulnerabilities
- **Environment variable validation**

## 🔌 API Specifications

### Core Endpoints

#### Submit for Grading
```typescript
POST /api/grade
Content-Type: application/json
Authorization: Bearer <firebase-token>

{
  "githubUrl": "https://github.com/username/repository",
  "rubric": { /* optional custom rubric */ },
  "projectType": "express" | "react" | "fullstack"
}

Response: 202 Accepted
{
  "submissionId": "60d5ecb54b24a1001f5d2c8e",
  "status": "uploading",
  "message": "Submission queued for processing"
}
```

#### Get Submission Status
```typescript
GET /api/submission/:id
Authorization: Bearer <firebase-token>

Response: 200 OK
{
  "id": "60d5ecb54b24a1001f5d2c8e",
  "githubUrl": "https://github.com/username/repo",
  "status": "completed",
  "grade": "pass",
  "score": {
    "total": 85,
    "testScore": 90,
    "qualityScore": 70
  },
  "report": "# Grading Report\n\n## Summary...",
  "processingTime": 45,
  "createdAt": "2023-06-25T10:30:00.000Z"
}
```

#### WebSocket Events
```typescript
// Client events
socket.emit('submission:start', { submissionId: string });

// Server events
socket.on('submission:progress', (data: {
  id: string;
  status: ProcessingStatus;
  progress: number;
  currentStep: string;
}));

socket.on('submission:complete', (submission: Submission));
socket.on('submission:error', (error: string));
```

## 🗄️ Database Schema

### Submissions Collection
```typescript
interface Submission {
  _id: ObjectId;
  githubUrl: string;
  userId: string;
  instructorId?: string;
  status: 'uploading' | 'installing' | 'testing' | 'reviewing' | 'reporting' | 'completed' | 'failed';
  grade: 'pass' | 'fail' | 'pending';
  scores: {
    total: number;
    testScore: number;
    qualityScore: number;
    breakdown: Array<{
      category: string;
      score: number;
      maxScore: number;
      feedback: string;
    }>;
  };
  report: string;                    // Markdown formatted report
  rubric?: RubricCriteria;          // Custom grading criteria
  processingTime: number;           // Seconds to complete
  error?: string;                   // Error message if failed
  metadata: {
    projectType: 'express' | 'react' | 'fullstack';
    dependencies: string[];
    testResults: {
      passed: number;
      total: number;
      details: string;
    };
    aiAnalysis: {
      promptTokens: number;
      completionTokens: number;
      analysisTime: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Users Collection
```typescript
interface User {
  _id: ObjectId;
  firebaseUid: string;              // Firebase Auth UID
  email: string;
  role: 'student' | 'instructor' | 'admin';
  profile: {
    name: string;
    institution?: string;
    course?: string;
  };
  preferences: {
    emailNotifications: boolean;
    defaultRubric?: ObjectId;
  };
  stats: {
    totalSubmissions: number;
    averageScore: number;
    lastActive: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## 🚀 Deployment

### Render.com Configuration
```yaml
# render.yaml
services:
  - type: web
    name: deca-test-mark-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### Docker Support
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install git for repository cloning
RUN apk add --no-cache git

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 10000

CMD ["npm", "start"]
```

### Environment Configuration
```bash
# Production environment variables
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prod
GROQ_API_KEY=production_api_key
REDIS_URL=rediss://default:pass@host:port
FRONTEND_URL=https://deca-test-mark.netlify.app
ALLOWED_ORIGINS=https://deca-test-mark.netlify.app
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Integration Tests
```bash
# Test API endpoints
npm run test:integration

# Test with real database
npm run test:e2e
```

### Load Testing
```bash
# Test concurrent submissions
npm run test:load

# Performance benchmarks
npm run test:performance
```

## 🔒 Security Features

### Authentication & Authorization
- **Firebase Admin SDK** for token verification
- **Role-based access control** (student/instructor/admin)
- **Request rate limiting** to prevent abuse
- **Input sanitization** and validation

### Data Protection
- **Environment variable encryption** for sensitive data
- **Database connection security** with SSL/TLS
- **CORS policy enforcement** for cross-origin requests
- **Security headers** using Helmet middleware

### Process Security
- **Sandboxed execution** for repository processing
- **Resource limits** to prevent system abuse
- **Temporary file cleanup** to prevent disk overflow
- **Process timeout handling** for long-running operations

## 📊 Performance Targets

- **Processing Time:** < 60 seconds per submission
- **Concurrent Users:** Support 100+ simultaneous submissions
- **API Response Time:** < 200ms for status endpoints
- **Memory Usage:** < 512MB per worker process
- **Queue Processing:** 10+ jobs per minute capacity

## 🔧 Monitoring & Logging

### Health Checks
```typescript
GET /health
Response: {
  "status": "OK",
  "timestamp": "2023-06-25T10:30:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "groq": "available"
  }
}
```

### Logging Strategy
- **Winston logger** with structured JSON output
- **Request/response logging** for API calls
- **Error tracking** with stack traces
- **Performance metrics** for processing times

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Errors:**
```bash
# Check connection string format
# Verify IP whitelist includes deployment IP
# Test connection with MongoDB Compass
```

**Redis Queue Issues:**
```bash
# Verify Redis URL and credentials
# Check Redis Cloud dashboard for limits
# Monitor queue length and processing rates
```

**GitHub Repository Access:**
```bash
# Ensure repository is public
# Check for large file sizes (>100MB)
# Verify repository has package.json
```

**Groq API Errors:**
```bash
# Check API key validity and limits
# Monitor rate limiting responses
# Implement exponential backoff for retries
```

**Performance Issues:**
```bash
# Monitor CPU and memory usage
# Check database query performance
# Optimize worker process allocation
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with comprehensive tests
3. Ensure all tests pass and coverage is maintained
4. Follow TypeScript strict mode requirements
5. Update documentation for API changes
6. Create pull request with detailed description

### Code Standards
- **TypeScript:** Strict mode with explicit types
- **ESLint:** Airbnb configuration with Node.js rules
- **Prettier:** Consistent code formatting
- **Conventional Commits:** Structured commit messages
- **API Documentation:** OpenAPI/Swagger specifications

### Testing Requirements
- **Unit test coverage:** > 80%
- **Integration tests:** All API endpoints
- **Error handling tests:** All failure modes
- **Performance tests:** Load and stress testing

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose ODM Guide](https://mongoosejs.com/docs/)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [Groq API Documentation](https://console.groq.com/docs)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## 🚨 Production Checklist

- [ ] All environment variables configured
- [ ] Database indexes created and optimized
- [ ] Redis connection pool configured
- [ ] Error monitoring and alerting set up
- [ ] Rate limiting configured appropriately
- [ ] Security headers and CORS configured
- [ ] Load testing completed successfully
- [ ] Backup and recovery procedures documented
- [ ] Monitoring dashboards created
- [ ] Documentation updated and reviewed

---

**Last Updated:** [Current Date]  
**Version:** 1.0.0  
**API Version:** v1  
**Contributors:** Development Team
