/**
 * 简单的 JSON 文件数据库
 * 用于存储用户和自选基金
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DB_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const FUNDS_FILE = path.join(DB_DIR, 'funds.json');

export interface User {
  id: string;
  email: string;
  password: string; // 哈希后的密码
  name: string;
  createdAt: string;
}

export interface UserFund {
  userId: string;
  fundCode: string;
  addedAt: string;
}

// 初始化数据库
async function initDB() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
    }
    
    try {
      await fs.access(FUNDS_FILE);
    } catch {
      await fs.writeFile(FUNDS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('初始化数据库失败:', error);
  }
}

// 读取数据
async function readData<T>(file: string): Promise<T[]> {
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 写入数据
async function writeData<T>(file: string, data: T[]): Promise<void> {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// 密码哈希
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 用户操作
export const userDB = {
  async create(email: string, password: string, name: string): Promise<User> {
    await initDB();
    const users = await readData<User>(USERS_FILE);
    
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
    await writeData(USERS_FILE, users);
    return user;
  },

  async findByEmail(email: string): Promise<User | null> {
    await initDB();
    const users = await readData<User>(USERS_FILE);
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
    await initDB();
    const funds = await readData<UserFund>(FUNDS_FILE);
    
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
    await writeData(FUNDS_FILE, funds);
    return userFund;
  },

  async remove(userId: string, fundCode: string): Promise<void> {
    await initDB();
    const funds = await readData<UserFund>(FUNDS_FILE);
    const filtered = funds.filter(f => !(f.userId === userId && f.fundCode === fundCode));
    await writeData(FUNDS_FILE, filtered);
  },

  async getUserFunds(userId: string): Promise<string[]> {
    await initDB();
    const funds = await readData<UserFund>(FUNDS_FILE);
    return funds
      .filter(f => f.userId === userId)
      .map(f => f.fundCode);
  },

  async clear(userId: string): Promise<void> {
    await initDB();
    const funds = await readData<UserFund>(FUNDS_FILE);
    const filtered = funds.filter(f => f.userId !== userId);
    await writeData(FUNDS_FILE, filtered);
  }
};
