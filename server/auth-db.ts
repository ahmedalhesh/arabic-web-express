// Database-based Authentication
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";

// Require SESSION_SECRET environment variable - fail if not set
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required for JWT authentication");
}

const JWT_SECRET = process.env.SESSION_SECRET;
const TOKEN_EXPIRY = "7d";

export interface JWTPayload {
  username: string;
  iat: number;
  exp: number;
}

export interface User {
  id: number;
  username: string;
  password_hash: string;
  email: string | null;
  role: string;
  created_at: string;
  last_login: string | null;
}

// Database-based authentication
export async function verifyCredentials(db: any, username: string, password: string): Promise<boolean> {
  try {
    const user = await db.prepare(`
      SELECT password_hash FROM users WHERE username = ?
    `).bind(username).first();
    
    if (!user) {
      console.log("User not found:", username);
      return false;
    }
    
    const isValid = bcrypt.compareSync(password, user.password_hash);
    console.log("Password verification result:", isValid);
    return isValid;
  } catch (error) {
    console.error("Database authentication error:", error);
    return false;
  }
}

// Update last login
export async function updateLastLogin(db: any, username: string): Promise<void> {
  try {
    const now = new Date().toISOString();
    await db.prepare(`
      UPDATE users SET last_login = ? WHERE username = ?
    `).bind(now, username).run();
  } catch (error) {
    console.error("Update last login error:", error);
  }
}

export function generateToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  (req as any).user = payload;
  next();
}
