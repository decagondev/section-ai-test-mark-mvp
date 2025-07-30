import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface UserProfile {
  name: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  profile: UserProfile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  token: string | null;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      setToken(storedToken);
      apiService.setToken(storedToken);
      apiService.getMe().then((u) => {
        setUser({
          id: u.id,
          email: u.email,
          role: u.role,
          profile: u.profile || { name: '' },
        });
      }).catch(() => setUser(null)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { token, user: u } = await apiService.login(email, password);
    setToken(token);
    setUser({
      id: u.id,
      email: u.email,
      role: u.role,
      profile: u.profile || { name: '' },
    });
    localStorage.setItem('jwt', token);
    apiService.setToken(token);
    setLoading(false);
  };

  const signup = async (email: string, password: string, name?: string) => {
    setLoading(true);
    const { token, user: u } = await apiService.signup(email, password, name);
    setToken(token);
    setUser({
      id: u.id,
      email: u.email,
      role: u.role,
      profile: u.profile || { name: '' },
    });
    localStorage.setItem('jwt', token);
    apiService.setToken(token);
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwt');
    apiService.setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, token, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}; 