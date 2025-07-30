# Frontend Development Tasks - Deca Test Mark

## Overview
Detailed frontend development tasks for building the Deca Test Mark UI using Vite, React, TypeScript, Tailwind CSS, and Firebase Auth. Tasks prioritize a minimal viable skeleton, early deployment, and iterative enhancement, focusing on real-time feedback and educational user experience.

## Prerequisites
- Node.js 18+ installed
- Frontend repository set up (see SETUP-TASKS.md)
- Firebase project configured
- Netlify deployment pipeline established
- Basic knowledge of React, TypeScript, and Tailwind CSS

## Phase 1: Foundation Components (Days 1-7)

### 1.1 Authentication Components (4 hours)
**Objective:** Build secure authentication UI with Firebase integration.

```typescript
// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signIn(data.email, data.password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
```

**Tasks:**
- [ ] Create LoginForm component with validation (1 hour)
  - Use react-hook-form and zod for form validation
  - Integrate with AuthContext
  - Add error handling and loading states
  - Prerequisites: AuthContext implemented
- [ ] Create SignUpForm component (1 hour)
  - Similar structure to LoginForm
  - Add confirmation password field
  - Integrate with Firebase signup
  - Prerequisites: AuthContext implemented
- [ ] Create ProtectedRoute component (30 minutes)
  - Redirect unauthenticated users to login
  - Use Firebase auth state
  - Prerequisites: AuthContext implemented
- [ ] Implement logout functionality (30 minutes)
  - Add logout button to Navigation
  - Clear auth state on logout
  - Redirect to home page
  - Prerequisites: Navigation component
- [ ] Add loading states and error handling (1 hour)
  - Implement global loading spinner
  - Add error toast notifications
  - Use Tailwind for styling
  - Prerequisites: All auth components complete

### 1.2 Layout Components (3 hours)
**Objective:** Create reusable layout structure for consistent UI.

```typescript
// src/components/layout/Layout.tsx
import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
```

```typescript
// src/components/layout/Navigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Home, BarChart3 } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Deca Test Mark</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/') 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  <Home className="inline-block w-4 h-4 mr-1" />
                  Home
                </Link>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/dashboard') 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  <BarChart3 className="inline-block w-4 h-4 mr-1" />
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-600 hover:text-red-600 rounded-md"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
```

```typescript
// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">&copy; {new Date().getFullYear()} Deca Test Mark. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <Link to="/about" className="text-sm hover:text-primary-300">About</Link>
            <Link to="/privacy" className="text-sm hover:text-primary-300">Privacy</Link>
            <Link to="/terms" className="text-sm hover:text-primary-300">Terms</Link>
            <Link to="/contact" className="text-sm hover:text-primary-300">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

**Tasks:**
- [ ] Create main Layout component (1 hour)
  - Implement flexbox structure
  - Integrate AuthContext
  - Add Tailwind styling
  - Prerequisites: AuthContext implemented
- [ ] Create Navigation component with responsive design (1.5 hours)
  - Add mobile menu toggle
  - Implement active route styling
  - Include user profile and logout
  - Prerequisites: Auth components complete
- [ ] Create Footer component (30 minutes)
  - Add basic links (About, Privacy, Terms)
  - Apply Tailwind styling
  - Ensure responsive design
  - Prerequisites: None

### 1.3 Form Components (4 hours)
**Objective:** Build submission form for GitHub URL and rubric input.

```typescript
// src/components/forms/SubmissionForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Github, Upload, FileText } from 'lucide-react';

const submissionSchema = z.object({
  githubUrl: z.string()
    .url('Please enter a valid URL')
    .refine(url => url.includes('github.com'), 'Must be a GitHub repository URL'),
  rubric: z.string().optional(),
  projectType: z.enum(['express', 'react', 'fullstack']),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface SubmissionFormProps {
  onSubmit: (data: SubmissionFormData) => void;
  isLoading?: boolean;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit, isLoading = false }) => {
  const [rubricFile, setRubricFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      projectType: 'express'
    }
  });

  const handleRubricUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setRubricFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          JSON.parse(content); // Validate JSON
          setValue('rubric', content);
        } catch (error) {
          alert('Invalid JSON file');
          setRubricFile(null);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid JSON file');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <Github className="h-12 w-12 text-primary-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Submit Your Project</h2>
        <p className="text-gray-600 mt-2">
          Enter your GitHub repository URL to get automated feedback
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL
          </label>
          <div className="relative">
            <Github className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register('githubUrl')}
              type="url"
              id="githubUrl"
              placeholder="https://github.com/username/repository"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          {errors.githubUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.githubUrl.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
            Project Type
          </label>
          <select
            {...register('projectType')}
            id="projectType"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="express">Express.js Backend</option>
            <option value="react">React Frontend</option>
            <option value="fullstack">Full Stack Application</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Rubric (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Upload a JSON rubric file to customize grading criteria
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleRubricUpload}
              className="hidden"
              id="rubric-upload"
            />
            <label
              htmlFor="rubric-upload"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </label>
            {rubricFile && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {rubricFile.name} uploaded
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Project'}
        </button>
      </form>
    </div>
  );
};

export default SubmissionForm;
```

**Tasks:**
- [ ] Create SubmissionForm component (2 hours)
  - Implement GitHub URL input with validation
  - Add project type selector
  - Support JSON rubric file upload
  - Use zod for schema validation
  - Prerequisites: Layout components complete
- [ ] Integrate form with API service (1 hour)
  - Create API service for POST /api/grade
  - Handle API responses and errors
  - Use React Query for state management
  - Prerequisites: Backend API ready
- [ ] Add real-time progress tracking (1 hour)
  - Connect to WebSocket for status updates
  - Display processing phases
  - Use Tailwind for progress UI
  - Prerequisites: WebSocket service implemented

### 1.4 Results Display Components (3 hours)
**Objective:** Create components to display grading results.

```typescript
// src/components/results/ResultsDisplay.tsx
import React from 'react';
import { Download, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface GradeResult {
  githubUrl: string;
  grade: 'pass' | 'fail';
  score: {
    total: number;
    testScore: number;
    qualityScore: number;
  };
  report: string;
}

interface ResultsDisplayProps {
  result: GradeResult;
  onDownloadMarkdown: () => void;
  onDownloadPDF: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onDownloadMarkdown, onDownloadPDF }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Grading Results</h2>
        <p className="text-gray-600">
          Repository: <a href={result.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{result.githubUrl}</a>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-primary-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-gray-800">Overall Grade</h3>
          <p className={`text-2xl font-bold ${result.grade === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
            {result.grade.toUpperCase()}
          </p>
          <p className="text-gray-600">Total Score: {result.score.total}%</p>
        </div>
        <div className="bg-primary-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-gray-800">Test Score</h3>
          <p className="text-2xl font-bold text-gray-900">{result.score.testScore}%</p>
          <p className="text-gray-600">80% Weight</p>
        </div>
        <div className="bg-primary-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-gray-800">Code Quality</h3>
          <p className="text-2xl font-bold text-gray-900">{result.score.qualityScore}%</p>
          <p className="text-gray-600">20% Weight</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Detailed Report</h3>
        <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
          <ReactMarkdown>{result.report}</ReactMarkdown>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onDownloadMarkdown}
          className="flex items-center bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
        >
          <FileText className="h-4 w-4 mr-2" />
          Download Markdown
        </button>
        <button
          onClick={onDownloadPDF}
          className="flex items-center bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
```

**Tasks:**
- [ ] Create ResultsDisplay component (1.5 hours)
  - Display grade, scores, and markdown report
  - Use ReactMarkdown for report rendering
  - Style with Tailwind
  - Prerequisites: SubmissionForm complete
- [ ] Implement download functionality (1 hour)
  - Add Markdown file download
  - Implement PDF generation (use jsPDF)
  - Handle download errors
  - Prerequisites: ResultsDisplay complete
- [ ] Add resubmission button (30 minutes)
  - Link to SubmissionForm with pre-filled data
  - Clear previous results
  - Prerequisites: ResultsDisplay complete

## Phase 2: Real-time Features (Days 8-14)

### 2.1 WebSocket Integration (2 hours)
**Objective:** Enable real-time progress tracking.

```typescript
// src/services/websocketService.ts
import { io, Socket } from 'socket.io-client';

interface SubmissionStatus {
  id: string;
  status: 'uploading' | 'installing' | 'testing' | 'reviewing' | 'reporting' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  error?: string;
}

class WebSocketService {
  private socket: Socket | null = null;

  connect(onStatusUpdate: (status: SubmissionStatus) => void, onError: (error: string) => void) {
    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('submission:progress', (data: SubmissionStatus) => {
      onStatusUpdate(data);
    });

    this.socket.on('submission:error', (error: string) => {
      onError(error);
    });

    this.socket.on('submission:complete', (data: SubmissionStatus) => {
      onStatusUpdate(data);
    });

    this.socket.on('connect_error', (err) => {
      onError(`Connection failed: ${err.message}`);
    });
  }

  submit(submissionId: string) {
    if (this.socket) {
      this.socket.emit('submission:start', { submissionId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const websocketService = new WebSocketService();
```

**Tasks:**
- [ ] Create WebSocket service (1 hour)
  - Implement Socket.io client
  - Handle connection and errors
  - Emit submission start event
  - Prerequisites: Backend WebSocket ready
- [ ] Integrate WebSocket with UI (1 hour)
  - Update SubmissionForm to show progress
  - Create ProgressTracker component
  - Use React Query to refetch results
  - Prerequisites: WebSocket service complete

### 2.2 Dashboard Components (3 hours)
**Objective:** Build dashboards for students and instructors.

```typescript
// src/pages/Dashboard.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { BarChart3, FileText } from 'lucide-react';

interface SubmissionSummary {
  id: string;
  githubUrl: string;
  grade: 'pass' | 'fail';
  score: number;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: submissions, isLoading } = useQuery<SubmissionSummary[]>({
    queryKey: ['submissions', user?.uid],
    queryFn: () => apiService.getSubmissions(user!.uid),
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {user?.role === 'instructor' ? (
        <InstructorDashboard submissions={submissions || []} />
      ) : (
        <StudentDashboard submissions={submissions || []} />
      )}
    </div>
  );
};

const StudentDashboard: React.FC<{ submissions: SubmissionSummary[] }> = ({ submissions }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Your Submissions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {submissions.map((submission) => (
          <div key={submission.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate">
                {submission.githubUrl}
              </a>
            </div>
            <p className={`text-lg font-semibold ${submission.grade === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
              {submission.grade.toUpperCase()}
            </p>
            <p className="text-gray-600">Score: {submission.score}%</p>
            <p className="text-sm text-gray-500">Submitted: {new Date(submission.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const InstructorDashboard: React.FC<{ submissions: SubmissionSummary[] }> = ({ submissions }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Class Submissions</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <p className="text-gray-600">Total Submissions</p>
            <p className="text-2xl font-bold">{submissions.length}</p>
          </div>
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-gray-600">Pass Rate</p>
            <p className="text-2xl font-bold">
              {((submissions.filter(s => s.grade === 'pass').length / submissions.length) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <p className="text-gray-600">Average Score</p>
            <p className="text-2xl font-bold">
              {(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div key={submission.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate">
                {submission.githubUrl}
              </a>
            </div>
            <p className={`text-lg font-semibold ${submission.grade === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
              {submission.grade.toUpperCase()}
            </p>
            <p className="text-gray-600">Score: {submission.score}%</p>
            <button className="mt-2 text-primary-600 hover:underline">Override Grade</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
```

**Tasks:**
- [ ] Create StudentDashboard component (1 hour)
  - Display submission history
  - Show grades and scores
  - Link to detailed results
  - Prerequisites: ResultsDisplay complete
- [ ] Create InstructorDashboard component (1.5 hours)
  - Show class analytics
  - List all submissions
  - Add grade override button
  - Prerequisites: StudentDashboard complete
- [ ] Integrate dashboards with API (30 minutes)
  - Fetch submission data
  - Handle pagination
  - Use React Query for caching
  - Prerequisites: Backend API ready

## Phase 3: Polish & Optimization (Days 15-21)

### 3.1 UI/UX Enhancements (3 hours)
**Objective:** Improve user experience and accessibility.

**Tasks:**
- [ ] Implement progress animations (1 hour)
  - Add animated progress bar for processing
  - Use Tailwind and CSS animations
  - Prerequisites: WebSocket integration complete
- [ ] Enhance accessibility (1 hour)
  - Ensure WCAG 2.1 AA compliance
  - Add ARIA labels
  - Test with screen readers
  - Prerequisites: All UI components complete
- [ ] Optimize responsive design (1 hour)
  - Test on mobile and tablet
  - Adjust layouts for breakpoints
  - Fix overflow issues
  - Prerequisites: All UI components complete

### 3.2 Error Handling & Edge Cases (2 hours)
**Objective:** Ensure robust error handling.

**Tasks:**
- [ ] Implement global error boundary (1 hour)
  - Create ErrorBoundary component
  - Log errors to console
  - Show user-friendly error page
  - Prerequisites: All components complete
- [ ] Handle API errors (1 hour)
  - Display error toasts
  - Retry failed requests
  - Fallback to cached data
  - Prerequisites: API integration complete

### 3.3 Testing & Performance (3 hours)
**Objective:** Ensure reliability and performance.

**Tasks:**
- [ ] Write unit tests (1.5 hours)
  - Test form validation
  - Test auth components
  - Use Jest and React Testing Library
  - Prerequisites: All components complete
- [ ] Optimize performance (1 hour)
  - Implement lazy loading
  - Use memoization
  - Reduce bundle size
  - Prerequisites: All components complete
- [ ] Conduct E2E tests (30 minutes)
  - Test submission flow
  - Use Cypress or Playwright
  - Verify deployment
  - Prerequisites: All features complete

## Deployment Checkpoints
- **Day 7:** Basic UI deployed with auth and submission form
- **Day 14:** Real-time features and dashboards deployed
- **Day 21:** Polished UI with full error handling and tests

## Estimated Total Timeline
- **Phase 1:** 14 hours
- **Phase 2:** 8 hours
- **Phase 3:** 8 hours
- **Total:** 30 hours over 3 weeks

## Notes
- Deploy after each major component completion
- Test components in isolation before integration
- Prioritize student feedback visibility
- Monitor performance on mobile devices
- Document any UI deviations for UX review
