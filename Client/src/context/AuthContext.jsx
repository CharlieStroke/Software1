import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Inicializar desde token si existe
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await authApi.verify();
        setUser(data.user);
      } catch (err) {
        console.error('Error verificando token:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Log del usuario cuando cambia (ayuda debugging)
  useEffect(() => {
    console.log('[AuthContext] user changed:', user);
  }, [user]);

  const login = async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data || error.message };
    }
  };

  const register = async (payload) => {
    try {
      const data = await authApi.register(payload);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
      // Continuar con el logout local incluso si falla en el servidor
    }
    localStorage.removeItem('token');
    setUser(null);
    // Usar window.location para asegurar limpieza completa del estado
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
