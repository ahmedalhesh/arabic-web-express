import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// License schema (using in-memory storage, not drizzle tables)
export const licenseSchema = z.object({
  serial_number: z.string().min(1, "رقم السيريال مطلوب"),
  program_name: z.string().min(1, "اسم البرنامج مطلوب"),
  active: z.boolean(),
  device_id: z.string().nullable(),
  activation_date: z.string().nullable(),
  status: z.enum(["صالح", "منتهي", "موقوف", "غير مفعّل"]),
  notes: z.string().nullable(),
});

export const insertLicenseSchema = z.object({
  serial_number: z.string().min(1, "رقم السيريال مطلوب"),
  program_name: z.string().min(1, "اسم البرنامج مطلوب"),
  status: z.enum(["صالح", "منتهي", "موقوف", "غير مفعّل"]),
  notes: z.string().nullable(),
});

export type License = z.infer<typeof licenseSchema>;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;

// Admin user schema (hardcoded authentication)
export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// API response types
export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface LicenseCheckResponse {
  found: boolean;
  valid: boolean;
  status: string;
  active?: boolean;
  serial_number?: string;
  program_name?: string;
  device_id?: string;
  activation_date?: string;
}
