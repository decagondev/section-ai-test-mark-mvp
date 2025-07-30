import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { Results } from './components/results/Results';
import { NavBar } from './components/layout/NavBar';
import { Profile } from './components/profile/Profile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { InstructorDashboard } from './components/instructor/InstructorDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container mx-auto p-4">{children}</main>
      <footer className="bg-gray-100 text-center p-2 text-xs text-gray-500">&copy; {new Date().getFullYear()} Deca Test Mark</footer>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-4xl rounded-lg overflow-hidden shadow-lg mb-8">
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"
          alt="Hero"
          className="w-full h-64 object-cover"
        />
      </div>
      <h1 className="text-4xl font-extrabold text-center mb-4 text-blue-800">Deca Test Mark</h1>
      <p className="text-lg text-center mb-6 text-gray-700 max-w-2xl">
        The AI-powered auto-grading platform for modern coding education. Instantly grade, review, and get actionable feedback on your students' or your own code projects. Save time, improve quality, and empower learning.
      </p>
      <div>
        {user ? (
          <a
            href={user.role === 'admin' ? '/admin' : '/dashboard'}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow hover:bg-blue-800 transition"
          >
            Go to Dashboard
          </a>
        ) : (
          <a
            href="/signup"
            className="bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow hover:bg-blue-800 transition"
          >
            Get Started Free
          </a>
        )}
      </div>
    </div>
  );
}
function Login() {
  return <LoginForm />;
}
function Signup() {
  return <SignUpForm />;
}

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/results/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
              <Route path="/instructor" element={<ProtectedRoute><InstructorDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  );
}