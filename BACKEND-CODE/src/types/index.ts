import { Request } from 'express';
import { ObjectId } from 'mongoose';

export type ProcessingStatus = 
  | 'uploading' 
  | 'installing' 
  | 'testing' 
  | 'reviewing' 
  | 'reporting' 
  | 'completed' 
  | 'failed';

export type GradeType = 'pass' | 'fail' | 'pending';

export type UserRole = 'student' | 'instructor' | 'admin';

export type ProjectType = 'express' | 'react' | 'fullstack' | 'c';

export interface SubmissionScore {
  total: number;
  testScore: number;
  qualityScore: number;
  breakdown: Array<{
    category: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
}

export interface TestResult {
  passed: number;
  total: number;
  details: string;
  duration?: number;
}

export interface AIAnalysis {
  promptTokens: number;
  completionTokens: number;
  analysisTime: number;
  modelUsed: string;
}

export interface SubmissionMetadata {
  projectType: ProjectType;
  dependencies: string[];
  testResults: TestResult;
  aiAnalysis: AIAnalysis;
  repositorySize?: number;
  fileCount?: number;
}

export interface ISubmission {
  _id?: ObjectId;
  githubUrl: string;
  userId: string;
  instructorId?: string;
  status: ProcessingStatus;
  grade: GradeType;
  scores?: SubmissionScore;
  report?: string;
  instructorFeedback?: string;
  instructorReport?: string;
  rubric?: RubricCriteria;
  processingTime?: number;
  error?: string;
  metadata: SubmissionMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  name: string;
  institution?: string;
  course?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  defaultRubric?: ObjectId;
}

export interface UserStats {
  totalSubmissions: number;
  averageScore: number;
  lastActive: Date;
}

export interface IUser {
  _id?: ObjectId;
  email: string;
  password: string;
  role: UserRole;
  profile: UserProfile;
  preferences: UserPreferences;
  stats: UserStats;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  criteria: string[];
}

export interface RubricCriteria {
  codeQuality: RubricCriterion;
  testing: RubricCriterion;
  documentation: RubricCriterion;
  architecture: RubricCriterion;
  [key: string]: RubricCriterion;
}

export interface IRubric {
  _id?: ObjectId;
  name: string;
  instructorId: string;
  criteria: RubricCriteria;
  isDefault: boolean;
  createdAt: Date;
  usageCount: number;
}

export interface GradeRequest {
  githubUrl: string;
  rubric?: RubricCriteria;
  projectType: ProjectType;
}

export interface GradeResponse {
  submissionId: string;
  status: ProcessingStatus;
  message: string;
}

export interface SubmissionStatusResponse {
  id: string;
  status: ProcessingStatus;
  progress: number;
  currentStep: string;
  error?: string;
}

export interface CodeAnalysisResult {
  score: number;
  report: string;
  suggestions: string[];
  strengths: string[];
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    file?: string;
    line?: number;
  }>;
}

export interface SubmissionProgressEvent {
  id: string;
  status: ProcessingStatus;
  progress: number;
  currentStep: string;
  message?: string;
}

export interface SubmissionCompleteEvent {
  submission: ISubmission;
}

export interface SubmissionErrorEvent {
  id: string;
  error: string;
  phase: ProcessingStatus;
}

export interface GradingJobData {
  submissionId: string;
}

export interface QueueJobResult {
  success: boolean;
  submissionId: string;
  processingTime: number;
  error?: string;
}

export interface AuthenticatedRequest extends Request {
  user: {
    uid: string;
    email: string;
    role: UserRole;
  };
}

export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  GROQ_API_KEY: string;
  REDIS_URL: string;
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string[];
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
  JWT_SECRET: string;
  MAX_PROCESSING_TIME: number;
  MAX_CONCURRENT_JOBS: number;
  TEMP_DIR_PREFIX: string;
  LOG_LEVEL: string;
  LOG_FILE: string;
}

export interface APIError extends Error {
  status: number;
  code?: string;
}

export interface HealthCheckResponse {
  status: 'OK' | 'ERROR';
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
    groq: 'available' | 'unavailable';
  };
  version: string;
  uptime: number;
} 