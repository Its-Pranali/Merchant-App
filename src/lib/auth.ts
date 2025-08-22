import { UserRole } from './types';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const STORAGE_KEY = 'merchant-app-user';

export const authService = {
  getCurrentUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  login(role: UserRole): User {
    const user: User = {
      id: `user_${role.toLowerCase()}`,
      name: `${role.charAt(0)}${role.slice(1).toLowerCase()} User`,
      email: `${role.toLowerCase()}@merchantapp.com`,
      role,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY);
  },

  switchRole(role: UserRole): User {
    return this.login(role);
  },
};