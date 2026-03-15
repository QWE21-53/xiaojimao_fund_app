/**
 * 内存数据库（临时方案）
 * 注意：数据不会持久化，仅用于演示
 */

import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface UserFund {
  userId: string;
  fundCode: string;
  addedAt: string;
}

// 内存存储
const users: User[] = [];
const funds: UserFund[] = [];

// 密码哈希
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 用户操作
export const userDB = {
  async create(email: string, password: string, name: string): Promise<User> {
    const existing = users.find(u => u.email === email);
    if (existing) {
      throw new Error('用户已存在');
    }

    const user: User = {
      id: crypto.randomUUID(),
      email,
      password: hashPassword(password),
      name,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    return user;
  },

  async findByEmail(email: string): Promise<User | null> {
    return users.find(u => u.email === email) || null;
  },

  async verify(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    if (user.password === hashPassword(password)) {
      return user;
    }
    return null;
  }
};

// 基金操作
export const fundDB = {
  async add(userId: string, fundCode: string): Promise<UserFund> {
    const existing = funds.find(f => f.userId === userId && f.fundCode === fundCode);
    if (existing) {
      return existing;
    }

    const userFund: UserFund = {
      userId,
      fundCode,
      addedAt: new Date().toISOString()
    };

    funds.push(userFund);
    return userFund;
  },

  async remove(userId: string, fundCode: string): Promise<void> {
    const index = funds.findIndex(f => f.userId === userId && f.fundCode === fundCode);
    if (index !== -1) {
      funds.splice(index, 1);
    }
  },

  async getUserFunds(userId: string): Promise<string[]> {
    return funds
      .filter(f => f.userId === userId)
      .map(f => f.fundCode);
  },

  async clear(userId: string): Promise<void> {
    const filtered = funds.filter(f => f.userId !== userId);
    funds.length = 0;
    funds.push(...filtered);
  }
};
