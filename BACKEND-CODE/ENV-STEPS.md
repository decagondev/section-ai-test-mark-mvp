# Environment Setup Guide - Deca Test Mark Backend

## Overview
This guide walks you through setting up all the required services and environment variables for the Deca Test Mark backend development environment.

## 🚀 Quick Start Checklist

- [ ] MongoDB Atlas (Database & Authentication)
- [ ] Groq AI (Code Analysis)
- [ ] Environment Variables Setup

---

## 📋 **Step 1: MongoDB Atlas Setup (Required)**

### What you need: `MONGODB_URI`

**Note:** MongoDB will handle both database storage AND user authentication (no Firebase needed!)

1. **Sign up/Login**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create account or login

2. **Create Organization & Project**
   ```
   Organization: "Deca Test Mark"
   Project: "deca-test-mark-dev"
   ```

3. **Create Free Database Cluster**
   - Click **"Build a Database"**
   - Choose **"M0 Sandbox (Free)"**
   - Cloud Provider: **AWS**
   - Region: **Choose closest to your location**
   - Cluster Name: **deca-test-mark**

4. **Create Database User**
   - Go to **"Database Access"** tab
   - Click **"Add New Database User"**
   - Authentication Method: **Password**
   - Username: `decauser`
   - Password: **Generate secure password** → **🔥 SAVE THIS PASSWORD!**
   - Database User Privileges: **"Read and write to any database"**

5. **Configure Network Access**
   - Go to **"Network Access"** tab
   - Click **"Add IP Address"**
   - Access List Entry: **"Allow access from anywhere"** (0.0.0.0/0)
   - Comment: "Development Access"

6. **Get Connection String**
   - Go to **"Clusters"** tab
   - Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Driver: **Node.js**
   - Version: **4.1 or later**
   - Copy the connection string

### Your MongoDB URI Format:
```
mongodb+srv://decauser:YOUR_PASSWORD@deca-test-mark.xxxxx.mongodb.net/deca-test-mark?retryWrites=true&w=majority
```

---

## 🤖 **Step 2: Groq AI Setup (Required)**

### What you need: `GROQ_API_KEY`

1. **Create Groq Account**
   - Go to [console.groq.com](https://console.groq.com)
   - Sign up with your email
   - Verify your email address

2. **Generate API Key**
   - Go to **"API Keys"** section
   - Click **"Create API Key"**
   - Name: **Deca Test Mark Development**
   - Copy the API key → Starts with `gsk_`

### Why Groq?
- **Free tier** with generous limits
- **Fast inference** for code analysis
- **Llama 3 70B model** perfect for educational feedback

---

## 🤖 **Step 2b: OpenAI API Setup (Alternative to Groq, Optional)**

### What you need: `OPENAI_API_KEY`

1. **Create OpenAI Account**
   - Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create a new secret key
   - Add it to your `.env` as `OPENAI_API_KEY=sk-...`

2. **(Optional) Remove or comment out GROQ_API_KEY if not using Groq**

---

## ⚙️ **Step 3: Environment Variables Setup**

1. **Copy Environment Template**
   ```bash
   cp envvars.local .env
   ```

2. **Edit .env File**
   Fill in your actual values:

   ```bash
   # Database (handles both storage and authentication)
   MONGODB_URI=mongodb+srv://decauser:YOUR_ACTUAL_PASSWORD@deca-test-mark.xxxxx.mongodb.net/deca-test-mark?retryWrites=true&w=majority

   # AI Service  
   GROQ_API_KEY=gsk_your_actual_groq_api_key_here

   # Authentication (JWT-based)
   JWT_SECRET=your_super_secure_random_string_here
   JWT_EXPIRES_IN=7d
   ```

3. **Generate JWT Secret**
   ```bash
   # Generate a secure random string
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

---

## 🧪 **Step 4: Test Your Setup**

1. **Build the Backend**
   ```bash
   npm run build
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test Health Endpoints**
   ```bash
   # Basic health check
   curl http://localhost:3001/health

   # Detailed health check
   curl http://localhost:3001/health/detailed

   # Database-specific check
   curl http://localhost:3001/health/database
   ```

### Expected Responses:
- **✅ Healthy:** All services connected
- **❌ Unhealthy:** Check your environment variables

---

## 🔧 **Development Commands**

```bash
# Start backend in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# View logs
npm run dev 2>&1 | tee logs/development.log
```

---

## 🚨 **Troubleshooting**

### Common Issues:

#### **MongoDB Connection Fails**
```bash
# Check your connection string
# Ensure password is URL-encoded (special characters)
# Verify network access allows 0.0.0.0/0
# Test connection in MongoDB Compass
```

#### **Groq API Errors**
```bash
# Verify API key starts with 'gsk_'
# Check rate limits in Groq console
# Test API key with curl:
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"model":"llama3-70b-8192"}'
```

#### **JWT Authentication Issues**
```bash
# Ensure JWT_SECRET is long and secure (64+ characters)
# Check JWT_EXPIRES_IN format (e.g., '7d', '24h', '1y')
# Verify tokens are being sent in Authorization header
```

---

## 🔒 **Security Notes**

1. **Never commit .env files**
2. **Use different credentials for production**
3. **Rotate API keys regularly**
4. **Restrict MongoDB network access in production**
5. **Use strong JWT secrets (64+ characters)**
6. **Hash passwords with bcrypt before storing**

---

## 📚 **What's Next?**

Once your environment is set up and health checks pass:

1. **Phase 1:** Implement grading pipeline
2. **Phase 2:** Add queue system and real-time updates  
3. **Phase 3:** Complete authentication and user management
4. **Phase 4:** Production deployment

---

## 🆘 **Getting Help**

If you encounter issues:

1. **Check logs:** `npm run dev` shows detailed error messages
2. **Verify environment:** Run health checks to identify problems
3. **Test individually:** Test each service separately
4. **Check documentation:** Each service has detailed docs

---

**Status:** ✅ Complete this setup before proceeding to Phase 1 development 

curl -X POST http://localhost:3001/api/submissions/grade -H "Content-Type: application/json" -d '{"githubUrl":"https://github.com/sindresorhus/slugify","projectType":"node","rubric":null}'

curl -X POST http://localhost:3001/api/submissions/grade \
  -H "Content-Type: application/json" \
  -d '{"githubUrl":"https://github.com/sindresorhus/slugify","projectType":"express","rubric":null}'

  curl http://localhost:3001/api/submissions/687e65a988d360d38cb885ee

  curl -X POST http://localhost:3001/api/submissions/grade -H "Content-Type: application/json" -d '{"githubUrl":"https://github.com/sindresorhus/slugify","projectType":"express","rubric":null}'

  curl -X POST http://localhost:3001/api/submissions/grade -H "Content-Type: application/json" -d '{
    "githubUrl":"https://github.com/sindresorhus/slugify",
    "projectType":"express",
    "rubric":null,
    "fileGlobs":["README.md","package.json","index.js","src/**/*.js","routes/**/*.js"]
  }'