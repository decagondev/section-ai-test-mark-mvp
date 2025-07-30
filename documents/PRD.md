# Product Requirements Document (PRD)
## Deca Test Mark - Auto-Grading Test System

### Executive Summary

Deca Test Mark is an AI-powered auto-grading system designed to evaluate Express.js and Vite React projects for educational institutions. The system combines automated test execution (80% weight) with AI-driven code quality analysis (20% weight) to provide comprehensive, consistent grading and detailed feedback reports.

**Key Value Propositions:**
- **85% time savings** for instructors (based on case study validation)
- **Immediate feedback** for students (60-second processing vs weeks)
- **Consistent grading** eliminating subjective bias
- **Educational insights** through detailed AI-generated reports

### Project Overview

**Project Name:** Deca Test Mark  
**Target Market:** Ed-Tech companies and educational institutions  
**Primary Users:** Instructors, Teaching Assistants, Students  
**Core Technology:** AI-powered grading using Groq SDK with real-time processing

**Problem Statement:**
- Manual grading of coding projects takes 40+ hours per cohort
- Inconsistent grading criteria and instructor fatigue
- Students wait weeks for feedback, hindering iterative learning
- Difficulty scaling quality education with larger cohorts

**Solution:**
Automated grading system that processes GitHub repositories, runs tests, analyzes code quality, and generates comprehensive reports in under 60 seconds.

### User Stories & Requirements

#### Primary User Stories

**As an Instructor:**
- I want to submit a GitHub repository URL and receive an automated grade so I can save 85% of my grading time
- I want to provide custom rubrics in JSON format so I can maintain my specific grading criteria
- I want to view detailed reports for each submission so I can identify common issues across cohorts
- I want to override AI grades when necessary so I maintain final authority over student assessment
- I want to integrate with existing LMS systems so I can streamline my workflow

**As a Student:**
- I want to receive immediate feedback on my projects so I can iterate and improve quickly
- I want detailed, educational explanations of issues so I can learn from mistakes
- I want to download markdown reports so I can include them in my portfolio
- I want to see my grade breakdown (test results vs code quality) so I understand evaluation criteria

**As an Ed-Tech Administrator:**
- I want to handle 3x larger cohorts without additional instructor resources so I can scale operations
- I want consistent grading across all instructors so I can maintain quality standards
- I want analytics on common student issues so I can improve curriculum

#### Functional Requirements

**Core Grading Engine:**
- Process GitHub repository URLs
- Clone and analyze JavaScript/TypeScript projects (Express.js, Vite React)
- Execute npm install and npm test commands
- Calculate weighted scores (80% tests, 20% code quality)
- Generate detailed markdown reports with recommendations
- Support custom JSON rubrics

**Real-time Processing:**
- Display processing status (7 phases: uploading, installing deps, running tests, reviewing code, building report, completed, pass/fail)
- WebSocket connections for live updates
- Queue system for handling multiple concurrent submissions
- Graceful error handling and fallback scoring

**Report Generation:**
- Markdown formatted reports with insights, bugs, and recommendations
- JSON API responses with structured grade data
- PDF export capability for official records
- Code quality metrics and improvement suggestions

### Technical Architecture

#### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Service    │
│   (React)       │◄──►│   (Express.js)  │◄──►│   (Groq SDK)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Firebase      │    │   MongoDB       │    │   Redis Queue   │
│   (Auth)        │    │   (Database)    │    │   (Processing)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### Technology Stack

**Frontend:**
- Vite + React 18 + TypeScript
- Tailwind CSS 4 for styling
- Firebase Auth for authentication
- Socket.io-client for real-time updates
- React Query for API state management

**Backend:**
- Express.js with TypeScript
- CORS enabled for cross-origin requests
- Groq SDK for AI integration
- Mongoose for MongoDB ODM
- Socket.io for real-time communication
- Bull Queue with Redis for job processing

**Infrastructure:**
- Frontend: Netlify deployment
- Backend: Render.com deployment
- Database: MongoDB Atlas
- Queue: Redis Cloud
- File Storage: Temporary local storage with cleanup

### API Specifications

#### Core Endpoints

**POST /api/grade**
```typescript
interface GradeRequest {
  githubUrl: string;
  rubric?: RubricCriteria;
  userId: string;
}

interface RubricCriteria {
  codeQuality: {
    weight: number;
    criteria: string[];
  };
  testing: {
    weight: number;
    requiredTests: string[];
  };
  documentation: {
    weight: number;
    requirements: string[];
  };
}

interface GradeResponse {
  submissionId: string;
  githubUrl: string;
  grade: 'pass' | 'fail';
  score: {
    total: number;
    testScore: number;
    qualityScore: number;
  };
  report: string; // Markdown formatted
  timestamp: string;
  processingTime: number;
}
```

**GET /api/submission/:id**
```typescript
interface SubmissionStatus {
  id: string;
  status: 'uploading' | 'installing' | 'testing' | 'reviewing' | 'reporting' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string;
  error?: string;
}
```

**WebSocket Events:**
- `submission:start` - Begin processing
- `submission:progress` - Status updates
- `submission:complete` - Final results
- `submission:error` - Error handling

### Database Schema

#### MongoDB Collections

**Submissions Collection:**
```typescript
interface Submission {
  _id: ObjectId;
  githubUrl: string;
  userId: string;
  instructorId: string;
  status: ProcessingStatus;
  grade: 'pass' | 'fail' | 'pending';
  scores: {
    total: number;
    testScore: number;
    qualityScore: number;
    breakdown: TestResult[];
  };
  report: string;
  rubric?: RubricCriteria;
  processingTime: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    projectType: 'express' | 'react' | 'fullstack';
    dependencies: string[];
    testResults: any;
    aiAnalysis: any;
  };
}
```

**Users Collection:**
```typescript
interface User {
  _id: ObjectId;
  firebaseUid: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  profile: {
    name: string;
    institution?: string;
    course?: string;
  };
  createdAt: Date;
  lastActive: Date;
}
```

**Rubrics Collection:**
```typescript
interface SavedRubric {
  _id: ObjectId;
  name: string;
  instructorId: string;
  criteria: RubricCriteria;
  isDefault: boolean;
  createdAt: Date;
  usageCount: number;
}
```

### UI/UX Requirements

#### Design Principles
- **Immediate Feedback:** Real-time progress indicators and status updates
- **Educational Focus:** Detailed, constructive feedback over simple pass/fail
- **Professional Appearance:** Clean, modern interface suitable for academic environments
- **Accessibility:** WCAG 2.1 AA compliance for educational inclusivity

#### Key User Interfaces

**Submission Form:**
- GitHub URL input with validation
- Optional rubric selection/upload
- Submit button with loading states
- Progress tracking display

**Results Dashboard:**
- Grade visualization (pass/fail with score breakdown)
- Expandable report sections
- Download options (Markdown, PDF)
- Resubmission capabilities

**Instructor Dashboard:**
- Bulk submission processing
- Class analytics and insights
- Grade override capabilities
- Historical submission tracking

#### Responsive Design Requirements
- Mobile-first approach for student access
- Tablet optimization for instructor review
- Desktop focus for detailed analysis

### Deployment Strategy

#### Phase 1: MVP Deployment (Week 1)
**Objective:** Basic functionality deployed and accessible
- Simple submission form
- Basic grading pipeline
- Minimal results display
- Core API endpoints functional

#### Phase 2: Production Features (Week 2-3)
**Objective:** Full feature set with real-time processing
- WebSocket integration
- Comprehensive reporting
- User authentication
- Dashboard interfaces

#### Phase 3: Optimization & Integration (Week 4+)
**Objective:** Performance optimization and LMS integration
- Advanced analytics
- LMS API integration
- Performance monitoring
- Scale testing

#### Infrastructure Setup
**Frontend (Netlify):**
- Automatic deployments from main branch
- Environment variables for API endpoints
- Custom domain configuration
- CDN optimization

**Backend (Render.com):**
- Docker container deployment
- Auto-scaling configuration
- Environment variables for secrets
- Health check endpoints

**Database (MongoDB Atlas):**
- Production cluster setup
- Connection string management
- Backup configuration
- Performance monitoring

### Success Metrics

#### Technical Metrics
- **Processing Time:** < 60 seconds per submission
- **Uptime:** 99.5% availability
- **Accuracy:** 95% consistency with manual grading
- **Scalability:** Handle 100+ concurrent submissions

#### User Experience Metrics
- **Instructor Time Savings:** 85% reduction in grading time
- **Student Satisfaction:** > 4.0/5.0 rating for feedback quality
- **Adoption Rate:** 80% instructor adoption within 6 months
- **Processing Success Rate:** 98% successful completions

#### Business Impact Metrics
- **Course Completion:** 15% increase due to faster feedback
- **Instructor Retention:** Reduced burnout from repetitive tasks
- **Scalability:** Support 3x larger cohorts without additional resources

### Timeline & Milestones

#### Week 1: Foundation & MVP
- **Days 1-2:** Project setup and initial deployment
- **Days 3-4:** Core grading pipeline implementation
- **Days 5-7:** Basic UI and API integration

#### Week 2: Core Features
- **Days 8-10:** Real-time processing and WebSocket integration
- **Days 11-12:** Report generation and display
- **Days 13-14:** Authentication and user management

#### Week 3: Polish & Testing
- **Days 15-17:** UI/UX improvements and responsive design
- **Days 18-19:** Error handling and edge cases
- **Days 20-21:** Performance optimization and testing

#### Week 4+: Launch & Iteration
- **Week 4:** Beta testing with select instructors
- **Week 5:** Production launch and monitoring
- **Week 6+:** Feature requests and scaling

### Risk Assessment

#### High-Risk Items
**AI Processing Reliability**
- *Risk:* Inconsistent or slow AI responses affecting user experience
- *Mitigation:* Implement fallback scoring, prompt engineering, intelligent caching
- *Contingency:* Manual grade override system, simplified heuristic backup

**GitHub Repository Access**
- *Risk:* Private repositories or authentication issues
- *Mitigation:* Clear documentation, repository validation, error handling
- *Contingency:* Manual repository upload option

**Scaling Under Load**
- *Risk:* System performance degradation with multiple concurrent users
- *Mitigation:* Queue system, horizontal scaling, performance monitoring
- *Contingency:* Load balancing, auto-scaling infrastructure

#### Medium-Risk Items
**Integration Complexity**
- *Risk:* LMS integration difficulties affecting adoption
- *Mitigation:* Standard API patterns, comprehensive documentation
- *Contingency:* Manual grade transfer processes

**User Training Requirements**
- *Risk:* Instructor adoption challenges due to technology barrier
- *Mitigation:* Intuitive UI design, comprehensive onboarding
- *Contingency:* Training workshops, dedicated support

#### Low-Risk Items
**Technology Stack Maturity**
- *Risk:* Framework or library compatibility issues
- *Mitigation:* Proven technology choices, regular updates
- *Contingency:* Alternative library options available

### Conclusion

Deca Test Mark addresses a significant pain point in educational technology by automating the time-intensive process of coding project evaluation. With proven demand validated through the case study and a clear technical approach, the project is positioned for successful adoption in the ed-tech market.

The phased development approach prioritizes early deployment and user feedback, ensuring the product meets real user needs while maintaining technical excellence and scalability for future growth.
