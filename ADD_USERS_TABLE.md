# 👥 إضافة جدول المستخدمين إلى قاعدة البيانات

## 🎯 **الهدف:**
إضافة جدول المستخدمين إلى قاعدة البيانات D1

---

## 📋 **الخطوات:**

### **الخطوة 1: إنشاء جدول المستخدمين**

#### **1.1 إنشاء جدول users:**
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'admin',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT
);
```

#### **1.2 إضافة فهارس:**
```sql
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);
```

### **الخطوة 2: إضافة المستخدم الحالي**

#### **2.1 تشغيل SQL:**
```sql
INSERT INTO users (username, password_hash, role) 
VALUES ('aalhesh', '$2a$10$...', 'admin');
```

### **الخطوة 3: تحديث server/auth.ts**

#### **3.1 استبدال Hardcoded credentials:**
```typescript
// بدلاً من:
const ADMIN_USERNAME = "aalhesh";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("ah123m123ed", 10);

// استخدم:
async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const user = await db.prepare(`
    SELECT password_hash FROM users WHERE username = ?
  `).bind(username).first();
  
  if (!user) return false;
  return bcrypt.compareSync(password, user.password_hash);
}
```

---

## 🚀 **التنفيذ:**

### **الخطوة 1: إنشاء جدول المستخدمين**
```bash
wrangler d1 execute licenses_db --command="CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, email TEXT, role TEXT DEFAULT 'admin', created_at TEXT DEFAULT CURRENT_TIMESTAMP, last_login TEXT);" --remote
```

### **الخطوة 2: إضافة فهارس**
```bash
wrangler d1 execute licenses_db --command="CREATE INDEX IF NOT EXISTS idx_username ON users(username);" --remote
```

### **الخطوة 3: إضافة المستخدم الحالي**
```bash
wrangler d1 execute licenses_db --command="INSERT INTO users (username, password_hash, role) VALUES ('aalhesh', '\$2a\$10\$...', 'admin');" --remote
```

---

## 🔍 **التحقق:**

### **عرض الجداول:**
```bash
wrangler d1 execute licenses_db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote
```

### **عرض المستخدمين:**
```bash
wrangler d1 execute licenses_db --command="SELECT * FROM users;" --remote
```

---

## 🎯 **النتيجة:**

```
✅ جدول users في قاعدة البيانات
✅ المستخدم aalhesh محفوظ
✅ Authentication من قاعدة البيانات
✅ إمكانية إضافة مستخدمين جدد
✅ إدارة المستخدمين
```

---

## 📞 **هل تريد تنفيذ هذا؟**

**أ) "نعم، أضف جدول المستخدمين"** ← سأقوم بكل شيء تلقائياً
**ب) "لا، أريد أن أتعلم بنفسي"** ← سأشرح لك الطريقة
**ج) "أخبرني بالتفصيل"** ← سأوضح كل شيء

---

## 🎊 **بعد التنفيذ:**

```
✅ قاعدة البيانات تحتوي على جدول المستخدمين
✅ بيانات تسجيل الدخول محفوظة
✅ إمكانية إدارة المستخدمين
✅ أمان محسن
```
