# 🔧 حل مشاكل النشر على Cloudflare

## ❌ المشاكل المحتملة:

### 1️⃣ **مشكلة في Secrets**
```
❌ CLOUDFLARE_API_TOKEN غير موجود
❌ CLOUDFLARE_ACCOUNT_ID غير موجود
❌ التوكن لا يحتوي على الصلاحيات المطلوبة
```

### 2️⃣ **مشكلة في Build**
```
❌ npm ci فشل
❌ npm run build فشل
❌ ملف dist غير موجود
```

### 3️⃣ **مشكلة في Cloudflare**
```
❌ المشروع غير موجود على Cloudflare
❌ Account ID خاطئ
❌ API Token منتهي الصلاحية
```

---

## 🔍 خطوات التشخيص:

### **الخطوة 1: تحقق من GitHub Actions**
```
1. اذهب إلى: https://github.com/ahmedalhesh/arabic-web-express/actions
2. اضغط على آخر workflow
3. راجع الأخطاء في logs
```

### **الخطوة 2: تحقق من Secrets**
```
1. اذهب إلى: https://github.com/ahmedalhesh/arabic-web-express/settings/secrets/actions
2. تأكد من وجود:
   ✅ CLOUDFLARE_API_TOKEN
   ✅ CLOUDFLARE_ACCOUNT_ID
```

### **الخطوة 3: تحقق من Cloudflare**
```
1. اذهب إلى: https://dash.cloudflare.com/
2. تأكد من وجود مشروع "arabic-web-express"
3. تحقق من Account ID
```

---

## 🚀 الحلول:

### **الحل 1: إصلاح Secrets**
```
1. احصل على API Token جديد من Cloudflare
2. احصل على Account ID من Cloudflare Dashboard
3. أضفهم في GitHub Secrets
```

### **الحل 2: إنشاء مشروع جديد**
```
1. اذهب إلى Cloudflare Pages
2. أنشئ مشروع جديد
3. اربطه بـ GitHub repository
```

### **الحل 3: النشر اليدوي**
```
1. استخدم wrangler للرفع اليدوي
2. أو استخدم Cloudflare Dashboard
```

---

## 📞 الدعم:
- GitHub Actions: https://github.com/ahmedalhesh/arabic-web-express/actions
- Cloudflare Dashboard: https://dash.cloudflare.com/
- Repository: https://github.com/ahmedalhesh/arabic-web-express
