'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { authService } from '../lib/auth';
import { User } from '../types/user.types'; // 👈 tu tipo real

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(() => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error leyendo usuario actual:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    // Si cambia el localStorage (otra pestaña, u otro componente que loguea/desloguea)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'user' || e.key === null) {
        loadUser();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, [loadUser]);

  const logout = useCallback(() => {
    setUser(null);
    authService.logout(); // ya hace window.location.href = '/login'
  }, []);

  const refreshUser = useCallback(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}