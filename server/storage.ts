import { users, type User, type InsertUser } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db"; // Ensure you have your drizzle db connection setup here
import { randomUUID } from "crypto";

// ──────────────────────────────────────────────────────────────
// 1. INTERFACE DEFINITION
// ──────────────────────────────────────────────────────────────
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>; // Added for Profile Page
}

// ──────────────────────────────────────────────────────────────
// 2. DATABASE STORAGE (Production - PostgreSQL)
// ──────────────────────────────────────────────────────────────
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) throw new Error("User not found");
    return updatedUser;
  }
}

// ──────────────────────────────────────────────────────────────
// 3. MEMORY STORAGE (Dev / Fallback / Testing)
// ──────────────────────────────────────────────────────────────
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private currentId: number;
  
  // Optimization: Secondary Indices for O(1) lookups
  private usernameIndex: Map<string, number>; // username -> id
  private emailIndex: Map<string, number>;    // email -> id

  constructor() {
    this.users = new Map();
    this.usernameIndex = new Map();
    this.emailIndex = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const id = this.usernameIndex.get(username);
    return id ? this.users.get(id) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const id = this.emailIndex.get(email);
    return id ? this.users.get(id) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Write to main store
    this.users.set(id, user);
    
    // Write to indices
    this.usernameIndex.set(user.username, id);
    if (user.email) this.emailIndex.set(user.email, id);

    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) throw new Error("User not found");

    const updatedUser = { ...existingUser, ...updates };
    
    // Handle Index Updates if critical fields changed
    if (updates.username && updates.username !== existingUser.username) {
      this.usernameIndex.delete(existingUser.username);
      this.usernameIndex.set(updatedUser.username, id);
    }
    if (updates.email && updates.email !== existingUser.email) {
      this.emailIndex.delete(existingUser.email);
      this.emailIndex.set(updatedUser.email, id);
    }

    this.users.set(id, updatedUser);
    return updatedUser;
  }
}

// ──────────────────────────────────────────────────────────────
// 4. FACTORY EXPORT
// ──────────────────────────────────────────────────────────────
// If a DATABASE_URL is present, use the real DB. Otherwise, warn and use Memory.

let storageInstance: IStorage;

if (process.env.DATABASE_URL) {
  storageInstance = new DatabaseStorage();
} else {
  console.warn("⚠️  WARNING: DATABASE_URL not found. Using ephemeral memory storage. All data will be lost on restart.");
  storageInstance = new MemStorage();
}

export const storage = storageInstance;