import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link to="/" className="font-bold text-lg">Deca Test Mark</Link>
        {user && (
          <Link
            to={user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/dashboard'}
            className="underline text-sm"
          >
            Dashboard
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {user && (
          <>
            <span className="text-sm">{user.email}</span>
            <Link to="/profile" className="underline text-sm">Profile</Link>
            <button onClick={handleLogout} className="bg-white text-blue-700 px-3 py-1 rounded font-semibold hover:bg-gray-100 text-sm">Logout</button>
          </>
        )}
        {!user && (
          <>
            <Link to="/login" className="underline text-sm">Login</Link>
            <Link to="/signup" className="underline text-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}; 