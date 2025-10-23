import type { Express } from "express";
import { createServer, type Server } from "http";
import { verifyCredentials, generateToken, authMiddleware } from "./auth";
import { loginSchema } from "@shared/schema";
import { storage } from "./storage";

// Helper function to generate random serial
function generateRandomSerial(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const parts = [];
  for (let i = 0; i < 4; i++) {
    let part = '';
    for (let j = 0; j < 4; j++) {
      part += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(part);
  }
  return parts.join('-');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoint
  app.post("/api/login", async (req, res) => {
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

  // Generate new serial (admin only)
  app.post("/api/generate-serial", authMiddleware, async (req, res) => {
    try {
      const { notes } = req.body;
      
      // Generate unique serial
      let serial = generateRandomSerial();
      while (storage.getBySerial(serial)) {
        serial = generateRandomSerial();
      }

      const license = storage.createSerial(serial, notes);

      res.json({
        success: true,
        serial,
        license,
      });
    } catch (error: any) {
      console.error("Generate serial error:", error);
      res.status(500).json({ 
        success: false,
        message: "فشل توليد السيريال",
      });
    }
  });

  // Activate serial (public - for end users)
  app.post("/api/activate", async (req, res) => {
    try {
      const { serial, programName, deviceId } = req.body;

      if (!serial || !programName || !deviceId) {
        return res.status(400).json({
          success: false,
          message: "جميع الحقول مطلوبة",
        });
      }

      const license = storage.getBySerial(serial);
      if (!license) {
        return res.status(404).json({
          success: false,
          message: "السيريال غير موجود",
        });
      }

      if (license.active) {
        return res.status(400).json({
          success: false,
          message: "السيريال مفعّل بالفعل",
        });
      }

      const activatedLicense = storage.activateSerial(serial, programName, deviceId);

      res.json({
        success: true,
        message: "تم تفعيل الترخيص بنجاح",
        license: activatedLicense,
      });
    } catch (error: any) {
      console.error("Activate error:", error);
      res.status(500).json({ 
        success: false,
        message: "فشل تفعيل الترخيص",
      });
    }
  });

  // Get all licenses (admin only)
  app.get("/api/licenses", authMiddleware, async (req, res) => {
    try {
      const licenses = storage.getAll();
      res.json(licenses);
    } catch (error) {
      console.error("Get licenses error:", error);
      res.status(500).json({ message: "فشل جلب التراخيص" });
    }
  });

  // Update notes (admin only)
  app.put("/api/licenses/:serial/notes", authMiddleware, async (req, res) => {
    try {
      const { serial } = req.params;
      const { notes } = req.body;

      const success = storage.updateNotes(serial, notes || "");
      
      if (success) {
        res.json({ success: true, message: "تم تحديث الملاحظات" });
      } else {
        res.status(404).json({ success: false, message: "الترخيص غير موجود" });
      }
    } catch (error) {
      console.error("Update notes error:", error);
      res.status(500).json({ success: false, message: "فشل تحديث الملاحظات" });
    }
  });

  // Delete license (admin only)
  app.delete("/api/licenses/:serial", authMiddleware, async (req, res) => {
    try {
      const { serial } = req.params;

      const success = storage.delete(serial);
      
      if (success) {
        res.json({ success: true, message: "تم حذف الترخيص" });
      } else {
        res.status(404).json({ success: false, message: "الترخيص غير موجود" });
      }
    } catch (error) {
      console.error("Delete license error:", error);
      res.status(500).json({ success: false, message: "فشل حذف الترخيص" });
    }
  });

  // Check license validity (public - for client apps)
  app.post("/api/check-license", async (req, res) => {
    try {
      const { serial, deviceId } = req.body;

      if (!serial || !deviceId) {
        return res.json({
          valid: false,
          message: "بيانات غير كاملة",
        });
      }

      const license = storage.getBySerial(serial);
      
      if (!license) {
        return res.json({
          valid: false,
          message: "السيريال غير موجود",
        });
      }

      if (!license.active) {
        return res.json({
          valid: false,
          message: "السيريال غير مفعّل",
        });
      }

      if (license.device_id !== deviceId) {
        return res.json({
          valid: false,
          message: "معرف الجهاز غير مطابق",
        });
      }

      res.json({
        valid: true,
        programName: license.program_name,
        activationDate: license.activation_date,
        deviceId: license.device_id,
      });
    } catch (error) {
      console.error("Check license error:", error);
      res.json({ 
        valid: false, 
        message: "خطأ في السيرفر" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
