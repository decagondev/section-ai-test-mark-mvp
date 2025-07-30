# Setup and Deployment Tasks - Deca Test Mark

## Overview
Detailed step-by-step setup instructions prioritizing early deployment and continuous integration.

## Prerequisites Checklist
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git installed and configured
- [ ] GitHub account with repository access
- [ ] VS Code or preferred IDE
- [ ] Terminal/Command Line access

## Phase 1: Account Setup and Service Registration

### 1.1 Create Required Accounts (30 minutes)
```bash
# Required accounts to create:
# 1. Netlify (https://netlify.com) - Frontend deployment
# 2. Render.com (https://render.com) - Backend deployment  
# 3. MongoDB Atlas (https://mongodb.com/atlas) - Database
# 4. Firebase (https://firebase.google.com) - Authentication
# 5. Groq (https://console.groq.com) - AI Services
# 6. Redis Cloud (https://redis.com/redis-enterprise-cloud/) - Queue management
```

### 1.2 MongoDB Atlas Setup (15 minutes)
1. **Create MongoDB Atlas Account**
   - Sign up at https://mongodb.com/atlas
   - Create new organization: "Deca Test Mark"
   - Create new project: "deca-test-mark-prod"

2. **Setup Database Cluster**
   ```bash
   # In MongoDB Atlas Dashboard:
   # 1. Click "Build a Database"
   # 2. Choose "M0 Sandbox" (Free tier)
   # 3. Cloud Provider: AWS
   # 4. Region: Closest to your users
   # 5. Cluster Name: "deca-test-mark"
   ```

3. **Configure Database Access**
   ```bash
   # Database Access Tab:
   # 1. Click "Add New Database User"
   # 2. Username: decauser
   # 3. Password: Generate secure password (save it!)
   # 4. Database User Privileges: Read and write to any database
   
   # Network Access Tab:
   # 1. Click "Add IP Address"
   # 2. Allow access from anywhere: 0.0.0.0/0 (for development)
   # 3. Comment: "Development Access"
   ```

4. **Get Connection String**
   ```bash
   # In Clusters tab:
   # 1. Click "Connect" on your cluster
   # 2. Choose "Connect your application"
   # 3. Driver: Node.js, Version: 4.1 or later
   # 4. Copy connection string (save for later)
   # Format: mongodb+srv://decauser:<password>@deca-test-mark.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 1.3 Firebase Setup (20 minutes)
1. **Create Firebase Project**
   ```bash
   # Go to https://console.firebase.google.com
   # 1. Click "Create a project"
   # 2. Project name: "deca-test-mark"
   # 3. Enable Google Analytics: Yes
   # 4. Analytics account: Create new or use existing
   ```

2. **Configure Authentication**
   ```bash
   # In Firebase Console:
   # 1. Go to Authentication > Sign-in method
   # 2. Enable "Email/Password"
   # 3. Enable "Google" (optional)
   # 4. Set authorized domains (will add Netlify domain later)
   ```

3. **Get Firebase Config**
   ```bash
   # In Project Overview:
   # 1. Click "Add app" > Web app
   # 2. App nickname: "deca-frontend"
   # 3. Enable Firebase Hosting: No (using Netlify)
   # 4. Copy Firebase config object (save for later)
   ```

### 1.4 Groq API Setup (10 minutes)
1. **Create Groq Account**
   - Sign up at https://console.groq.com
   - Verify email address

2. **Generate API Key**
   ```bash
   # In Groq Console:
   # 1. Go to API Keys section
   # 2. Click "Create API Key"
   # 3. Name: "Deca Test Mark Production"
   # 4. Copy API key (save securely - only shown once)
   ```

### 1.5 Redis Cloud Setup (15 minutes)
1. **Create Redis Cloud Account**
   - Sign up at https://redis.com/redis-enterprise-cloud/
   - Choose free tier

2. **Create Database**
   ```bash
   # In Redis Cloud Console:
   # 1. Click "New Database"
   # 2. Choose "Fixed" plan (free)
   # 3. Database name: "deca-queue"
   # 4. Cloud: AWS
   # 5. Region: Same as your main services
   # 6. Copy connection details (endpoint, port, password)
   ```

## Phase 2: Repository Setup and Project Initialization

### 2.1 Create GitHub Repositories (10 minutes)
```bash
# Create two repositories on GitHub:
# 1. deca-test-mark-frontend (Public)
# 2. deca-test-mark-backend (Public)

# Or create organization and repositories:
gh repo create your-org/deca-test-mark-frontend --public
gh repo create your-org/deca-test-mark-backend --public
```

### 2.2 Initialize Frontend Project (20 minutes)
```bash
# Clone and setup frontend
git clone https://github.com/your-username/deca-test-mark-frontend.git
cd deca-test-mark-frontend

# Initialize Vite React TypeScript project
npm create vite@latest . -- --template react-ts
npm install

# Install additional dependencies
npm install -D tailwindcss@next @tailwindcss/typography autoprefixer postcss
npm install firebase socket.io-client axios react-query @tanstack/react-query
npm install lucide-react react-hook-form @hookform/resolvers zod

# Initialize Tailwind CSS
npx tailwindcss init -p

# Create directory structure
mkdir -p src/components/{ui,layout,forms}
mkdir -p src/hooks src/services src/types src/utils src/contexts
mkdir -p src/pages/{auth,dashboard,results}
```

### 2.3 Configure Tailwind CSS (10 minutes)
```typescript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

```css
/* src/index.css */
@tailwindcss base;
@tailwindcss components;
@tailwindcss utilities;

@layer base {
  html {
    @apply h-full;
  }
  body {
    @apply h-full bg-gray-50 text-gray-900;
  }
}
```

### 2.4 Initialize Backend Project (20 minutes)
```bash
# Clone and setup backend
git clone https://github.com/your-username/deca-test-mark-backend.git
cd deca-test-mark-backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors dotenv mongoose
npm install groq-sdk socket.io bull redis
npm install @types/express @types/cors @types/node
npm install -D typescript ts-node nodemon @types/bull

# Initialize TypeScript
npx tsc --init

# Create directory structure
mkdir -p src/{routes,controllers,models,middleware,services,utils,types}
mkdir -p src/services/{ai,queue,github}
```

### 2.5 Configure TypeScript for Backend (10 minutes)
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "removeComments": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

```json
// package.json scripts section
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## Phase 3: Environment Configuration

### 3.1 Frontend Environment Setup (15 minutes)
```bash
# Create environment files in frontend root
touch .env.local .env.example
```

```bash
# .env.local (DO NOT COMMIT)
VITE_FIREBASE_APIKEY=your_firebase_api_key
VITE_FIREBASE_AUTHDOMAIN=deca-test-mark.firebaseapp.com
VITE_FIREBASE_PROJECTID=deca-test-mark
VITE_FIREBASE_STORAGEBUCKET=deca-test-mark.appspot.com
VITE_FIREBASE_MESSAGINGSENDERID=your_messaging_sender_id
VITE_FIREBASE_APPID=your_app_id
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

```bash
# .env.example (safe to commit)
VITE_FIREBASE_APIKEY=your_firebase_api_key_here
VITE_FIREBASE_AUTHDOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECTID=your_project_id
VITE_FIREBASE_STORAGEBUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGINGSENDERID=your_sender_id
VITE_FIREBASE_APPID=your_app_id
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### 3.2 Backend Environment Setup (15 minutes)
```bash
# Create environment files in backend root
touch .env .env.example
```

```bash
# .env (DO NOT COMMIT)
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://decauser:your_password@deca-test-mark.xxxxx.mongodb.net/deca-test-mark?retryWrites=true&w=majority
GROQ_API_KEY=your_groq_api_key_here
REDIS_URL=redis://default:your_redis_password@your_redis_host:your_redis_port
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

```bash
# .env.example (safe to commit)
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
GROQ_API_KEY=your_groq_api_key_here
REDIS_URL=redis://default:password@host:port
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3.3 Git Configuration (10 minutes)
```bash
# Frontend .gitignore
echo "# Dependencies
node_modules/
/.pnp
.pnp.js

# Production
/dist
/build

# Environment
.env.local
.env.production.local
.env.development.local
.env.test.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*" > .gitignore
```

```bash
# Backend .gitignore
echo "# Dependencies
node_modules/

# Production
/dist
/build

# Environment
.env
.env.local
.env.production
.env.test

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temporary files
/tmp
/temp
*.tmp

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Runtime data
pids
*.pid
*.seed
*.pid.lock" > .gitignore
```

## Phase 4: Deployment Setup

### 4.1 Netlify Frontend Deployment (25 minutes)
1. **Connect Repository to Netlify**
   ```bash
   # In Netlify Dashboard:
   # 1. Click "New site from Git"
   # 2. Choose GitHub
   # 3. Select your frontend repository
   # 4. Branch: main
   # 5. Build command: npm run build
   # 6. Publish directory: dist
   ```

2. **Configure Build Settings**
   ```bash
   # Create netlify.toml in frontend root
   touch netlify.toml
   ```

   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [context.production.environment]
     VITE_API_URL = "https://your-backend-url.onrender.com"
     VITE_SOCKET_URL = "https://your-backend-url.onrender.com"
   ```

3. **Set Environment Variables in Netlify**
   ```bash
   # In Netlify Dashboard > Site Settings > Environment Variables:
   # Add all VITE_ variables from your .env.local
   # Update VITE_API_URL to your Render backend URL (get this after backend deployment)
   ```

### 4.2 Render Backend Deployment (25 minutes)
1. **Connect Repository to Render**
   ```bash
   # In Render Dashboard:
   # 1. Click "New +" > "Web Service"
   # 2. Connect GitHub repository (backend)
   # 3. Name: deca-test-mark-backend
   # 4. Branch: main
   # 5. Runtime: Node
   # 6. Build Command: npm install && npm run build
   # 7. Start Command: npm start
   ```

2. **Configure Render Service**
   ```bash
   # Create render.yaml in backend root (optional but recommended)
   touch render.yaml
   ```

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

3. **Set Environment Variables in Render**
   ```bash
   # In Render Dashboard > Service > Environment:
   # Add all variables from your backend .env file
   # Update FRONTEND_URL to your Netlify URL
   # Update ALLOWED_ORIGINS to include your Netlify URL
   ```

4. **Create Render Dockerfile (Optional)**
   ```dockerfile
   # Dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 10000

   CMD ["npm", "start"]
   ```

### 4.3 Update Firebase Configuration (10 minutes)
```bash
# In Firebase Console > Authentication > Settings:
# Add authorized domains:
# 1. your-netlify-site.netlify.app
# 2. your-custom-domain.com (if using custom domain)

# In Firebase Console > Project Settings > General:
# Add web app domain to authorized domains list
```

## Phase 5: Initial Code Implementation

### 5.1 Basic Backend Server (30 minutes)
```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 5.2 Basic Frontend App (30 minutes)
```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, Auth, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

## Phase 6: Deployment Verification

### 6.1 Deploy Initial Version (20 minutes)
```bash
# Frontend deployment
cd deca-test-mark-frontend
git add .
git commit -m "Initial frontend setup with Firebase auth"
git push origin main
# This triggers automatic Netlify deployment

# Backend deployment
cd ../deca-test-mark-backend
git add .
git commit -m "Initial backend setup with MongoDB connection"
git push origin main
# This triggers automatic Render deployment
```

### 6.2 Verify Deployments (15 minutes)
1. **Check Frontend Deployment**
   ```bash
   # Visit your Netlify URL
   # Should see React app loading
   # Check browser console for any errors
   # Verify Firebase auth is initialized
   ```

2. **Check Backend Deployment**
   ```bash
   # Visit your Render URL/health
   # Should return: {"status":"OK","timestamp":"..."}
   # Check Render logs for any errors
   # Verify MongoDB connection in logs
   ```

3. **Test Cross-Origin Communication**
   ```bash
   # In browser console on frontend site:
   fetch('https://your-backend-url.onrender.com/api/test')
     .then(res => res.json())
     .then(data => console.log(data));
   # Should return: {"message":"Backend is running!"}
   ```

### 6.3 Update Environment Variables (10 minutes)
```bash
# Update Netlify environment variables:
# VITE_API_URL = https://your-backend-url.onrender.com
# VITE_SOCKET_URL = https://your-backend-url.onrender.com

# Update Render environment variables:
# FRONTEND_URL = https://your-netlify-url.netlify.app
# ALLOWED_ORIGINS = https://your-netlify-url.netlify.app

# Redeploy both services after environment updates
```

## Phase 7: Domain Configuration (Optional)

### 7.1 Custom Domain Setup (20 minutes)
```bash
# If using custom domains:

# For Netlify (Frontend):
# 1. Domain Settings > Add custom domain
# 2. Follow DNS configuration instructions
# 3. Enable HTTPS (automatic with Netlify)

# For Render (Backend):
# 1. Settings > Custom Domains
# 2. Add your API subdomain (api.yourdomain.com)
# 3. Configure DNS CNAME record

# Update Firebase authorized domains
# Update all environment variables with new domains
```

## Troubleshooting Common Issues

### MongoDB Connection Issues
```bash
# Check connection string format
# Verify IP whitelist includes 0.0.0.0/0
# Ensure username/password are URL encoded
# Test connection string locally first
```

### CORS Issues
```bash
# Verify ALLOWED_ORIGINS environment variable
# Check that frontend URL is exactly matching
# Include both http and https versions if needed
# Test in browser network tab for preflight requests
```

### Firebase Auth Issues
```bash
# Verify all Firebase config variables are set
# Check authorized domains in Firebase console
# Ensure API keys are properly configured
# Test authentication in development first
```

### Deployment Issues
```bash
# Check build logs in Netlify/Render dashboards
# Verify all environment variables are set
# Ensure build commands are correct
# Check Node.js version compatibility
```

## Next Steps
After completing this setup:
1. Verify all services are communicating properly
2. Test authentication flow end-to-end
3. Proceed to core feature development
4. Set up monitoring and alerting
5. Configure automated backups

## Security Checklist
- [ ] All sensitive data in environment variables
- [ ] Database user has minimal required permissions
- [ ] CORS properly configured
- [ ] Firebase security rules configured
- [ ] API rate limiting implemented (future)
- [ ] Input validation on all endpoints (future)

## Monitoring Setup
- [ ] Render service monitoring enabled
- [ ] MongoDB Atlas monitoring configured
- [ ] Firebase usage monitoring set up
- [ ] Error tracking implemented (future)
- [ ] Performance monitoring configured (future)

This completes the foundational setup. The system should now be deployed and ready for core feature development.
