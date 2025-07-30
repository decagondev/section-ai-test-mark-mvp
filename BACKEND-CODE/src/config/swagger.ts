import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Deca Test Mark API',
      version: '1.0.0',
      description: `
# Deca Test Mark - AI-Powered Auto-Grading System

## Overview
The Deca Test Mark API is a comprehensive backend service that provides automated grading for GitHub repositories. 
It supports Express.js, React, and fullstack projects with AI-powered code quality analysis.

## Key Features
- **Automated Repository Processing**: Clone, install, test, and analyze GitHub repositories
- **AI Code Quality Analysis**: Integration with Groq AI for educational feedback
- **Real-time Progress Updates**: WebSocket-based progress tracking
- **Comprehensive Grading**: Test results + AI analysis with detailed reports
- **User Management**: Role-based access control (student/instructor/admin)
- **Authentication**: JWT-based secure authentication

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
\`Authorization: Bearer <your-jwt-token>\`

## Getting Started
1. **Sign up**: \`POST /api/auth/signup\`
2. **Login**: \`POST /api/auth/login\`
3. **Submit for grading**: \`POST /api/submissions/grade\`
4. **Check status**: \`GET /api/submissions/{id}\`

## WebSocket Events
Connect to \`ws://localhost:3001\` for real-time updates:
- \`submission:progress\`: Progress updates during grading
- \`submission:complete\`: Grading completed
- \`submission:error\`: Error occurred during grading

## Rate Limits
- 1000 requests per 15 minutes per IP
- Grading submissions: 10 concurrent jobs maximum
      `,
      contact: {
        name: 'Deca Test Mark Team',
        email: 'support@decatestmark.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.decatestmark.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '60d5ecb54b24a1001f5d2c8e' },
            email: { type: 'string', format: 'email', example: 'student@example.com' },
            role: { 
              type: 'string', 
              enum: ['student', 'instructor', 'admin'],
              example: 'student'
            },
            profile: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'John Doe' },
                institution: { type: 'string', example: 'University of Technology' },
                course: { type: 'string', example: 'CS101 - Introduction to Programming' }
              }
            },
            stats: {
              type: 'object',
              properties: {
                totalSubmissions: { type: 'number', example: 15 },
                averageScore: { type: 'number', example: 85.5 },
                lastActive: { type: 'string', format: 'date-time' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'student@example.com' },
            password: { type: 'string', minLength: 6, example: 'password123' }
          }
        },
        
        SignupRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email', example: 'student@example.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            name: { type: 'string', example: 'John Doe' }
          }
        },
        
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        
        GradeRequest: {
          type: 'object',
          required: ['githubUrl', 'projectType'],
          properties: {
            githubUrl: { 
              type: 'string', 
              format: 'uri',
              pattern: '^https://github\\.com/[\\w\\.-]+/[\\w\\.-]+(?:\\.git)?$',
              example: 'https://github.com/username/express-project'
            },
            projectType: { 
              type: 'string', 
              enum: ['express', 'react', 'fullstack', 'c'],
              example: 'express'
            },
            rubric: {
              type: 'object',
              description: 'Optional custom grading rubric',
              example: {
                codeQuality: { weight: 0.4, maxScore: 100 },
                testing: { weight: 0.3, maxScore: 100 },
                documentation: { weight: 0.2, maxScore: 100 },
                architecture: { weight: 0.1, maxScore: 100 }
              }
            },
            fileGlobs: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional file patterns to include in analysis',
              example: ['README.md', 'package.json', 'src/**/*.js', 'routes/**/*.js']
            }
          }
        },
        
        Submission: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '60d5ecb54b24a1001f5d2c8e' },
            githubUrl: { type: 'string', example: 'https://github.com/username/express-project' },
            userId: { type: 'string', example: '60d5ecb54b24a1001f5d2c8e' },
            instructorId: { type: 'string', example: '60d5ecb54b24a1001f5d2c8f' },
            status: { 
              type: 'string', 
              enum: ['uploading', 'installing', 'testing', 'reviewing', 'reporting', 'completed', 'failed'],
              example: 'completed'
            },
            grade: { 
              type: 'string', 
              enum: ['pass', 'fail', 'pending'],
              example: 'pass'
            },
            scores: {
              type: 'object',
              properties: {
                total: { type: 'number', minimum: 0, maximum: 100, example: 85 },
                testScore: { type: 'number', minimum: 0, maximum: 100, example: 90 },
                qualityScore: { type: 'number', minimum: 0, maximum: 100, example: 80 },
                breakdown: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      category: { type: 'string', example: 'Code Quality' },
                      score: { type: 'number', example: 80 },
                      maxScore: { type: 'number', example: 100 },
                      feedback: { type: 'string', example: 'Good code structure and naming conventions' }
                    }
                  }
                }
              }
            },
            report: { 
              type: 'string', 
              description: 'Markdown formatted grading report',
              example: '# Grading Report\n\n## Summary\nThis project demonstrates...'
            },
            processingTime: { type: 'number', example: 45 },
            error: { type: 'string', example: 'Repository not found' },
            metadata: {
              type: 'object',
              properties: {
                projectType: { type: 'string', example: 'express' },
                dependencies: { 
                  type: 'array', 
                  items: { type: 'string' },
                  example: ['express', 'jest', 'nodemon']
                },
                testResults: {
                  type: 'object',
                  properties: {
                    passed: { type: 'number', example: 8 },
                    total: { type: 'number', example: 10 },
                    details: { type: 'string', example: 'All core functionality tests passed' },
                    duration: { type: 'number', example: 2.5 }
                  }
                },
                aiAnalysis: {
                  type: 'object',
                  properties: {
                    promptTokens: { type: 'number', example: 1500 },
                    completionTokens: { type: 'number', example: 800 },
                    analysisTime: { type: 'number', example: 3.2 },
                    modelUsed: { type: 'string', example: 'meta-llama/llama-4-maverick-17b-128e-instruct' }
                  }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['OK', 'ERROR'], example: 'OK' },
            timestamp: { type: 'string', format: 'date-time' },
            services: {
              type: 'object',
              properties: {
                database: { type: 'string', enum: ['connected', 'disconnected'], example: 'connected' },
                groq: { type: 'string', enum: ['available', 'unavailable'], example: 'available' }
              }
            },
            version: { type: 'string', example: '1.0.0' },
            uptime: { type: 'number', example: 3600 }
          }
        },
        
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Invalid request' },
            status: { type: 'number', example: 400 },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        
        SubmissionProgressEvent: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '60d5ecb54b24a1001f5d2c8e' },
            status: { 
              type: 'string', 
              enum: ['uploading', 'installing', 'testing', 'reviewing', 'reporting'],
              example: 'testing'
            },
            progress: { type: 'number', minimum: 0, maximum: 100, example: 60 },
            currentStep: { type: 'string', example: 'Running test suite...' },
            message: { type: 'string', example: 'Tests completed successfully' }
          }
        },
        
        SubmissionCompleteEvent: {
          type: 'object',
          properties: {
            submission: { $ref: '#/components/schemas/Submission' }
          }
        },
        
        SubmissionErrorEvent: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '60d5ecb54b24a1001f5d2c8e' },
            error: { type: 'string', example: 'Repository not found or private' },
            phase: { 
              type: 'string', 
              enum: ['uploading', 'installing', 'testing', 'reviewing', 'reporting'],
              example: 'uploading'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User registration, login, and profile management'
      },
      {
        name: 'Submissions',
        description: 'Submit repositories for grading and check results'
      },
      {
        name: 'Users',
        description: 'User management (admin only)'
      },
      {
        name: 'Health',
        description: 'System health and status checks'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/models/*.ts',
    './src/types/*.ts'
  ]
};

export const specs = swaggerJsdoc(options); 