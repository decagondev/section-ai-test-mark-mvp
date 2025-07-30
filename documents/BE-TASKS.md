# Backend Development Tasks - Deca Test Mark

## Overview
Detailed backend development tasks for building the Deca Test Mark API using Express.js, TypeScript, MongoDB, and Groq SDK. Tasks prioritize early deployment, minimal viable functionality, and iterative enhancement, focusing on secure and scalable grading automation.

## Prerequisites
- Node.js 18+ installed
- Backend repository set up (see SETUP-TASKS.md)
- MongoDB Atlas cluster configured
- Groq API key obtained
- Redis Cloud account set up
- Render.com deployment pipeline established
- Basic knowledge of Express.js, TypeScript, and MongoDB

## Phase 1: Foundation & MVP (Days 1-7)

### 1.1 Core Server Setup (3 hours)
**Objective:** Establish basic Express.js server with MongoDB connection.

```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { submissionRouter } from './routes/submissionRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
}));
app.use(express.json());

// Routes
app.use('/api/submissions', submissionRouter);

// Error handling
app.use(errorHandler);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('submission:start', (data: { submissionId: string }) => {
    // Handle submission start
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Tasks:**
- [ ] Enhance server setup (1 hour)
  - Add middleware for JSON parsing
  - Configure CORS with allowed origins
  - Set up Socket.io
  - Prerequisites: Environment variables configured
- [ ] Implement MongoDB connection (1 hour)
  - Use Mongoose for ODM
  - Handle connection errors
  - Log connection status
  - Prerequisites: MongoDB Atlas setup
- [ ] Create health check endpoint (1 hour)
  - Return server status
  - Include timestamp
  - Test locally
  - Prerequisites: Server setup complete

### 1.2 Grading Pipeline Core (5 hours)
**Objective:** Build basic grading functionality.

```typescript
// src/services/gradingService.ts
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';
import { Submission } from '../models/Submission';
import { groqService } from './groqService';

const execPromise = util.promisify(exec);

interface GradingResult {
  grade: 'pass' | 'fail';
  score: {
    total: number;
    testScore: number;
    qualityScore: number;
  };
  report: string;
}

export class GradingService {
  async gradeSubmission(submission: Submission): Promise<GradingResult> {
    const tempDir = path.join(__dirname, `../../tmp/${submission._id}`);
    
    try {
      // Clone repository
      await this.cloneRepository(submission.githubUrl, tempDir);
      
      // Install dependencies
      await execPromise('npm install', { cwd: tempDir });
      
      // Run tests
      const testResult = await this.runTests(tempDir);
      
      // Analyze code quality
      const qualityResult = await groqService.analyzeCode(tempDir, testResult, submission.rubric);
      
      // Calculate scores
      const testScore = this.calculateTestScore(testResult);
      const qualityScore = qualityResult.score;
      const totalScore = (testScore * 0.8) + (qualityScore * 0.2);
      
      // Generate report
      const report = this.generateReport(testResult, qualityResult);
      
      return {
        grade: totalScore >= 70 ? 'pass' : 'fail',
        score: { total: totalScore, testScore, qualityScore },
        report
      };
    } catch (error) {
      throw new Error(`Grading failed: ${error.message}`);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  private async cloneRepository(url: string, dest: string): Promise<void> {
    await execPromise(`git clone ${url} ${dest}`);
  }

  private async runTests(cwd: string): Promise<any> {
    try {
      const { stdout } = await execPromise('npm test', { cwd });
      return this.parseTestResults(stdout);
    } catch (error) {
      return { passed: 0, total: 0, details: error.message };
    }
  }

  private parseTestResults(output: string): any {
    // Parse test output (simplified example)
    const passedMatch = output.match(/(\d+) passing/);
    const failedMatch = output.match(/(\d+) failing/);
    return {
      passed: parseInt(passedMatch?.[1] || '0'),
      total: parseInt(passedMatch?.[1] || '0') + parseInt(failedMatch?.[1] || '0'),
      details: output
    };
  }

  private calculateTestScore(testResult: any): number {
    return testResult.total > 0 ? (testResult.passed / testResult.total) * 100 : 0;
  }

  private generateReport(testResult: any, qualityResult: any): string {
    return `# Grading Report\n\n## Test Results\n- Passed: ${testResult.passed}/${testResult.total}\n\n## Code Quality\n${qualityResult.report}`;
  }
}
```

**Tasks:**
- [ ] Implement repository cloning (1 hour)
  - Use child_process to run git clone
  - Handle private repo errors
  - Prerequisites: Server setup complete
- [ ] Add dependency installation (1 hour)
  - Execute npm install
  - Handle installation errors
  - Prerequisites: Repository cloning complete
- [ ] Implement test execution (1.5 hours)
  - Run npm test
  - Parse test output
  - Store results
  - Prerequisites: Dependency installation complete
- [ ] Create grading service (1.5 hours)
  - Coordinate cloning, installation, and testing
  - Calculate initial scores (80/20 split)
  - Generate basic report
  - Prerequisites: All above tasks complete

### 1.3 Submission API (3 hours)
**Objective:** Create API endpoints for submissions.

```typescript
// src/routes/submissionRoutes.ts
import express from 'express';
import { gradingService } from '../services/gradingService';
import { Submission } from '../models/Submission';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/grade', authMiddleware, async (req, res, next) => {
  try {
    const { githubUrl, rubric, projectType } = req.body;
    const userId = req.user.uid;

    const submission = new Submission({
      githubUrl,
      rubric,
      projectType,
      userId,
      status: 'uploading',
      grade: 'pending'
    });

    await submission.save();

    // Start grading async
    gradingService.gradeSubmission(submission)
      .then(async (result) => {
        submission.status = 'completed';
        submission.grade = result.grade;
        submission.scores = result.score;
        submission.report = result.report;
        await submission.save();
      })
      .catch(async (error) => {
        submission.status = 'failed';
        submission.error = error.message;
        await submission.save();
      });

    res.status(202).json({ submissionId: submission._id });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    if (submission.userId !== req.user.uid && req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json(submission);
  } catch (error) {
    next(error);
  }
});

export { router as submissionRouter };
```

**Tasks:**
- [ ] Create POST /api/grade endpoint (1.5 hours)
  - Validate input
  - Save submission to MongoDB
  - Trigger async grading
  - Prerequisites: Grading service complete
- [ ] Create GET /api/submission/:id endpoint (1 hour)
  - Fetch submission status
  - Implement role-based access
  - Handle not found errors
  - Prerequisites: Submission model complete
- [ ] Add auth middleware (30 minutes)
  - Verify Firebase tokens
  - Extract user data
  - Prerequisites: Firebase Admin SDK setup

## Phase 2: Core Features (Days 8-14)

### 2.1 AI Integration (3 hours)
**Objective:** Integrate Groq SDK for code quality analysis.

```typescript
// src/services/groqService.ts
import Groq from 'groq-sdk';
import fs from 'fs/promises';
import path from 'path';

interface CodeAnalysis {
  score: number;
  report: string;
}

export class GroqService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async analyzeCode(repoPath: string, testResult: any, rubric?: any): Promise<CodeAnalysis> {
    const files = await this.readRepoFiles(repoPath);
    const prompt = this.buildPrompt(files, testResult, rubric);

    try {
      const response = await this.groq.chat.completions.create({
        model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return {
        score: analysis.score || 0,
        report: analysis.report || 'No analysis provided'
      };
    } catch (error) {
      return {
        score: 0,
        report: `AI analysis failed: ${error.message}`
      };
    }
  }

  private async readRepoFiles(repoPath: string): Promise<string> {
    const files = await fs.readdir(repoPath, { recursive: true });
    let content = '';
    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        const fileContent = await fs.readFile(path.join(repoPath, file), 'utf-8');
        content += `// ${file}\n${fileContent}\n\n`;
      }
    }
    return content;
  }

  private buildPrompt(files: string, testResult: any, rubric?: any): string {
    return `
Analyze the following code for quality, focusing on Express.js/React best practices.
Provide a score (0-100) and a markdown report with educational feedback.
Consider test results and optional rubric.

## Code
${files}

## Test Results
${JSON.stringify(testResult, null, 2)}

## Rubric
${rubric ? JSON.stringify(rubric, null, 2) : 'Default grading criteria'}

## Output Format
{
  "score": number,
  "report": "# Code Quality Report\n\n..."
}
`;
  }
}
```

**Tasks:**
- [ ] Set up Groq SDK (1 hour)
  - Initialize client
  - Configure API key
  - Test basic API call
  - Prerequisites: Groq API key
- [ ] Implement code analysis (1.5 hours)
  - Read repository files
  - Build AI prompt
  - Parse AI response
  - Prerequisites: Grading service complete
- [ ] Add fallback scoring (30 minutes)
  - Use heuristics if AI fails
  - Log errors
  - Ensure graceful degradation
  - Prerequisites: Code analysis complete

### 2.2 Queue System (3 hours)
**Objective:** Implement job queue for concurrent submissions.

```typescript
// src/services/queueService.ts
import Queue from 'bull';
import { Submission } from '../models/Submission';
import { gradingService } from './gradingService';
import { io } from '../server';

interface JobData {
  submissionId: string;
}

export class QueueService {
  private queue: Queue.Queue;

  constructor() {
    this.queue = new Queue('grading', process.env.REDIS_URL!);
    this.setupWorkers();
  }

  async addJob(submissionId: string) {
    await this.queue.add({ submissionId });
  }

  private setupWorkers() {
    this.queue.process(async (job: Queue.Job<JobData>) => {
      const { submissionId } = job.data;
      const submission = await Submission.findById(submissionId);
      if (!submission) {
        throw new Error('Submission not found');
      }

      const phases = [
        'uploading', 'installing', 'testing', 'reviewing', 'reporting', 'completed'
      ];

      for (let i = 0; i < phases.length; i++) {
        submission.status = phases[i];
        await submission.save();
        io.emit('submission:progress', {
          id: submissionId,
          status: phases[i],
          progress: ((i + 1) / phases.length) * 100,
          currentStep: phases[i]
        });
        // Simulate processing time (replace with actual logic)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      try {
        const result = await gradingService.gradeSubmission(submission);
        submission.grade = result.grade;
        submission.scores = result.score;
        submission.report = result.report;
        submission.status = 'completed';
        await submission.save();
        io.emit('submission:complete', submission);
      } catch (error) {
        submission.status = 'failed';
        submission.error = error.message;
        await submission.save();
        io.emit('submission:error', error.message);
      }
    });
  }
}
```

**Tasks:**
- [ ] Set up Bull queue (1 hour)
  - Connect to Redis
  - Configure queue options
  - Test queue locally
  - Prerequisites: Redis Cloud setup
- [ ] Implement job processing (1.5 hours)
  - Process submissions
  - Update status via WebSocket
  - Handle job failures
  - Prerequisites: Grading service complete
- [ ] Add queue monitoring (30 minutes)
  - Log job status
  - Monitor queue length
  - Set up alerts
  - Prerequisites: Job processing complete

### 2.3 Database Models (2 hours)
**Objective:** Define MongoDB schemas.

```typescript
// src/models/Submission.ts
import mongoose, { Schema } from 'mongoose';

interface Score {
  total: number;
  testScore: number;
  qualityScore: number;
  breakdown: any[];
}

interface Submission {
  githubUrl: string;
  userId: string;
  instructorId: string;
  status: string;
  grade: string;
  scores: Score;
  report: string;
  rubric?: any;
  processingTime: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    projectType: string;
    dependencies: string[];
    testResults: any;
    aiAnalysis: any;
  };
}

const submissionSchema = new Schema<Submission>({
  githubUrl: { type: String, required: true },
  userId: { type: String, required: true },
  instructorId: { type: String },
  status: { type: String, default: 'uploading' },
  grade: { type: String, default: 'pending' },
  scores: {
    total: Number,
    testScore: Number,
    qualityScore: Number,
    breakdown: Array
  },
  report: String,
  rubric: Schema.Types.Mixed,
  processingTime: Number,
  metadata: {
    projectType: String,
    dependencies: [String],
    testResults: Schema.Types.Mixed,
    aiAnalysis: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

export const Submission = mongoose.model<Submission>('Submission', submissionSchema);
```

**Tasks:**
- [ ] Create Submission model (1 hour)
  - Define schema
  - Include all required fields
  - Add timestamps
  - Prerequisites: MongoDB connection
- [ ] Create User model (30 minutes)
  - Define basic user schema
  - Link to Firebase UID
  - Include role field
  - Prerequisites: Submission model complete
- [ ] Create Rubric model (30 minutes)
  - Define rubric schema
  - Support custom criteria
  - Track usage
  - Prerequisites: Submission model complete

## Phase 3: Polish & Production (Days 15-21)

### 3.1 Error Handling & Edge Cases (3 hours)
**Objective:** Ensure robust error handling.

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString()
  });
};
```

**Tasks:**
- [ ] Implement global error handler (1 hour)
  - Log errors
  - Return formatted responses
  - Handle common errors
  - Prerequisites: All routes complete
- [ ] Handle edge cases (1 hour)
  - Private repositories
  - Large repositories
  - Test failures
  - Prerequisites: Grading service complete
- [ ] Add rate limiting (1 hour)
  - Use express-rate-limit
  - Configure limits
  - Test under load
  - Prerequisites: All routes complete

### 3.2 Testing & Performance (3 hours)
**Objective:** Ensure reliability and scalability.

**Tasks:**
- [ ] Write unit tests (1.5 hours)
  - Test grading service
  - Test API endpoints
  - Use Jest
  - Prerequisites: All services complete
- [ ] Optimize performance (1 hour)
  - Add database indexes
  - Implement caching
  - Profile API
  - Prerequisites: All services complete
- [ ] Conduct load testing (30 minutes)
  - Simulate concurrent submissions
  - Use Artillery or k6
  - Optimize bottlenecks
  - Prerequisites: All tests complete

### 3.3 Security Hardening (2 hours)
**Objective:** Secure the backend.

**Tasks:**
- [ ] Implement input validation (1 hour)
  - Use Joi or zod
  - Validate all inputs
  - Prevent injection
  - Prerequisites: All routes complete
- [ ] Add security headers (30 minutes)
  - Use helmet
  - Configure CSP
  - Test headers
  - Prerequisites: Server setup complete
- [ ] Scan dependencies (30 minutes)
  - Use npm audit
  - Update vulnerable packages
  - Set up Dependabot
  - Prerequisites: All dependencies installed

## Deployment Checkpoints
- **Day 7:** Basic API deployed with grading pipeline
- **Day 14:** Real-time processing and AI integration deployed
- **Day 21:** Production-ready backend with full error handling and tests

## Estimated Total Timeline
- **Phase 1:** 11 hours
- **Phase 2:** 8 hours
- **Phase 3:** 8 hours
- **Total:** 27 hours over 3 weeks

## Notes
- Deploy after each major service completion
- Test services in isolation
- Monitor Redis queue performance
- Document API for frontend integration
- Set up error tracking post-deployment
