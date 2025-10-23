# 🚀 دليل النشر على Cloudflare

دليل شامل لنشر نظام إدارة التراخيص على Cloudflare Pages مع النشر التلقائي.

---

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من توفر:

✅ حساب على [Cloudflare](https://cloudflare.com)  
✅ حساب على [GitHub](https://github.com)  
✅ تثبيت [Git](https://git-scm.com/)  
✅ تثبيت [Node.js](https://nodejs.org/) (الإصدار 18 أو أحدث)  
✅ تثبيت [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

## 🎯 خطوات النشر

### الطريقة 1: النشر التلقائي عبر GitHub (موصى بها) ⭐

#### الخطوة 1️⃣: رفع المشروع على GitHub

```bash
# تهيئة Git (إذا لم يكن مهيأ)
git init

# إضافة جميع الملفات
git add .

# عمل commit
git commit -m "Initial commit: Arabic License Management System"

# ربط مع GitHub (استبدل YOUR-USERNAME و YOUR-REPO)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git

# رفع الكود
git push -u origin main
```

#### الخطوة 2️⃣: الحصول على Cloudflare API Token

1. **سجل الدخول** إلى [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. اذهب إلى **My Profile** → **API Tokens**
3. اضغط **Create Token**
4. اختر **Edit Cloudflare Workers** template
5. أو أنشئ custom token مع الصلاحيات:
   - `Account.Cloudflare Pages` → Edit
   - `Account.Cloudflare Workers` → Edit
6. انسخ ال token (ستحتاجه في GitHub)

#### الخطوة 3️⃣: الحصول على Account ID

1. في Cloudflare Dashboard
2. اذهب إلى **Workers & Pages**
3. ستجد **Account ID** في الجانب الأيمن
4. انسخه

#### الخطوة 4️⃣: إضافة Secrets في GitHub

1. اذهب إلى repository الخاص بك على GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. اضغط **New repository secret**
4. أضف السريين التاليين:

```
Name: CLOUDFLARE_API_TOKEN
Value: [الـ token الذي حصلت عليه]

Name: CLOUDFLARE_ACCOUNT_ID  
Value: [الـ Account ID]
```

#### الخطوة 5️⃣: إنشاء Cloudflare Pages Project

1. اذهب إلى [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** → **Create application** → **Pages**
3. اختر **Connect to Git**
4. اختر repository الخاص بك
5. إعدادات البناء:
   ```
   Framework preset: None
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```
6. **Environment variables**:
   ```
   NODE_ENV = production
   SESSION_SECRET = [مفتاح سري قوي 32 حرف على الأقل]
   ```
7. اضغط **Save and Deploy**

#### الخطوة 6️⃣: النشر التلقائي! 🎉

الآن، في كل مرة تقوم بـ push للـ main branch:

```bash
git add .
git commit -m "تحديث النظام"
git push
```

سيتم النشر تلقائياً! ✅

---

### الطريقة 2: النشر اليدوي عبر Wrangler

#### الخطوة 1️⃣: تثبيت Wrangler

```bash
npm install -g wrangler
```

#### الخطوة 2️⃣: تسجيل الدخول

```bash
npm run cf:login
# أو
wrangler login
```

#### الخطوة 3️⃣: إنشاء D1 Database

```bash
npm run cf:d1:create
# أو
wrangler d1 create licenses_db
```

سيظهر لك `database_id`، انسخه وضعه في `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "licenses_db"
database_id = "PASTE-YOUR-DATABASE-ID-HERE"
```

#### الخطوة 4️⃣: تهيئة قاعدة البيانات

```bash
npm run cf:d1:init
# أو
wrangler d1 execute licenses_db --file=./init.sql
```

#### الخطوة 5️⃣: البناء والنشر

```bash
npm run deploy
# أو
npm run build
wrangler pages deploy dist
```

---

## ⚙️ إعدادات متقدمة

### إضافة Domain مخصص

1. في Cloudflare Pages project الخاص بك
2. **Custom domains** → **Set up a custom domain**
3. أدخل domain الخاص بك (مثل: `licenses.yourdomain.com`)
4. اتبع التعليمات لإضافة CNAME record

### تفعيل HTTPS

يتم تفعيل HTTPS تلقائياً مع Cloudflare! ✅

### متغيرات البيئة (Environment Variables)

في Cloudflare Pages:

1. اذهب إلى project الخاص بك
2. **Settings** → **Environment variables**
3. أضف:
   ```
   SESSION_SECRET = [32+ characters random string]
   NODE_ENV = production
   ```

---

## 🔐 الأمان

### تأمين API Token

- ✅ لا تشارك API Token مع أحد
- ✅ لا تضعه في الكود
- ✅ استخدم GitHub Secrets فقط
- ✅ أعد إنشاء Token إذا تسرب

### SESSION_SECRET

قم بإنشاء مفتاح قوي:

```bash
# في PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# أو استخدم موقع
# https://randomkeygen.com/
```

---

## 📊 مراقبة الأداء

### Cloudflare Analytics

1. اذهب إلى project الخاص بك
2. **Analytics** tab
3. راقب:
   - عدد الزيارات
   - سرعة التحميل
   - الأخطاء

### Logs

```bash
wrangler pages deployment tail
```

---

## 🐛 حل المشاكل الشائعة

### مشكلة 1: Build فشل

**الحل:**
```bash
# تأكد من:
1. npm install عمل بنجاح
2. لا توجد أخطاء في الكود
3. جميع dependencies موجودة في package.json
```

### مشكلة 2: Database لا يعمل

**الحل:**
```bash
# أعد تهيئة قاعدة البيانات
wrangler d1 execute licenses_db --file=./init.sql

# تحقق من database_id في wrangler.toml
```

### مشكلة 3: 500 Internal Server Error

**الحل:**
```bash
# تحقق من Environment Variables
# تأكد من وجود SESSION_SECRET
# راجع logs
wrangler pages deployment tail
```

### مشكلة 4: CORS Errors

**الحل:**
- تأكد من وجود ملف `_headers` في dist
- تحقق من إعدادات CORS في Cloudflare

---

## 🔄 التحديثات

### تحديث يدوي

```bash
git add .
git commit -m "وصف التحديث"
git push
# النشر يتم تلقائياً!
```

### Rollback (التراجع عن نشر)

1. في Cloudflare Pages project
2. **Deployments** tab
3. اختر deployment قديم
4. اضغط **Rollback to this deployment**

---

## 📈 تحسين الأداء

### 1. تفعيل Caching

في `_headers`:
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

### 2. تفعيل Compression

يتم تلقائياً من Cloudflare! ✅

### 3. CDN

Cloudflare يوفر CDN عالمي تلقائياً! ✅

---

## 💰 التكلفة

### Cloudflare Pages - المجاني يتضمن:

✅ 500 builds شهرياً  
✅ Bandwidth غير محدود  
✅ استضافة مجانية  
✅ SSL مجاني  
✅ CDN عالمي  

**مثالي للمشاريع الصغيرة والمتوسطة!** 🎉

---

## 🆘 الدعم

### وثائق Cloudflare

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

### المساعدة

- [Cloudflare Community](https://community.cloudflare.com/)
- [GitHub Issues](https://github.com/YOUR-USERNAME/YOUR-REPO/issues)

---

## ✅ قائمة التحقق النهائية

قبل النشر، تأكد من:

- [ ] رفع الكود على GitHub
- [ ] إضافة CLOUDFLARE_API_TOKEN في GitHub Secrets
- [ ] إضافة CLOUDFLARE_ACCOUNT_ID في GitHub Secrets
- [ ] إنشاء Cloudflare Pages Project
- [ ] إضافة SESSION_SECRET في Environment Variables
- [ ] اختبار النظام محلياً بـ `npm run preview`
- [ ] مراجعة جميع الإعدادات

---

## 🚀 النشر الآن!

```bash
# 1. احفظ التغييرات
git add .
git commit -m "Ready for deployment"

# 2. ارفع على GitHub
git push origin main

# 3. انتظر 2-3 دقائق
# 4. افتح رابط Cloudflare Pages
# 5. استمتع بنظامك! 🎉
```

---

**تهانينا! نظامك الآن على الإنترنت!** 🌍✨

URL الخاص بك سيكون:
```
https://arabic-web-express.pages.dev
```

أو domain المخصص:
```
https://yourdomain.com
```

