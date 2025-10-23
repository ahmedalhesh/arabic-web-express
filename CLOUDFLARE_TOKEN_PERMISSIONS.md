# 🔑 دليل إنشاء Cloudflare API Token

## الصلاحيات المطلوبة للتوكن

### ✅ الصلاحيات الضرورية:

| الصلاحية | المستوى | السبب |
|----------|---------|-------|
| **Cloudflare Pages** | `Edit` | للنشر والتعديل على Pages |
| **Account Settings** | `Read` | لقراءة معلومات الحساب |
| **Workers Scripts** | `Edit` | (اختياري) إذا كنت تستخدم Workers |

---

## 📋 خطوات إنشاء API Token

### الخطوة 1️⃣: تسجيل الدخول

اذهب إلى: https://dash.cloudflare.com/

### الخطوة 2️⃣: الوصول لصفحة API Tokens

```
My Profile (في الأعلى) → API Tokens
```

أو مباشرة: https://dash.cloudflare.com/profile/api-tokens

### الخطوة 3️⃣: إنشاء Token جديد

اضغط **"Create Token"**

---

## 🎯 الطريقة 1: استخدام Template جاهز (الأسهل) ⭐

### 1. اختر **"Edit Cloudflare Workers"** template

✅ هذا Template يحتوي على كل الصلاحيات المطلوبة!

### 2. اضغط **"Use template"**

### 3. راجع الصلاحيات:

```
Account:
  ✅ Cloudflare Pages - Edit
  ✅ Account Settings - Read
  
Zone:
  ✅ Workers Routes - Edit (اختياري)
```

### 4. (اختياري) حدد Account معين

```
Account Resources:
  ✅ Include → [اختر حسابك]
```

### 5. اضغط **"Continue to summary"**

### 6. اضغط **"Create Token"**

### 7. ⚠️ **انسخ التوكن فوراً!**

```
لن تتمكن من رؤيته مرة أخرى!
احفظه في مكان آمن!
```

---

## 🎯 الطريقة 2: Custom Token (متقدم)

إذا كنت تريد صلاحيات محددة بالضبط:

### 1. اختر **"Create Custom Token"**

### 2. املأ المعلومات:

```
Token name: ArabicWebExpress-Deploy
```

### 3. أضف الصلاحيات:

#### Permissions:

| Resource | Permission | Access |
|----------|-----------|--------|
| Account | Cloudflare Pages | Edit |
| Account | Account Settings | Read |

#### Account Resources:

```
Include → [اختر حسابك]
```

أو:

```
Include → All accounts
```

#### Client IP Address Filtering (اختياري):

```
اتركه فارغاً للسماح من أي IP
```

#### TTL (اختياري):

```
اتركه فارغاً (لا ينتهي)
```

أو حدد فترة:

```
مثلاً: 1 year
```

### 4. اضغط **"Continue to summary"**

### 5. راجع الملخص وتأكد من:

```yaml
Permissions:
  - Account / Cloudflare Pages / Edit ✅
  - Account / Account Settings / Read ✅

Account Resources:
  - Include: Your Account ✅
```

### 6. اضغط **"Create Token"**

### 7. **انسخ التوكن واحفظه!** 🔐

---

## 📸 مثال على Token صحيح:

```
Token Details:
─────────────────────────────
Name: ArabicWebExpress-Deploy

Permissions:
  ✅ Account - Cloudflare Pages (Edit)
  ✅ Account - Account Settings (Read)

Account Resources:
  ✅ All accounts (or your specific account)

Status: Active ✅
```

---

## 🔐 أمان التوكن

### ✅ افعل:

- احفظ التوكن في مكان آمن
- استخدمه في GitHub Secrets فقط
- أعد إنشائه إذا تسرب

### ❌ لا تفعل:

- لا تشاركه مع أحد
- لا تضعه في الكود
- لا تنشره على الإنترنت
- لا تحفظه في ملف نصي عادي

---

## 🧪 اختبار التوكن

بعد إنشاء التوكن، اختبره:

```bash
# في PowerShell
$env:CLOUDFLARE_API_TOKEN="your-token-here"

# اختبر التوكن
wrangler whoami
```

إذا ظهر:
```
✅ Successfully logged in
```

**التوكن يعمل!** 🎉

---

## 🔄 إدارة التوكنات

### عرض جميع التوكنات:

```
Cloudflare Dashboard → My Profile → API Tokens
```

### تعديل توكن:

```
اضغط "Edit" بجانب التوكن
```

### حذف توكن:

```
اضغط "Delete" إذا لم تعد تحتاجه
```

### إعادة إنشاء توكن:

```
احذف القديم وأنشئ جديد
```

---

## 📝 ملخص سريع

### الصلاحيات المطلوبة:

```yaml
✅ Account → Cloudflare Pages → Edit
✅ Account → Account Settings → Read
```

### كيفية الإنشاء:

```
1. Cloudflare Dashboard
2. My Profile → API Tokens
3. Create Token
4. Use "Edit Cloudflare Workers" template
5. Create Token
6. Copy and save! 🔐
```

---

## 🆘 مشاكل شائعة

### مشكلة: "Insufficient permissions"

**الحل:**
- تأكد من صلاحية **Edit** على Cloudflare Pages
- تأكد من تحديد الـ Account الصحيح

### مشكلة: "Token invalid"

**الحل:**
- تأكد من نسخ التوكن بالكامل
- لا توجد مسافات في البداية أو النهاية
- التوكن لم ينتهي (TTL)

### مشكلة: "Account not found"

**الحل:**
- تأكد من إضافة Account Resources
- اختر "All accounts" أو حسابك المحدد

---

## ✅ جاهز!

بعد إنشاء التوكن:

1. **انسخه واحفظه** 🔐
2. **استخدمه في GitHub Secrets** كـ `CLOUDFLARE_API_TOKEN`
3. **احتفظ به للاستخدام المستقبلي**

---

## 🔗 روابط مفيدة

- [Cloudflare API Tokens Docs](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

