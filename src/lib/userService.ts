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
  static getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  static saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  static getAdmin(): AdminUser {
    if (typeof window === 'undefined') return defaultAdmin;
    const admin = localStorage.getItem(ADMIN_KEY);
    return admin ? JSON.parse(admin) : defaultAdmin;
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  static generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  static async authenticateUser(username: string, password: string): Promise<User | AdminUser | null> {
    // Check admin first
    const admin = this.getAdmin();
    if (admin.username === username && admin.password === password) {
      return admin;
    }

    // Check users
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password && u.isActive);
    return user || null;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    
    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return true;
  }

  static async deleteUser(userId: string): Promise<boolean> {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    this.saveUsers(filteredUsers);
    return true;
  }
}