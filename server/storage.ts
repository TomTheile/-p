import {
  users,
  scripts,
  securityLogs,
  executionLogs,
  type User,
  type InsertUser,
  type Script,
  type InsertScript,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByStringId(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByRobloxId(robloxUserId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  verifyUser(id: number): Promise<void>;
  
  // Script operations
  saveScript(script: InsertScript): Promise<Script>;
  getScript(id: number): Promise<Script | undefined>;
  getUserScripts(userId: number): Promise<Script[]>;
  deleteScript(id: number, userId: number): Promise<boolean>;
  
  // Security operations
  logSecurityEvent(event: any): Promise<void>;
  logExecution(execution: any): Promise<void>;
  getUserExecutionCount(userId: number, timeframe: Date): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Database error in getUser:', error);
      return undefined;
    }
  }
  
  async getUserByStringId(id: string): Promise<User | undefined> {
    // For compatibility with string IDs, try to convert to number
    const numId = parseInt(id);
    if (isNaN(numId)) return undefined;
    return this.getUser(numId);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error('Database error in getUserByUsername:', error);
      return undefined;
    }
  }
  
  async getUserByRobloxId(robloxUserId: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.robloxUserId, robloxUserId));
      return user || undefined;
    } catch (error) {
      console.error('Database error in getUserByRobloxId:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Hash password if provided
      const userData = { ...insertUser };
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 12);
      }
      
      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      return user;
    } catch (error) {
      console.error('Database error in createUser:', error);
      throw new Error('Failed to create user');
    }
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    try {
      const [user] = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Database error in updateUser:', error);
      throw new Error('Failed to update user');
    }
  }
  
  async verifyUser(id: number): Promise<void> {
    try {
      await db
        .update(users)
        .set({ isVerified: true, updatedAt: new Date() })
        .where(eq(users.id, id));
    } catch (error) {
      console.error('Database error in verifyUser:', error);
      throw new Error('Failed to verify user');
    }
  }
  
  // Script operations
  async saveScript(script: InsertScript): Promise<Script> {
    try {
      const [savedScript] = await db
        .insert(scripts)
        .values(script)
        .returning();
      return savedScript;
    } catch (error) {
      console.error('Database error in saveScript:', error);
      throw new Error('Failed to save script');
    }
  }
  
  async getScript(id: number): Promise<Script | undefined> {
    try {
      const [script] = await db.select().from(scripts).where(eq(scripts.id, id));
      return script || undefined;
    } catch (error) {
      console.error('Database error in getScript:', error);
      return undefined;
    }
  }
  
  async getUserScripts(userId: number): Promise<Script[]> {
    try {
      return await db
        .select()
        .from(scripts)
        .where(eq(scripts.userId, userId))
        .orderBy(desc(scripts.updatedAt));
    } catch (error) {
      console.error('Database error in getUserScripts:', error);
      return [];
    }
  }
  
  async deleteScript(id: number, userId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(scripts)
        .where(and(eq(scripts.id, id), eq(scripts.userId, userId)));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteScript:', error);
      return false;
    }
  }
  
  // Security operations
  async logSecurityEvent(event: {
    userId?: number;
    action: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await db.insert(securityLogs).values(event);
    } catch (error) {
      console.error('Database error in logSecurityEvent:', error);
    }
  }
  
  async logExecution(execution: {
    userId?: number;
    scriptId?: number;
    gameId?: string;
    executionTime?: number;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await db.insert(executionLogs).values(execution);
    } catch (error) {
      console.error('Database error in logExecution:', error);
    }
  }
  
  async getUserExecutionCount(userId: number, timeframe: Date): Promise<number> {
    try {
      const result = await db
        .select()
        .from(executionLogs)
        .where(
          and(
            eq(executionLogs.userId, userId),
            gte(executionLogs.timestamp, timeframe)
          )
        );
      return result.length;
    } catch (error) {
      console.error('Database error in getUserExecutionCount:', error);
      return 0;
    }
  }
}

// Fallback memory storage for development
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userScripts: Script[] = [];
  private nextUserId = 1;
  private nextScriptId = 1;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: number): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.id === id);
  }
  
  async getUserByStringId(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByRobloxId(robloxUserId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.robloxUserId === robloxUserId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const stringId = randomUUID();
    const user: User = { 
      ...insertUser,
      id,
      password: insertUser.password ? await bcrypt.hash(insertUser.password, 12) : undefined,
      isVerified: false,
      isPremium: false,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(stringId, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = Array.from(this.users.values()).find(u => u.id === id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    // Find the key for this user and update
    for (const [key, value] of this.users.entries()) {
      if (value.id === id) {
        this.users.set(key, updatedUser);
        break;
      }
    }
    return updatedUser;
  }
  
  async verifyUser(id: number): Promise<void> {
    await this.updateUser(id, { isVerified: true });
  }
  
  async saveScript(script: InsertScript): Promise<Script> {
    const newScript: Script = {
      ...script,
      id: this.nextScriptId++,
      executions: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userScripts.push(newScript);
    return newScript;
  }
  
  async getScript(id: number): Promise<Script | undefined> {
    return this.userScripts.find(s => s.id === id);
  }
  
  async getUserScripts(userId: number): Promise<Script[]> {
    return this.userScripts.filter(s => s.userId === userId);
  }
  
  async deleteScript(id: number, userId: number): Promise<boolean> {
    const index = this.userScripts.findIndex(s => s.id === id && s.userId === userId);
    if (index !== -1) {
      this.userScripts.splice(index, 1);
      return true;
    }
    return false;
  }
  
  async logSecurityEvent(): Promise<void> {
    console.log('Security event logged (memory storage)');
  }
  
  async logExecution(): Promise<void> {
    console.log('Execution logged (memory storage)');
  }
  
  async getUserExecutionCount(): Promise<number> {
    return 0; // Mock implementation
  }
}

export const storage = new DatabaseStorage();
