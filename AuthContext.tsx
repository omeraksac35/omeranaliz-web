import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { checkCredentials } from './auth';

const STORAGE_KEY = 'omeranaliz:auth-session';

interface AuthContextValue {
  isAuthenticated: boolean;
  isChecking: boolean;
  login: (userId: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'true') setIsAuthenticated(true);
      })
      .finally(() => setIsChecking(false));
  }, []);

  function login(userId: string, password: string): boolean {
    const ok = checkCredentials(userId, password);
    if (ok) {
      setIsAuthenticated(true);
      AsyncStorage.setItem(STORAGE_KEY, 'true');
    }
    return ok;
  }

  function logout() {
    setIsAuthenticated(false);
    AsyncStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isChecking, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
