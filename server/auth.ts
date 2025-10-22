import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";

// Require SESSION_SECRET environment variable - fail if not set
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required for JWT authentication");
}

const JWT_SECRET = process.env.SESSION_SECRET;
const TOKEN_EXPIRY = "7d";

// Hardcoded admin credentials
const ADMIN_USERNAME = "aalhesh";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("ah123m123ed", 10);

export interface JWTPayload {
  username: string;
  iat: number;
  exp: number;
}

export function verifyCredentials(username: string, password: string): boolean {
  if (username !== ADMIN_USERNAME) {
    return false;
  }
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
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
