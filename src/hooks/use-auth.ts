import { useState, useEffect } from 'react';
import { authService, User } from '@/lib/auth';
import { UserRole } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = (role: UserRole) => {
    const newUser = authService.login(role);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    const newUser = authService.switchRole(role);
    setUser(newUser);
    return newUser;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
  };
}