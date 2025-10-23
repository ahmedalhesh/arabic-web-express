# 📚 دليل إعداد قاعدة البيانات على Cloudflare

## 🎯 الهدف:
تحويل النظام من SQLite محلي إلى Cloudflare D1 Database

---

## 📋 الخطوات التفصيلية:

### **الخطوة 1: إنشاء D1 Database**

#### **1.1 تسجيل الدخول إلى Cloudflare:**
```bash
# في Terminal
wrangler login
```

#### **1.2 إنشاء قاعدة البيانات:**
```bash
# إنشاء قاعدة بيانات جديدة
wrangler d1 create licenses_db

# أو مع Account ID محدد
wrangler d1 create licenses_db --account-id bc59afd13023dac306f3d02c07b762cc
```

#### **1.3 نسخ Database ID:**
```
ستحصل على output مثل:
✅ Successfully created DB 'licenses_db' in region APAC
Created your database using D1's new storage engine. The new storage engine is not yet recommended for production workloads, but backs up your data automatically.
Your new database is: bc59afd13023dac306f3d02c07b762cc
```

---

### **الخطوة 2: تحديث wrangler.toml**

#### **2.1 فتح ملف wrangler.toml:**
```toml
# Cloudflare Pages Configuration
name = "arabic-web-express"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
cwd = "./"

# Pages configuration
pages_build_output_dir = "dist/public"

# Environment variables
[env.production]
vars = { NODE_ENV = "production" }

# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "licenses_db"
database_id = "bc59afd13023dac306f3d02c07b762cc"  # ← ضع Database ID هنا
```

#### **2.2 حفظ الملف:**
```
Ctrl + S
```

---

### **الخطوة 3: تهيئة قاعدة البيانات**

#### **3.1 تشغيل init.sql:**
```bash
# تهيئة قاعدة البيانات
wrangler d1 execute licenses_db --file=./init.sql

# أو مع Account ID
wrangler d1 execute licenses_db --file=./init.sql --account-id bc59afd13023dac306f3d02c07b762cc
```

#### **3.2 التحقق من الجداول:**
```bash
# عرض الجداول
wrangler d1 execute licenses_db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

---

### **الخطوة 4: تحديث server/storage.ts**

#### **4.1 إنشاء ملف storage-d1.ts:**
```typescript
// server/storage-d1.ts
export interface License {
  serial_number: string;
  program_name: string | null;
  device_id: string | null;
  active: number;
  activation_date: string | null;
  notes: string | null;
}

export const createD1Storage = (db: D1Database) => ({
  // Create new serial (admin generates)
  async createSerial(serial: string, notes?: string): Promise<License> {
    try {
      console.log("Creating serial:", serial, "with notes:", notes);
      
      await db.prepare(`
        INSERT INTO licenses (serial_number, notes, active)
        VALUES (?, ?, 0)
      `).bind(serial, notes || null).run();
      
      return {
        serial_number: serial,
        program_name: null,
        device_id: null,
        active: 0,
        activation_date: null,
        notes: notes || null,
      };
    } catch (error) {
      console.error("Error in createSerial:", error);
      throw error;
    }
  },

  // Activate serial (end user activates)
  async activateSerial(serial: string, programName: string, deviceId: string): Promise<License | null> {
    const license = await this.getBySerial(serial);
    if (!license) return null;
    
    const now = new Date().toISOString();
    await db.prepare(`
      UPDATE licenses 
      SET program_name = ?, device_id = ?, active = 1, activation_date = ?
      WHERE serial_number = ?
    `).bind(programName, deviceId, now, serial).run();
    
    return {
      ...license,
      program_name: programName,
      device_id: deviceId,
      active: 1,
      activation_date: now,
    };
  },

  // Get all licenses
  async getAll(): Promise<License[]> {
    const result = await db.prepare(`
      SELECT * FROM licenses ORDER BY activation_date DESC
    `).all();
    return result.results as License[];
  },

  // Get by serial
  async getBySerial(serial: string): Promise<License | null> {
    const result = await db.prepare(`
      SELECT * FROM licenses WHERE serial_number = ?
    `).bind(serial).first();
    return result as License | null;
  },

  // Update notes only
  async updateNotes(serial: string, notes: string): Promise<boolean> {
    const result = await db.prepare(`
      UPDATE licenses SET notes = ? WHERE serial_number = ?
    `).bind(notes, serial).run();
    return result.changes > 0;
  },

  // Delete serial
  async delete(serial: string): Promise<boolean> {
    const result = await db.prepare(`
      DELETE FROM licenses WHERE serial_number = ?
    `).bind(serial).run();
    return result.changes > 0;
  },
});
```

#### **4.2 تحديث server/routes.ts:**
```typescript
// server/routes.ts
import { createD1Storage } from './storage-d1.js';

// في بداية الملف
let storage;

// في middleware
if (process.env.NODE_ENV === 'production') {
  // استخدام D1 في الإنتاج
  storage = createD1Storage(env.DB);
} else {
  // استخدام SQLite في التطوير
  storage = require('./storage.js').storage;
}
```

---

### **الخطوة 5: اختبار قاعدة البيانات**

#### **5.1 اختبار محلي:**
```bash
# تشغيل النظام محلياً
npm run dev
```

#### **5.2 اختبار D1:**
```bash
# اختبار قاعدة البيانات
wrangler d1 execute licenses_db --command="SELECT * FROM licenses;"
```

#### **5.3 اختبار النشر:**
```bash
# نشر النظام
wrangler pages deploy dist/public --project-name arabic-web-express
```

---

## 🔍 **التحقق من النجاح:**

### **✅ علامات النجاح:**
```
✅ D1 Database تم إنشاؤه
✅ wrangler.toml محدث
✅ init.sql تم تشغيله
✅ storage-d1.ts تم إنشاؤه
✅ النظام يعمل على Cloudflare
```

### **❌ علامات الفشل:**
```
❌ خطأ في إنشاء D1
❌ خطأ في wrangler.toml
❌ خطأ في init.sql
❌ خطأ في storage-d1.ts
❌ النظام لا يعمل
```

---

## 🚨 **المشاكل الشائعة:**

### **مشكلة 1: "Database not found"**
```bash
# الحل: تحقق من Database ID
wrangler d1 list
```

### **مشكلة 2: "Permission denied"**
```bash
# الحل: تسجيل الدخول مرة أخرى
wrangler login
```

### **مشكلة 3: "Table not found"**
```bash
# الحل: تشغيل init.sql
wrangler d1 execute licenses_db --file=./init.sql
```

---

## 📞 **الدعم:**

- **Cloudflare D1:** https://dash.cloudflare.com/d1
- **Documentation:** https://developers.cloudflare.com/d1/
- **Repository:** https://github.com/ahmedalhesh/arabic-web-express

---

## 🎯 **النتيجة النهائية:**

```
✅ قاعدة بيانات تعمل على Cloudflare
✅ بيانات محفوظة في D1
✅ النظام يعمل بالكامل
✅ لا توجد مشاكل في قاعدة البيانات
```

**🎊 النظام سيكون جاهزاً للاستخدام بالكامل!** 🌍
