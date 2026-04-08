import { useState, useCallback } from 'react';

const STORAGE_KEY = 'nyanneko_admin_auth';
export function useAdminAuth(): {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
} {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true'
  );

  const login = useCallback((password: string): boolean => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD ?? '';
    if (adminPassword === '' || password !== adminPassword) {
      return false;
    }
    setIsAuthenticated(true);
    sessionStorage.setItem(STORAGE_KEY, 'true');
    return true;
  }, []);

  const logout = useCallback((): void => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return { isAuthenticated, login, logout };
}
