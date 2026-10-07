import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    let res;
    try {
      res = await authApi.login({ email, password });
    } catch (err) {
      // The API now answers 401 for bad credentials; pass its message to the form.
      return { success: false, message: err.response?.data?.message || 'Unable to sign in' };
    }
    if (res.data.success) {
      const data = res.data.data;
      setToken(data.token);
      setUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (userData) => {
    let res;
    try {
      res = await authApi.register(userData);
    } catch (err) {
      // The API now answers 400/409 (e.g. email already registered); pass its message to the form.
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
    if (res.data.success) {
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
