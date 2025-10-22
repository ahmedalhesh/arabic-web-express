# دليل استخدام API للتحقق من التراخيص

## نظرة عامة

النظام يعمل بآلية بسيطة جداً:
1. **المسؤول** يُنشئ ترخيص بإدخال: السيريال + اسم البرنامج + الحالة
2. **المستخدم** يحصل على السيريال فقط
3. عند **التفعيل**، البرنامج يرسل السيريال + معرف الجهاز
4. **API يُرجع** جميع المعلومات تلقائياً (اسم البرنامج، الحالة، إلخ)

---

## Endpoint: التحقق من الترخيص

### معلومات عامة
- **URL**: `GET /api/check`
- **نوع الطلب**: Public (لا يحتاج مصادقة)
- **الاستخدام**: للتحقق من صلاحية الترخيص وتفعيله تلقائياً

### المعاملات (Query Parameters)

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `serial` | string | ✅ نعم | رقم السيريال (مثال: `ABCD-1234-EFGH-5678`) |
| `device` | string | ⚠️ اختياري | معرف الجهاز - إذا لم يُرسل، لن يتم التفعيل التلقائي |

---

## أمثلة الاستجابة

### 1️⃣ ترخيص جديد - أول تفعيل

**الطلب:**
```bash
GET /api/check?serial=ABC123&device=DEVICE-001
```

**الاستجابة:**
```json
{
  "found": true,
  "valid": true,
  "status": "صالح",
  "active": true,
  "serial_number": "ABC123",
  "program_name": "برنامج المحاسبة",
  "device_id": "DEVICE-001",
  "activation_date": "2025-10-22"
}
```

**ملاحظات:**
- ✅ تم تفعيل الترخيص تلقائياً
- ✅ تم ربطه بالجهاز DEVICE-001
- ✅ تم تسجيل تاريخ التفعيل

---

### 2️⃣ ترخيص مفعّل مسبقاً - نفس الجهاز

**الطلب:**
```bash
GET /api/check?serial=ABC123&device=DEVICE-001
```

**الاستجابة:**
```json
{
  "found": true,
  "valid": true,
  "status": "صالح",
  "active": true,
  "serial_number": "ABC123",
  "program_name": "برنامج المحاسبة",
  "device_id": "DEVICE-001",
  "activation_date": "2025-10-22"
}
```

**ملاحظات:**
- ✅ الترخيص صالح
- ✅ نفس الجهاز المفعّل عليه

---

### 3️⃣ ترخيص مفعّل على جهاز آخر

**الطلب:**
```bash
GET /api/check?serial=ABC123&device=DEVICE-002
```

**الاستجابة:**
```json
{
  "found": true,
  "valid": false,
  "status": "الجهاز غير مطابق",
  "serial_number": "ABC123",
  "program_name": "برنامج المحاسبة",
  "device_id": "DEVICE-001"
}
```

**ملاحظات:**
- ❌ الترخيص موجود لكنه مفعّل على جهاز آخر
- ⚠️ لا يمكن استخدامه على DEVICE-002

---

### 4️⃣ ترخيص غير موجود

**الطلب:**
```bash
GET /api/check?serial=INVALID123&device=DEVICE-001
```

**الاستجابة:**
```json
{
  "found": false,
  "valid": false,
  "status": "غير موجود أو غير صالح"
}
```

---

### 5️⃣ ترخيص منتهي أو موقوف

**الطلب:**
```bash
GET /api/check?serial=XYZ789&device=DEVICE-001
```

**الاستجابة:**
```json
{
  "found": true,
  "valid": false,
  "status": "منتهي",
  "active": false,
  "serial_number": "XYZ789",
  "program_name": "برنامج المحاسبة"
}
```

**ملاحظات:**
- ⚠️ الترخيص موجود لكنه منتهي/موقوف
- ❌ لن يتم التفعيل التلقائي

---

## حالات الترخيص الممكنة

| الحالة | الوصف | يمكن التفعيل؟ |
|--------|-------|---------------|
| `صالح` | ترخيص صالح ويمكن استخدامه | ✅ نعم |
| `منتهي` | انتهت صلاحية الترخيص | ❌ لا |
| `موقوف` | تم إيقاف الترخيص من المسؤول | ❌ لا |
| `غير مفعّل` | ترخيص جديد لم يُفعّل بعد | ✅ نعم (إذا كانت الحالة صالح) |

---

## مثال كامل بـ Python

```python
import requests
import hashlib
import platform

def get_device_id():
    """الحصول على معرف فريد للجهاز"""
    device_info = f"{platform.node()}-{platform.system()}"
    return hashlib.md5(device_info.encode()).hexdigest()

def verify_license(serial, api_url="http://localhost:5000"):
    """التحقق من الترخيص"""
    device_id = get_device_id()
    
    response = requests.get(
        f"{api_url}/api/check",
        params={"serial": serial, "device": device_id}
    )
    
    data = response.json()
    
    if data.get("found") and data.get("valid"):
        print(f"✅ الترخيص صالح!")
        print(f"📦 البرنامج: {data.get('program_name')}")
        print(f"📅 تم التفعيل: {data.get('activation_date')}")
        return True
    else:
        print(f"❌ الترخيص غير صالح: {data.get('status')}")
        return False

# الاستخدام
if __name__ == "__main__":
    serial = input("أدخل رقم السيريال: ")
    verify_license(serial)
```

---

## مثال كامل بـ JavaScript/Node.js

```javascript
const axios = require('axios');
const crypto = require('crypto');
const os = require('os');

function getDeviceId() {
    const deviceInfo = `${os.hostname()}-${os.platform()}`;
    return crypto.createHash('md5').update(deviceInfo).digest('hex');
}

async function verifyLicense(serial, apiUrl = 'http://localhost:5000') {
    try {
        const deviceId = getDeviceId();
        
        const response = await axios.get(`${apiUrl}/api/check`, {
            params: {
                serial: serial,
                device: deviceId
            }
        });
        
        const data = response.data;
        
        if (data.found && data.valid) {
            console.log('✅ الترخيص صالح!');
            console.log(`📦 البرنامج: ${data.program_name}`);
            console.log(`📅 تم التفعيل: ${data.activation_date}`);
            return true;
        } else {
            console.log(`❌ الترخيص غير صالح: ${data.status}`);
            return false;
        }
    } catch (error) {
        console.error('خطأ في الاتصال:', error.message);
        return false;
    }
}

// الاستخدام
verifyLicense('ABC123');
```

---

## ملاحظات مهمة

1. **التفعيل التلقائي**: يحدث فقط عندما:
   - الترخيص ليس له `device_id` بعد (لم يُفعّل من قبل)
   - الحالة "صالح"
   - تم إرسال `device` في الطلب

2. **ربط الجهاز**: 
   - بمجرد التفعيل على جهاز، يتم ربط الترخيص بـ device_id
   - **لا يمكن استخدام الترخيص على جهاز آخر** إلا إذا قام المسؤول بإعادة تعيين التفعيل
   - حتى لو غيّر المسؤول الحالة، يبقى الترخيص مرتبطاً بالجهاز الأصلي

3. **المعلومات المُرجعة**: API يُرجع **جميع** معلومات الترخيص تلقائياً:
   - اسم البرنامج
   - الحالة
   - تاريخ التفعيل
   - رقم الجهاز
   - حالة الصلاحية

4. **إعادة تعيين التفعيل**:
   - المسؤول يمكنه إعادة تعيين التفعيل من لوحة التحكم
   - بعد إعادة التعيين، يمكن تفعيل الترخيص على جهاز جديد
   - Endpoint: `POST /api/licenses/:serial/reset` (يحتاج مصادقة)

5. **الأمان**: 
   - الـ Endpoint `/api/check` عام (لا يحتاج مصادقة)
   - مخصص فقط للتحقق من التراخيص
   - لا يسمح بتعديل أو حذف
   - التحقق من device_id صارم - لا يمكن تجاوزه

---

## الفرق بين valid و status

- **`valid`**: `true/false` - هل الترخيص يعمل الآن؟
  - يكون `true` فقط إذا: `active: true` **و** `status: "صالح"`
  
- **`status`**: النص العربي للحالة
  - "صالح" / "منتهي" / "موقوف" / "غير مفعّل" / "الجهاز غير مطابق"

---

## تدفق العمل الكامل

```
1. المسؤول يُنشئ ترخيص:
   ├─ السيريال: ABC-1234-XYZ
   ├─ اسم البرنامج: برنامج المحاسبة
   ├─ الحالة: صالح
   └─ الملاحظات: ترخيص للعميل أحمد

2. المستخدم يحصل على السيريال فقط:
   └─ ABC-1234-XYZ

3. البرنامج يتصل بـ API:
   GET /api/check?serial=ABC-1234-XYZ&device=DEVICE-001

4. API يُرجع كل المعلومات:
   {
     "program_name": "برنامج المحاسبة",  ← تلقائي
     "status": "صالح",                     ← تلقائي
     "valid": true,                        ← تلقائي
     "active": true,                       ← تم التفعيل تلقائياً
     "device_id": "DEVICE-001",            ← تم التسجيل تلقائياً
     "activation_date": "2025-10-22"       ← تم التسجيل تلقائياً
   }

5. البرنامج يعمل ويعرض:
   "مرحباً! أنت تستخدم: برنامج المحاسبة"
```
