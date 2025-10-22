import { User, AdminUser } from './userTypes';

// Local storage fallback for client-side
const USERS_KEY = 'shopwave_users';
const ADMIN_KEY = 'shopwave_admin';

// Default admin
const defaultAdmin: AdminUser = {
  id: 'admin_1',
  username: 'admin',
  password: 'admin123',
  role: 'admin'
};

export class UserService {
  static async getUsers(): Promise<User[]> {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('UserService.getUsers error:', error);
      return [];
    }
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<{ user: User; password: string }> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create user');
      }
      
      return data;
    } catch (error) {
      console.error('UserService.createUser error:', error);
      throw error;
    }
  }

  static generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ...updates })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}