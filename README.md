# 🔐 نظام إدارة التراخيص - ArabicWebExpress

نظام كامل لإدارة تراخيص البرامج باللغة العربية مبني على TypeScript و Express و React و SQLite.

## ✨ الميزات

### 🎯 للمدير (Admin)
- ✅ توليد سيريال نمبر تلقائياً
- ✅ عرض جميع التراخيص في جدول
- ✅ تعديل الملاحظات على أي ترخيص
- ✅ حذف السيريال من النظام بالكامل
- ✅ متابعة حالة التفعيل (نشط/غير نشط)

### 👤 للمستخدم النهائي
- ✅ تفعيل البرنامج باستخدام السيريال
- ✅ ربط السيريال بجهاز واحد
- ✅ تسجيل اسم البرنامج ومعرف الجهاز

## 🚀 التشغيل السريع

### 1. تثبيت المتطلبات
```bash
npm install
```

### 2. تشغيل السيرفر
```bash
npm run dev
```

أو استخدم:
```bash
# Windows
start.bat

# PowerShell
./start.ps1
```

### 3. فتح المتصفح
افتح http://localhost:8080

## 🔐 بيانات تسجيل الدخول

- **اسم المستخدم**: `admin`
- **كلمة المرور**: `admin123`

## 📋 كيفية الاستخدام

### المدير (Admin)

1. **تسجيل الدخول** بحسابك
2. **توليد سيريال جديد**:
   - اضغط "توليد سيريال جديد"
   - أضف ملاحظات (اختياري) مثل: "العميل أحمد - نسخة تجريبية"
   - اضغط "توليد السيريال"
   - سيظهر السيريال مع زر نسخ
   - انسخ السيريال وأرسله للعميل

3. **متابعة التراخيص**:
   - الجدول يعرض جميع التراخيص
   - الأعمدة: السيريال | اسم البرنامج | معرف الجهاز | الحالة | تاريخ التفعيل | الملاحظات | الإجراءات

4. **تعديل الملاحظات**:
   - اضغط على أيقونة القلم ✏️
   - عدّل الملاحظات
   - احفظ التغييرات

5. **حذف سيريال**:
   - اضغط على أيقونة سلة المهملات 🗑️
   - أكد الحذف
   - سيتم حذف السيريال من النظام **بالكامل**

### المستخدم النهائي

يمكن للمستخدمين تفعيل برامجهم عبر API:

```bash
POST http://localhost:8080/api/activate
Content-Type: application/json

{
  "serial": "ABCD-1234-EFGH-5678",
  "programName": "برنامج المحاسبة Pro",
  "deviceId": "PC-AHMED-2024"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تفعيل الترخيص بنجاح",
  "license": {
    "serial_number": "ABCD-1234-EFGH-5678",
    "program_name": "برنامج المحاسبة Pro",
    "device_id": "PC-AHMED-2024",
    "active": 1,
    "activation_date": "2025-10-23T17:45:00.000Z",
    "notes": "العميل أحمد"
  }
}
```

## 🛠️ التقنيات المستخدمة

### Backend
- **Express.js** - إطار عمل الويب
- **TypeScript** - لغة البرمجة
- **SQLite** - قاعدة البيانات
- **JWT** - المصادقة والحماية

### Frontend
- **React** - مكتبة الواجهات
- **TypeScript** - لغة البرمجة
- **TailwindCSS** - تنسيق الواجهات
- **Shadcn UI** - مكونات الواجهة
- **React Query** - إدارة البيانات
- **Wouter** - التوجيه

## 📁 هيكل المشروع

```
ArabicWebExpress/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/        # المكونات
│   │   │   ├── GenerateSerialDialog.tsx
│   │   │   ├── EditNotesDialog.tsx
│   │   │   └── DeleteDialog.tsx
│   │   ├── pages/             # الصفحات
│   │   │   ├── Login.tsx
│   │   │   └── Dashboard.tsx
│   │   └── lib/               # مكتبات مساعدة
├── server/                    # Backend Express
│   ├── auth.ts                # نظام المصادقة
│   ├── storage.ts             # قاعدة البيانات
│   ├── routes.ts              # مسارات API
│   └── index.ts               # نقطة البداية
├── shared/                    # مخططات مشتركة
│   └── schema.ts              # Zod schemas
└── database.db                # قاعدة بيانات SQLite
```

## 📡 API Endpoints

### 🔓 Public (بدون مصادقة)

#### POST /api/login
تسجيل الدخول

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/activate
تفعيل ترخيص

**Request:**
```json
{
  "serial": "ABCD-1234-EFGH-5678",
  "programName": "برنامج المحاسبة",
  "deviceId": "PC-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تفعيل الترخيص بنجاح",
  "license": { ... }
}
```

### 🔒 Protected (تتطلب JWT token)

#### POST /api/generate-serial
توليد سيريال جديد

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "notes": "العميل أحمد - نسخة تجريبية"
}
```

**Response:**
```json
{
  "success": true,
  "serial": "ABCD-1234-EFGH-5678",
  "license": { ... }
}
```

#### GET /api/licenses
جلب جميع التراخيص

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "serial_number": "ABCD-1234-EFGH-5678",
    "program_name": "برنامج المحاسبة",
    "device_id": "PC-123",
    "active": 1,
    "activation_date": "2025-10-23T17:45:00.000Z",
    "notes": "العميل أحمد"
  }
]
```

#### PUT /api/licenses/:serial/notes
تحديث ملاحظات ترخيص

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "notes": "الملاحظات الجديدة"
}
```

#### DELETE /api/licenses/:serial
حذف ترخيص

**Headers:**
```
Authorization: Bearer <token>
```

## 🎨 الميزات التقنية

- ✅ **واجهة عربية بالكامل** - كل النصوص بالعربية
- ✅ **تصميم حديث وجميل** - باستخدام Shadcn UI
- ✅ **دعم الوضع الليلي/النهاري** - تبديل سلس بين الأوضاع
- ✅ **استجابة كاملة** - يعمل على جميع الأجهزة
- ✅ **مصادقة آمنة** - باستخدام JWT
- ✅ **قاعدة بيانات محلية** - SQLite بسيط وسريع
- ✅ **رسائل توضيحية** - توست وإشعارات جميلة
- ✅ **حماية الـ API** - جميع عمليات المدير محمية

## 🔧 التطوير

### تشغيل وضع التطوير
```bash
npm run dev
```

### بناء للإنتاج
```bash
npm run build
```

### تشغيل الإنتاج
```bash
npm start
```

## 📝 ملاحظات مهمة

1. **السيريال يُولد تلقائياً** - لا حاجة لإدخاله يدوياً
2. **كل سيريال فريد** - النظام يتأكد من عدم التكرار
3. **التفعيل مرة واحدة** - السيريال يُفعّل مرة واحدة فقط
4. **الحذف نهائي** - لا يمكن استرجاع السيريال بعد الحذف
5. **الملاحظات اختيارية** - يمكن تركها فارغة أو تعديلها لاحقاً

## 🔗 كيف تربط النظام ببرامجك؟

للحصول على شرح تفصيلي كامل مع أمثلة عملية بلغات مختلفة:

📖 **[اقرأ دليل الربط الشامل (INTEGRATION_GUIDE.md)](./INTEGRATION_GUIDE.md)**

### الخطوات السريعة:

1. **في برنامجك**، أضف كود للاتصال بالسيرفر
2. **استخدم API endpoint** `/api/activate` للتفعيل
3. **استخدم API endpoint** `/api/check-license` للتحقق المستمر

**مثال سريع:**
```javascript
// تفعيل الترخيص
POST http://localhost:8080/api/activate
{
  "serial": "ABCD-1234-EFGH-5678",
  "programName": "برنامجي",
  "deviceId": "معرف-الجهاز-الفريد"
}

// التحقق من الترخيص
POST http://localhost:8080/api/check-license
{
  "serial": "ABCD-1234-EFGH-5678",
  "deviceId": "معرف-الجهاز-الفريد"
}
```

تجد أمثلة كاملة بلغات **C#, Python, JavaScript** في ملف `INTEGRATION_GUIDE.md`

---

## 🌐 النشر على الإنتاج

### نشر على Cloudflare Pages (موصى به) ⭐

**دليل البدء السريع:** [QUICK_START.md](./QUICK_START.md)  
**دليل شامل:** [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

#### خطوات سريعة:

```bash
# 1. رفع على GitHub
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main

# 2. إنشاء Cloudflare Pages Project
# اذهب إلى: https://dash.cloudflare.com/
# Workers & Pages → Create → Pages → Connect to Git

# 3. إعداد GitHub Secrets للنشر التلقائي
# في GitHub: Settings → Secrets → Actions
# أضف: CLOUDFLARE_API_TOKEN و CLOUDFLARE_ACCOUNT_ID
```

**مميزات Cloudflare:**
- ✅ استضافة مجانية
- ✅ SSL تلقائي
- ✅ CDN عالمي
- ✅ نشر تلقائي من GitHub
- ✅ Bandwidth غير محدود

---

## 🆘 المساعدة

إذا واجهت أي مشكلة:

1. تأكد من تشغيل `npm install` أولاً
2. تأكد من أن المنفذ 8080 غير مستخدم
3. تحقق من وجود ملف `database.db` (يُنشأ تلقائياً)
4. **للربط مع برامجك**: `INTEGRATION_GUIDE.md`
5. **للنشر على الإنترنت**: `CLOUDFLARE_DEPLOYMENT.md`

---

## 📚 الملفات الهامة

| الملف | الوصف |
|-------|-------|
| `README.md` | وثائق المشروع الأساسية |
| `INTEGRATION_GUIDE.md` | دليل ربط النظام مع برامجك |
| `API_CLIENT_EXAMPLE.md` | أمثلة API جاهزة |
| `CLOUDFLARE_DEPLOYMENT.md` | دليل النشر الشامل |
| `QUICK_START.md` | بدء سريع للنشر |

---

Made with ❤️ using TypeScript, Express, React & SQLite
