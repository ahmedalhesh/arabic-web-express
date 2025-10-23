# ✅ قائمة التحقق للنشر

## قبل النشر

- [ ] اختبر النظام محلياً: `npm run dev`
- [ ] تأكد من عدم وجود أخطاء: `npm run check`
- [ ] راجع ملف `.gitignore`
- [ ] راجع Environment Variables

---

## الخطوة 1: GitHub

- [ ] إنشاء repository جديد على GitHub
- [ ] تهيئة Git محلياً: `git init`
- [ ] إضافة الملفات: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] ربط مع GitHub: `git remote add origin [URL]`
- [ ] Push: `git push -u origin main`

---

## الخطوة 2: Cloudflare Dashboard

### إنشاء API Token
- [ ] تسجيل الدخول: https://dash.cloudflare.com/
- [ ] My Profile → API Tokens
- [ ] Create Token
- [ ] Edit Cloudflare Workers template
- [ ] نسخ Token

### الحصول على Account ID
- [ ] Workers & Pages
- [ ] نسخ Account ID من الجانب

### إنشاء Pages Project
- [ ] Workers & Pages → Create
- [ ] Pages → Connect to Git
- [ ] اختيار Repository
- [ ] Build settings:
  - [ ] Build command: `npm run build`
  - [ ] Build output: `dist`
- [ ] Environment variables:
  - [ ] `NODE_ENV` = `production`
  - [ ] `SESSION_SECRET` = `[32+ random characters]`
- [ ] Save and Deploy

---

## الخطوة 3: GitHub Secrets

- [ ] GitHub Repo → Settings
- [ ] Secrets and variables → Actions
- [ ] New repository secret:
  - [ ] `CLOUDFLARE_API_TOKEN` = [token from step 2]
  - [ ] `CLOUDFLARE_ACCOUNT_ID` = [account id from step 2]

---

## الخطوة 4: التحقق

- [ ] انتظر اكتمال البناء (2-3 دقائق)
- [ ] افتح رابط Cloudflare Pages
- [ ] اختبر تسجيل الدخول
- [ ] اختبر توليد سيريال
- [ ] اختبر جميع الميزات

---

## اختياري: Domain مخصص

- [ ] Cloudflare Pages Project → Custom domains
- [ ] Set up a custom domain
- [ ] أدخل domain الخاص بك
- [ ] إضافة CNAME record

---

## 🎉 تم النشر بنجاح!

URL الخاص بك:
```
https://arabic-web-express.pages.dev
```

أو:
```
https://yourdomain.com
```

---

## النشر التلقائي

الآن في كل مرة تقوم بـ:
```bash
git add .
git commit -m "تحديث"
git push
```

سيتم النشر تلقائياً! ✅

---

## مراقبة

- [ ] Cloudflare Dashboard → Analytics
- [ ] راقب الأداء والزيارات
- [ ] راجع Logs إذا ظهرت مشاكل

---

**للمساعدة التفصيلية:**
- [QUICK_START.md](./QUICK_START.md) - بدء سريع
- [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) - دليل شامل

