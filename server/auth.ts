import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

/**
 * Authentication Service
 * Handles user registration, login, and session management
 */

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  profileCompleted: boolean | null;
  trustScore: string | null;
  createdAt: Date | null;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Create a new user in the database
 */
export async function createUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  if (!db) {
    throw new Error("Database not configured");
  }

  try {
    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        password: hashedPassword,
        profileCompleted: false,
      })
      .returning();

    if (!newUser) {
      return null;
    }

    return {
      id: newUser.id,
      email: newUser.email!,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      profileImageUrl: newUser.profileImageUrl,
      profileCompleted: newUser.profileCompleted,
      trustScore: newUser.trustScore,
      createdAt: newUser.createdAt,
    };
  } catch (error: any) {
    if (error.code === "23505") {
      // Unique constraint violation
      throw new Error("Email already exists");
    }
    throw error;
  }
}

/**
 * Authenticate a user by email and password
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  if (!db) {
    throw new Error("Database not configured");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return null;
  }

  const isValid = await comparePassword(password, user.password!);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    profileCompleted: user.profileCompleted,
    trustScore: user.trustScore,
    createdAt: user.createdAt,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
  if (!db) {
    throw new Error("Database not configured");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    profileCompleted: user.profileCompleted,
    trustScore: user.trustScore,
    createdAt: user.createdAt,
  };
}

/**
 * Middleware to check if user is authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

/**
 * Middleware to attach user to request
 */
export async function attachUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.session?.userId) {
    try {
      const user = await getUserById(req.session.userId);
      if (user) {
        (req as any).user = user;
      }
    } catch (error) {
      console.error("Error attaching user:", error);
    }
  }
  next();
}

// Extend Express session type
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}
