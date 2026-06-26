import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, apiLogout, getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('aldebaran_token');
      if (token) {
        const userData = await getMe();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Erro ao checar autenticação:", error);
      setUser(null);
      localStorage.removeItem('aldebaran_token');
      localStorage.removeItem('aldebaran_refresh_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loginUser = async (username, password) => {
    const data = await apiLogin(username, password);
    localStorage.setItem('aldebaran_token', data.token);
    if (data.refresh_token) {
      localStorage.setItem('aldebaran_refresh_token', data.refresh_token);
    }
    setUser(data.user);
    return data.user;
  };

  const logoutUser = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('aldebaran_token');
      localStorage.removeItem('aldebaran_refresh_token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    loginUser,
    logoutUser,
    isAuthenticated: !!user,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
