import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyCredentials, generateToken, authMiddleware } from "./auth";
import { loginSchema, insertLicenseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: "بيانات غير صحيحة" 
        });
      }

      const { username, password } = result.data;

      if (!verifyCredentials(username, password)) {
        return res.status(401).json({ 
          success: false, 
          message: "اسم المستخدم أو كلمة المرور غير صحيحة" 
        });
      }

      const token = generateToken(username);
      res.json({ success: true, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ في الخادم" 
      });
    }
  });

  // Get all licenses (protected)
  app.get("/api/licenses", authMiddleware, async (req, res) => {
    try {
      const licenses = await storage.getAllLicenses();
      res.json(licenses);
    } catch (error) {
      console.error("Get licenses error:", error);
      res.status(500).json({ error: "Failed to fetch licenses" });
    }
  });

  // Create a new license (protected)
  app.post("/api/licenses", authMiddleware, async (req, res) => {
    try {
      const result = insertLicenseSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({ 
          error: "بيانات غير صحيحة",
          details: result.error.errors 
        });
      }

      const existingLicense = await storage.getLicenseBySerial(result.data.serial_number);
      if (existingLicense) {
        return res.status(409).json({ 
          error: "رقم السيريال موجود بالفعل" 
        });
      }

      const license = await storage.createLicense(result.data);
      res.status(201).json(license);
    } catch (error) {
      console.error("Create license error:", error);
      res.status(500).json({ error: "Failed to create license" });
    }
  });

  // Update a license (protected)
  app.put("/api/licenses/:serial", authMiddleware, async (req, res) => {
    try {
      const { serial } = req.params;
      const result = insertLicenseSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({ 
          error: "بيانات غير صحيحة",
          details: result.error.errors 
        });
      }

      const existingLicense = await storage.getLicenseBySerial(serial);
      if (!existingLicense) {
        return res.status(404).json({ error: "الترخيص غير موجود" });
      }

      const license = await storage.updateLicense(serial, result.data);
      res.json(license);
    } catch (error) {
      console.error("Update license error:", error);
      res.status(500).json({ error: "Failed to update license" });
    }
  });

  // Delete a license (protected)
  app.delete("/api/licenses/:serial", authMiddleware, async (req, res) => {
    try {
      const { serial } = req.params;

      const existingLicense = await storage.getLicenseBySerial(serial);
      if (!existingLicense) {
        return res.status(404).json({ error: "الترخيص غير موجود" });
      }

      await storage.deleteLicense(serial);
      res.status(204).send();
    } catch (error) {
      console.error("Delete license error:", error);
      res.status(500).json({ error: "Failed to delete license" });
    }
  });

  // Reset license activation (protected - admin only)
  app.post("/api/licenses/:serial/reset", authMiddleware, async (req, res) => {
    try {
      const { serial } = req.params;
      const license = await storage.resetLicenseActivation(serial);
      res.json(license);
    } catch (error) {
      console.error("Reset license error:", error);
      res.status(404).json({ error: "License not found" });
    }
  });

  // License verification endpoint (for Python clients - public)
  app.get("/api/check", async (req, res) => {
    try {
      const { serial, device } = req.query;

      // Both serial and device are required
      if (!serial || typeof serial !== "string") {
        return res.json({
          found: false,
          valid: false,
          status: "رقم السيريال مطلوب",
        });
      }

      if (!device || typeof device !== "string") {
        return res.json({
          found: false,
          valid: false,
          status: "معرف الجهاز مطلوب",
        });
      }

      const license = await storage.getLicenseBySerial(serial);

      if (!license) {
        return res.json({
          found: false,
          valid: false,
          status: "الترخيص غير موجود",
        });
      }

      // Case 1: License has no device_id yet (never activated)
      if (!license.device_id) {
        // If status is "صالح", activate it automatically
        if (license.status === "صالح") {
          const activatedLicense = await storage.activateLicense(serial, device);
          return res.json({
            found: true,
            valid: true,
            status: activatedLicense.status,
            active: activatedLicense.active,
            serial_number: activatedLicense.serial_number,
            program_name: activatedLicense.program_name,
            device_id: activatedLicense.device_id,
            activation_date: activatedLicense.activation_date,
          });
        }
        
        // Status is not "صالح" - return actual status without activation
        return res.json({
          found: true,
          valid: false,
          status: license.status,
          active: false,
          serial_number: license.serial_number,
          program_name: license.program_name,
        });
      }

      // Case 2: License has device_id - must match requesting device
      if (license.device_id !== device) {
        return res.json({
          found: true,
          valid: false,
          status: "الجهاز غير مطابق",
          serial_number: license.serial_number,
          program_name: license.program_name,
          device_id: license.device_id,
        });
      }

      // Case 3: Device matches - check if license is valid
      const isValid = license.active && license.status === "صالح";
      return res.json({
        found: true,
        valid: isValid,
        status: license.status,
        active: license.active,
        serial_number: license.serial_number,
        program_name: license.program_name,
        device_id: license.device_id,
        activation_date: license.activation_date || undefined,
      });
    } catch (error) {
      console.error("Check license error:", error);
      res.status(500).json({
        found: false,
        valid: false,
        status: "خطأ في الخادم",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
