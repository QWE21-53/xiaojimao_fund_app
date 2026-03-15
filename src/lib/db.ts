/**
 * 数据库模块 - 支持 MongoDB 和内存存储
 * 优先使用 MongoDB，如果未配置则使用内存存储
 */

import crypto from 'crypto';
import { connectToDatabase } from './mongodb';

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

// 内存存储（备用方案）
const memoryUsers: User[] = [];
const memoryFunds: UserFund[] = [];

// 检查是否配置了 MongoDB
const USE_MONGODB = !!process.env.MONGODB_URI;

// 密码哈希
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 用户操作
export const userDB = {
  async create(email: string, password: string, name: string): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email,
      password: hashPassword(password),
      name,
      createdAt: new Date().toISOString()
    };

    if (USE_MONGODB) {
      try {
        const { db } = await connectToDatabase();
        const existing = await db.collection('users').findOne({ email });
        if (existing) {
          throw new Error('用户已存在');
        }
        await db.collection('users').insertOne(user);
        return user;
      } catch (error: any) {
        if (error.message === '用户已存在') throw error;
        console.error('MongoDB error, falling back to memory:', error);
      }
    }

    // 内存存储备用
    const existing = memoryUsers.find(u => u.email === email);
    if (existing) {
      throw new Error('用户已存在');
    }
    memoryUsers.push(user);
    return user;
  },

  async findByEmail(email: string): Promise<User | null> {
    if (USE_MONGODB) {
      try {
        const { db } = await connectToDatabase();
        const user = await db.collection('users').findOne({ email });
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          createdAt: user.createdAt
        };
      } catch (error) {
        console.error('MongoDB error, falling back to memory:', error);
      }
    }

    return memoryUsers.find(u => u.email === email) || null;
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
    const userFund: UserFund = {
      userId,
      fundCode,
      addedAt: new Date().toISOString()
    };

    if (USE_MONGODB) {
      try {
        const { db } = await connectToDatabase();
        const existing = await db.collection('funds').findOne({ userId, fundCode });
        if (existing) {
          return {
            userId: existing.userId,
            fundCode: existing.fundCode,
            addedAt: existing.addedAt
          };
        }
        await db.collection('funds').insertOne(userFund);
        return userFund;
      } catch (error) {
        console.error('MongoDB error, falling back to memory:', error);
      }
    }

    // 内存存储备用
    const existing = memoryFunds.find(f => f.userId === userId && f.fundCode === fundCode);
    if (existing) {
      return existing;
    }
    memoryFunds.push(userFund);
    return userFund;
  },

  async remove(userId: string, fundCode: string): Promise<void> {
    if (USE_MONGODB) {
      try {
        const { db } = await connectToDatabase();
        await db.collection('funds').deleteOne({ userId, fundCode });
        return;
      } catch (error) {
        console.error('MongoDB error, falling back to memory:', error);
      }
    }

    // 内存存储备用
    const index = memoryFunds.findIndex(f => f.userId === userId && f.fundCode === fundCode);
    if (index !== -1) {
      memoryFunds.splice(index, 1);
    }
  },

  async getUserFunds(userId: string): Promise<string[]> {
    if (USE_MONGODB) {
      try {
        const { db } = await connectToDatabase();
        const funds = await db.collection('funds').find({ userId }).toArray();
        return funds.map(f => f.fundCode);
      } catch (error) {
        console.error('MongoDB error, falling back to memory:', error);
      }
    }

    // 内存存储备用
    return memoryFunds
      .filter(f => f.userId === userId)
      .map(f => f.fundCode);
  },

  async clear(userId: string): Promise<void> {
    if (USE_MONGODB) {
      try {
        const { db } = await connectToDatabase();
        await db.collection('funds').deleteMany({ userId });
        return;
      } catch (error) {
        console.error('MongoDB error, falling back to memory:', error);
      }
    }

    // 内存存储备用
    const filtered = memoryFunds.filter(f => f.userId !== userId);
    memoryFunds.length = 0;
    memoryFunds.push(...filtered);
  }
};
