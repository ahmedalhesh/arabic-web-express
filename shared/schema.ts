import { z } from "zod";

// Admin user schema (hardcoded authentication)
export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// License schema
export interface License {
  serial_number: string;
  program_name: string | null;
  device_id: string | null;
  active: number;
  activation_date: string | null;
  notes: string | null;
}

// API response types
export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface GenerateSerialResponse {
  success: boolean;
  serial: string;
  license: License;
}

export interface ActivateResponse {
  success: boolean;
  message: string;
  license?: License;
}
