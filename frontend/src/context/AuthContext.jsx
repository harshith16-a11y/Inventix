import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        })
        .catch(() => {
          // Token invalid
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    setUser(data);
    return data;
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const isAdmin = user && user.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
