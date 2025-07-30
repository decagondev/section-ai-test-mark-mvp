# Deca Test Mark
## AI-Powered Auto-Grading System for Educational Institutions

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

---

## 🎯 Project Overview

Deca Test Mark is a revolutionary AI-powered auto-grading system designed to transform how educational institutions evaluate Express.js and Vite React projects. By combining automated test execution (80% weight) with AI-driven code quality analysis (20% weight), it provides comprehensive, consistent grading and detailed educational feedback in under 60 seconds.

### 🚀 Key Value Propositions

- **85% time savings** for instructors - Reduce grading time from hours to minutes
- **Immediate feedback** for students - 60-second processing vs weeks of waiting
- **Consistent grading** - Eliminate subjective bias and human error
- **Educational insights** - Detailed AI-generated reports with improvement suggestions
- **Scalable solution** - Support 3x larger cohorts without additional resources

### 🎓 Perfect For

- **Coding Bootcamps** - Accelerate student feedback cycles
- **Universities** - Scale CS education programs efficiently  
- **Online Learning Platforms** - Automate project assessment
- **Corporate Training** - Standardize technical skill evaluation

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Deca Test Mark System                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │   Frontend      │    │   Backend       │    │ AI Service  │  │
│  │   (React)       │◄──►│   (Express.js)  │◄──►│ (Groq SDK)  │  │
│  │                 │    │                 │    │             │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│           │                       │                       │     │
│           │                       │                       │     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │   Firebase      │    │   MongoDB       │    │ Redis Queue │  │
│  │   (Auth)        │    │   (Database)    │    │ (Processing)│  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 🛠 Technology Stack

**Frontend:**
- Vite + React 18 + TypeScript
- Tailwind CSS 4 + Responsive Design
- Firebase Auth + Socket.io Client
- React Query + React Hook Form

**Backend:**
- Express.js + TypeScript + MongoDB
- Groq SDK + Redis Queue + Bull
- Socket.io + Firebase Admin SDK
- Docker + Render.com Deployment

**AI & Services:**
- Groq AI for code quality analysis
- GitHub API for repository processing
- Real-time WebSocket communication
- Automated CI/CD pipelines

---

## 📁 Project Structure

```
deca-test-mark/
├── documents/                 # 📋 Complete project documentation
│   ├── README.md             # Documentation index and navigation
│   ├── PRD.md                # Product requirements and specifications  
│   ├── SETUP-TASKS.md        # Step-by-step setup instructions
│   ├── TASKLIST.md           # Master development timeline
│   ├── BE-TASKS.md           # Backend development guide
│   └── FE-TASKS.md           # Frontend development guide
├── FRONTEND-CODE/            # ⚛️ React frontend application
│   └── README.md             # Frontend setup and development guide
├── BACKEND-CODE/             # 🖥️ Express.js backend API
│   └── README.md             # Backend setup and development guide
└── README.md                 # 👆 You are here - Project overview
```

---

## 🚦 Quick Start Guide

### For Contributors & Developers

#### 1. 📖 Read the Documentation First
```bash
# Start with the documentation index
open documents/README.md
```
**Essential Reading:**
- **New to the project?** → [`documents/README.md`](./documents/README.md) - Complete documentation index
- **Want to understand the product?** → [`documents/PRD.md`](./documents/PRD.md) - Product requirements
- **Ready to set up?** → [`documents/SETUP-TASKS.md`](./documents/SETUP-TASKS.md) - Setup instructions

#### 2. 🔧 Environment Setup
```bash
# Prerequisites
- Node.js 18+
- Git
- VS Code (recommended)

# Clone the repository
git clone https://github.com/your-org/deca-test-mark.git
cd deca-test-mark

# Follow setup instructions
open documents/SETUP-TASKS.md
```

#### 3. 🏃‍♂️ Choose Your Path

**Backend Developers:**
```bash
cd BACKEND-CODE
open README.md  # Complete backend setup guide
```

**Frontend Developers:**
```bash
cd FRONTEND-CODE  
open README.md  # Complete frontend setup guide
```

**Full-Stack Developers:**
- Start with [`documents/SETUP-TASKS.md`](./documents/SETUP-TASKS.md) for complete environment setup
- Then follow both backend and frontend guides

---

## 📚 Documentation Hub

### 🎯 **Start Here - Essential Documents**

| Document | Purpose | Audience | Est. Read Time |
|----------|---------|----------|----------------|
| **[📋 Documentation Index](./documents/README.md)** | Navigation hub for all documentation | Everyone | 5 min |
| **[📄 Product Requirements (PRD)](./documents/PRD.md)** | Complete product specification and business requirements | PMs, Stakeholders, Developers | 15 min |
| **[⚙️ Setup Tasks](./documents/SETUP-TASKS.md)** | Step-by-step environment and deployment setup | New developers | 20 min |

### 🚀 **Development Guides**

| Document | Purpose | Audience | Est. Time |
|----------|---------|----------|-----------|
| **[📋 Master Task List](./documents/TASKLIST.md)** | Complete project roadmap and timeline | Project managers, developers | 10 min |
| **[🖥️ Backend Tasks](./documents/BE-TASKS.md)** | Detailed backend implementation guide | Backend developers | 25 min |
| **[⚛️ Frontend Tasks](./documents/FE-TASKS.md)** | Detailed frontend implementation guide | Frontend developers | 25 min |

### 💻 **Code Documentation**

| Location | Purpose | Key Information |
|----------|---------|-----------------|
| **[🖥️ Backend README](./BACKEND-CODE/README.md)** | Backend API setup and development | Express.js, MongoDB, Groq AI integration |
| **[⚛️ Frontend README](./FRONTEND-CODE/README.md)** | Frontend app setup and development | React, TypeScript, Firebase Auth |

---

## 🏁 Development Timeline

### Phase 1: Foundation & MVP (Week 1) - 25 hours
- **Backend:** Server setup, grading pipeline, basic API (11 hours)
- **Frontend:** Auth components, forms, basic UI (14 hours)
- **Deliverable:** Working submission and grading flow

### Phase 2: Core Features (Week 2) - 16 hours  
- **Backend:** AI integration, queue system, real-time updates (8 hours)
- **Frontend:** WebSocket integration, dashboards (8 hours)
- **Deliverable:** Real-time processing with comprehensive feedback

### Phase 3: Production Ready (Week 3) - 16 hours
- **Backend:** Error handling, testing, security (8 hours)  
- **Frontend:** Polish, accessibility, performance (8 hours)
- **Deliverable:** Production-ready system with full testing

**Total Development Time:** ~57 hours over 3 weeks

---

## 🤝 Contributing Guidelines

### 🆕 **New Contributors**

1. **Setup Development Environment**
   ```bash
   # Follow the complete setup guide
   open documents/SETUP-TASKS.md
   ```

2. **Understand the Architecture**
   ```bash
   # Read the product requirements
   open documents/PRD.md
   ```

3. **Choose Your Contribution Area**
   - **Documentation:** Help improve guides and setup instructions
   - **Backend Development:** Express.js API, AI integration, database design
   - **Frontend Development:** React components, UI/UX, real-time features
   - **DevOps:** Deployment, monitoring, performance optimization

### 🔄 **Development Workflow**

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow Code Standards**
   - **TypeScript:** Strict mode enabled
   - **ESLint:** Airbnb configuration  
   - **Prettier:** Automatic formatting
   - **Conventional Commits:** Structured commit messages

3. **Testing Requirements**
   - **Unit Tests:** >80% coverage required
   - **Integration Tests:** All API endpoints
   - **E2E Tests:** Critical user flows

4. **Pull Request Process**
   - Ensure all tests pass
   - Update relevant documentation
   - Request review from code owners
   - Squash commits before merge

### 📋 **Contribution Areas**

**High Impact Contributions:**
- 🐛 **Bug Fixes** - Help improve system reliability
- 📚 **Documentation** - Make the project more accessible
- 🎨 **UI/UX Improvements** - Enhance user experience
- ⚡ **Performance Optimization** - Improve processing speed
- 🔒 **Security Enhancements** - Strengthen system security

**Feature Development:**
- 🤖 **AI Prompts** - Improve code analysis quality
- 📊 **Analytics Dashboard** - Better instructor insights  
- 🔌 **LMS Integration** - Connect with learning platforms
- 📱 **Mobile Optimization** - Improve mobile experience

---

## 🎯 Success Metrics

- **Processing Time:** < 60 seconds per submission
- **Instructor Time Savings:** 85% reduction
- **System Uptime:** 99.5% availability  
- **Grading Accuracy:** 95% consistency with manual grading
- **Student Satisfaction:** > 4.0/5.0 rating

---

## 🚀 Deployment & Infrastructure

### Production Environments
- **Frontend:** Netlify (CDN + Auto-deploy)
- **Backend:** Render.com (Docker + Auto-scaling)
- **Database:** MongoDB Atlas (Cloud)
- **Queue:** Redis Cloud (Managed)
- **AI Service:** Groq API (Serverless)

### Monitoring & Analytics
- Health checks and uptime monitoring
- Performance metrics and alerting
- Error tracking and logging
- Usage analytics and insights

---

## 📞 Support & Community

### Getting Help
- **Documentation Issues:** Create an issue with `documentation` label
- **Setup Problems:** Check [`documents/SETUP-TASKS.md`](./documents/SETUP-TASKS.md) troubleshooting section
- **Development Questions:** Create an issue with `question` label
- **Bug Reports:** Use the bug report template

### Communication
- **GitHub Issues:** Primary communication channel
- **Discussions:** Feature requests and general discussions
- **Pull Requests:** Code review and collaboration

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq AI** for providing advanced language models
- **Firebase** for authentication and real-time services
- **MongoDB Atlas** for reliable database hosting
- **Open Source Community** for the amazing tools and libraries

---

<div align="center">

**Ready to revolutionize education technology?** 🚀

[📋 Read the Docs](./documents/README.md) • [🖥️ Backend Setup](./BACKEND-CODE/README.md) • [⚛️ Frontend Setup](./FRONTEND-CODE/README.md) • [⚙️ Full Setup Guide](./documents/SETUP-TASKS.md)

**Built with ❤️ for educators and students worldwide**

</div>