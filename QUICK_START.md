# ⚡ دليل البدء السريع

## 🚀 النشر على Cloudflare في 5 دقائق

### الخطوات:

#### 1️⃣ رفع على GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

#### 2️⃣ إنشاء Cloudflare Pages
1. اذهب إلى: https://dash.cloudflare.com/
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. اختر repository
4. إعدادات البناء:
   - Build command: `npm run build`
   - Build output: `dist`
5. Environment variables:
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = `[مفتاح سري 32+ حرف]`
6. **Save and Deploy**

#### 3️⃣ إعداد النشر التلقائي
1. في GitHub repo → **Settings** → **Secrets**
2. أضف:
   - `CLOUDFLARE_API_TOKEN` = [من Cloudflare Dashboard]
   - `CLOUDFLARE_ACCOUNT_ID` = [من Cloudflare Dashboard]

#### 4️⃣ تم! 🎉
الآن كل push سينشر تلقائياً!

---

## 📚 للتفاصيل الكاملة
اقرأ: [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

---

## 🆘 مشكلة؟
- تحقق من [حل المشاكل](./CLOUDFLARE_DEPLOYMENT.md#-حل-المشاكل-الشائعة)
- اطلع على [وثائق Cloudflare](https://developers.cloudflare.com/pages/)

