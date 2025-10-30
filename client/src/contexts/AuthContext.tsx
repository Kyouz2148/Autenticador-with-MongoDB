import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configurar axios com interceptors
axios.defaults.baseURL = API_BASE_URL;

// Interceptor para incluir token em todas as requisições
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas de erro
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await axios.get('/auth/verify');
          setUser(response.data.user);
        } catch (error) {
          console.error('Erro ao verificar token:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      setUser(user);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Erro ao fazer login'
      );
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post('/auth/register', {
        username,
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      setUser(user);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Erro ao registrar usuário'
      );
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}