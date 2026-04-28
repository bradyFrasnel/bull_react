import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';
import { User, UserRole, AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (error) {
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (nom: string, password: string, role: UserRole) => {
    try {
      await authService.login(nom, password, role);
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      authService.logout();
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: authService.isAuthenticated(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
