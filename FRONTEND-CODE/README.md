# Deca Test Mark - Frontend

## Overview

The frontend for Deca Test Mark is a modern React application that provides an intuitive interface for students and instructors to interact with the AI-powered auto-grading system. Built with Vite, React 18, TypeScript, and Tailwind CSS, it offers real-time feedback, comprehensive dashboards, and seamless user experience.

## 🚀 Key Features

- **Real-time Submission Processing** - Live progress tracking with WebSocket connections
- **GitHub Repository Integration** - Submit projects directly via GitHub URLs
- **AI-Powered Feedback** - Detailed reports with educational insights
- **Role-Based Dashboards** - Separate interfaces for students and instructors
- **Responsive Design** - Mobile-first approach with desktop optimization
- **Secure Authentication** - Firebase Auth integration with protected routes

## 🛠 Technology Stack

- **Framework:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS 4 with custom design system
- **Authentication:** Firebase Auth
- **Real-time Communication:** Socket.io Client
- **State Management:** React Query (@tanstack/react-query)
- **Form Handling:** React Hook Form with Zod validation
- **Icons:** Lucide React
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Deployment:** Netlify

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── SignUpForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── forms/           # Form components
│   │   └── SubmissionForm.tsx
│   ├── layout/          # Layout components
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   ├── results/         # Results display components
│   │   └── ResultsDisplay.tsx
│   └── ui/              # Base UI components
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── hooks/               # Custom React hooks
├── pages/               # Page components
│   ├── auth/
│   ├── dashboard/
│   └── results/
├── services/            # API and external services
│   ├── apiService.ts
│   ├── websocketService.ts
│   └── firebaseConfig.ts
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── App.tsx             # Main application component
```

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────┐
│               Frontend (React)           │
├─────────────────────────────────────────┤
│  Components:                            │
│  • Authentication (Firebase)            │
│  • Submission Forms                     │
│  • Real-time Progress Tracking          │
│  • Results Dashboard                    │
│  • Instructor Management                │
└─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│          External Services              │
├─────────────────────────────────────────┤
│  • Backend API (Express.js)             │
│  • Firebase Auth                        │
│  • WebSocket Server                     │
└─────────────────────────────────────────┘
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project configured
- Backend API running

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd deca-test-mark-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```bash
# .env.local
VITE_FIREBASE_APIKEY=your_firebase_api_key
VITE_FIREBASE_AUTHDOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECTID=your_project_id
VITE_FIREBASE_STORAGEBUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGINGSENDERID=your_sender_id
VITE_FIREBASE_APPID=your_app_id
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## 📋 Development Phases

### Phase 1: Foundation Components (Days 1-7) - 14 hours

#### Authentication Components (4 hours)
- **LoginForm** - Email/password login with validation
- **SignUpForm** - User registration with confirmation
- **ProtectedRoute** - Route protection for authenticated users
- **Logout functionality** - Secure logout with state cleanup

**Key Features:**
- Form validation using react-hook-form + zod
- Error handling and loading states
- Firebase Auth integration
- Responsive design with Tailwind CSS

#### Layout Components (3 hours)
- **Layout** - Main application layout wrapper
- **Navigation** - Responsive navigation with user menu
- **Footer** - Site footer with links

**Key Features:**
- Mobile-first responsive design
- Active route highlighting
- User profile integration
- Consistent spacing and typography

#### Form Components (4 hours)
- **SubmissionForm** - GitHub URL submission with validation
- **Project type selection** - Express, React, or Full Stack
- **Custom rubric upload** - JSON file upload and validation
- **Real-time progress tracking** - WebSocket integration

**Key Features:**
- GitHub URL validation
- File upload with JSON validation
- Real-time status updates
- Error handling and user feedback

#### Results Display Components (3 hours)
- **ResultsDisplay** - Grade and score visualization
- **Report rendering** - Markdown report display
- **Download functionality** - Markdown and PDF export
- **Resubmission handling** - Link back to submission form

**Key Features:**
- Score breakdown visualization
- Markdown rendering with syntax highlighting
- Export capabilities
- Responsive design for all screen sizes

### Phase 2: Real-time Features (Days 8-14) - 8 hours

#### WebSocket Integration (2 hours)
- **Real-time progress updates** - Socket.io client implementation
- **Connection management** - Reconnection and error handling
- **Status synchronization** - UI updates based on processing phases

#### Dashboard Components (3 hours)
- **StudentDashboard** - Submission history and analytics
- **InstructorDashboard** - Class management and oversight
- **Analytics visualization** - Charts and metrics display

**Key Features:**
- Role-based access control
- Submission history tracking
- Grade override capabilities (instructors)
- Performance analytics

### Phase 3: Polish & Optimization (Days 15-21) - 8 hours

#### UI/UX Enhancements (3 hours)
- **Progress animations** - Smooth transitions and loading states
- **Accessibility improvements** - WCAG 2.1 AA compliance
- **Responsive design refinement** - Mobile and tablet optimization

#### Error Handling & Edge Cases (2 hours)
- **Global error boundary** - Catch and handle React errors
- **API error handling** - Network error recovery
- **Fallback UI states** - Graceful degradation

#### Testing & Performance (3 hours)
- **Unit tests** - Component testing with Jest/RTL
- **Performance optimization** - Code splitting and lazy loading
- **E2E testing** - Critical user flow validation

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary-50: #eff6ff
--primary-500: #3b82f6
--primary-600: #2563eb
--primary-700: #1d4ed8

/* Status Colors */
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #06b6d4
```

### Typography
- **Headings:** Inter font family, various weights
- **Body:** Inter font family, regular weight
- **Code:** Monaco, monospace

### Components
- **Forms:** Consistent input styling with focus states
- **Buttons:** Primary, secondary, and danger variants
- **Cards:** Elevation and rounded corners
- **Navigation:** Clean, modern navigation patterns

## 🔌 API Integration

### Endpoints Used
```typescript
// Submission endpoints
POST /api/grade              // Submit project for grading
GET /api/submission/:id      // Get submission status

// User endpoints  
GET /api/user/submissions    // Get user's submission history
```

### WebSocket Events
```typescript
// Client emits
'submission:start'           // Begin processing submission

// Server emits
'submission:progress'        // Processing status updates
'submission:complete'        // Final results ready
'submission:error'           // Processing error occurred
```

## 🚀 Deployment

### Netlify Deployment
```bash
# Build configuration
Build command: npm run build
Publish directory: dist
Node version: 18

# Environment variables (set in Netlify dashboard)
VITE_FIREBASE_APIKEY=production_api_key
VITE_API_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
```

### Build Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🧪 Testing

### Unit Tests
```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run Cypress tests
npm run e2e

# Run Playwright tests
npm run e2e:playwright
```

## 📊 Performance Targets

- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3s
- **Bundle Size:** < 500KB gzipped
- **Lighthouse Score:** > 90

## 🔒 Security Considerations

- **Authentication:** Firebase Auth with secure token handling
- **Input Validation:** All forms validated client and server-side
- **XSS Prevention:** Sanitized markdown rendering
- **CORS:** Proper origin configuration
- **Environment Variables:** Sensitive data in environment variables only

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes following component patterns
3. Add tests for new functionality
4. Ensure accessibility compliance
5. Test on multiple screen sizes
6. Create pull request with detailed description

### Code Style
- **TypeScript:** Strict mode enabled
- **ESLint:** Airbnb configuration with React hooks
- **Prettier:** Automatic code formatting
- **Conventional Commits:** Commit message standards

### Component Guidelines
- Use functional components with hooks
- Implement proper TypeScript typing
- Follow single responsibility principle
- Ensure accessibility (ARIA labels, keyboard navigation)
- Use Tailwind CSS for styling
- Implement error boundaries where appropriate

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🐛 Troubleshooting

### Common Issues

**Build Errors:**
- Ensure all environment variables are set
- Check TypeScript compilation errors
- Verify dependency versions

**Authentication Issues:**
- Verify Firebase configuration
- Check authorized domains in Firebase console
- Ensure proper token handling

**WebSocket Connection Issues:**
- Verify backend WebSocket server is running
- Check CORS configuration
- Test connection in network tab

**Performance Issues:**
- Use React DevTools Profiler
- Check bundle analyzer for large dependencies
- Implement code splitting for large components

---

**Last Updated:** [Current Date]  
**Version:** 1.0.0  
**Contributors:** Development Team