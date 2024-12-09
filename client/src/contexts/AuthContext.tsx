// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, mfaToken?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface User {
  userId: number;
  roleId: number;
  role: string;
}

interface JWTTokenPayload {
  userId: number;
  roleId: number;
  role: string;
  exp: number;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string, mfaToken?: string) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password,
        mfaToken,
      });

      const { token } = response.data;
      localStorage.setItem('token', token);

      const decoded: JWTTokenPayload = jwtDecode(token);
      setUser({
        userId: decoded.userId,
        roleId: decoded.roleId,
        role: decoded.role,
      });

      // Redirect based on role
      if (decoded.role === 'PlatformAdmin') {
        navigate('/dashboard/platform-admin-dashboard');
      } else if (decoded.role === 'UniversityAdmin') {
        navigate('/dashboard');
      } else if (decoded.role === 'Student') {
        navigate('/dashboard/student');
      } else {
        navigate('/dashboard'); // Default redirect
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: JWTTokenPayload = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Token expired
          logout();
        } else {
          setUser({
            userId: decoded.userId,
            roleId: decoded.roleId,
            role: decoded.role,
          });
        }
      } catch (error) {
        // Invalid token
        logout();
      }
    }
  };

  useEffect(() => {
    checkAuth();
    // Optionally, set up an interval to check token expiry
    // const interval = setInterval(checkAuth, 60000); // every 1 minute
    // return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
