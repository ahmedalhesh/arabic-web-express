# 📖 دليل الربط والاستخدام الشامل

## 🎯 نظرة عامة على النظام

هذا النظام يتكون من **جزأين رئيسيين**:

### 1️⃣ **السيرفر المركزي** (هذا المشروع)
- يعمل على جهازك أو على استضافة سحابية
- يدير جميع التراخيص
- يوفر API للتحقق من التفعيل

### 2️⃣ **البرامج التي توزعها** (برامجك)
- تتصل بالسيرفر المركزي
- تطلب التفعيل من المستخدم
- تتحقق من صلاحية الترخيص

---

## 🔄 كيف يعمل النظام؟

```
┌─────────────────────────────────────────────────────────────┐
│                    سير العمل الكامل                        │
└─────────────────────────────────────────────────────────────┘

الخطوة 1: المدير (أنت)
├─ تسجل الدخول إلى لوحة التحكم
├─ تضغط "توليد سيريال جديد"
├─ تضيف ملاحظات (مثل: "العميل أحمد - شركة XYZ")
├─ تحصل على سيريال: ABCD-1234-EFGH-5678
└─ ترسل السيريال للعميل

        ⬇️

الخطوة 2: العميل (المستخدم النهائي)
├─ يفتح برنامجك
├─ البرنامج يطلب منه إدخال السيريال
├─ يدخل السيريال: ABCD-1234-EFGH-5678
└─ يضغط "تفعيل"

        ⬇️

الخطوة 3: برنامجك (Client)
├─ يجمع معلومات الجهاز (Device ID)
├─ يرسل طلب تفعيل إلى السيرفر المركزي:
│  {
│    "serial": "ABCD-1234-EFGH-5678",
│    "programName": "برنامج المحاسبة Pro",
│    "deviceId": "PC-AHMED-2024-1A2B3C4D"
│  }
└─ ينتظر الرد

        ⬇️

الخطوة 4: السيرفر المركزي
├─ يتحقق من وجود السيريال
├─ يتحقق من أنه غير مُفعَّل مسبقاً
├─ يُفعِّل السيريال ويربطه بمعرف الجهاز
├─ يحفظ اسم البرنامج وتاريخ التفعيل
└─ يرسل رد بالنجاح

        ⬇️

الخطوة 5: برنامجك (Client)
├─ يستقبل رد النجاح
├─ يحفظ بيانات التفعيل محلياً
├─ يسمح للمستخدم باستخدام البرنامج
└─ كل مرة يفتح البرنامج، يتحقق من التفعيل

        ⬇️

الخطوة 6: التحقق المستمر (في كل تشغيل)
├─ البرنامج يقرأ السيريال المحفوظ
├─ يرسل طلب تحقق إلى السيرفر:
│  {
│    "serial": "ABCD-1234-EFGH-5678",
│    "deviceId": "PC-AHMED-2024-1A2B3C4D"
│  }
├─ السيرفر يتحقق من:
│  ✅ السيريال موجود
│  ✅ السيريال مُفعَّل
│  ✅ معرف الجهاز يطابق
└─ إذا كل شيء صحيح، البرنامج يعمل
```

---

## 💻 كيف تربط النظام ببرامجك؟

### 📌 الخطوة 1: تشغيل السيرفر المركزي

يمكنك تشغيل السيرفر بطريقتين:

#### أ) على جهازك المحلي (للتطوير والاختبار)
```bash
npm run dev
# السيرفر يعمل على: http://localhost:8080
```

#### ب) على استضافة سحابية (للإنتاج)
رفع السيرفر على:
- **Heroku**
- **DigitalOcean**
- **AWS**
- **Azure**
- **VPS خاص بك**

```bash
npm run build
npm start
# السيرفر يعمل على: https://your-domain.com
```

---

### 📌 الخطوة 2: إضافة كود التفعيل لبرامجك

الآن في **كل برنامج توزعه**، تضيف كوداً للاتصال بالسيرفر.

---

## 🔧 أمثلة عملية حسب لغة برمجة برنامجك

### 1️⃣ إذا برنامجك بلغة **C#** (WinForms / WPF)

```csharp
// ملف: LicenseManager.cs
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Security.Cryptography;
using System.Management;
using System.IO;

public class LicenseManager
{
    // عنوان السيرفر المركزي (غيّره لعنوان سيرفرك)
    private const string SERVER_URL = "http://localhost:8080";
    private const string LICENSE_FILE = "license.dat";
    
    // توليد معرف فريد للجهاز
    public static string GetDeviceId()
    {
        string cpuId = GetCpuId();
        string motherboardId = GetMotherboardId();
        string deviceStr = $"{cpuId}-{motherboardId}";
        
        using (MD5 md5 = MD5.Create())
        {
            byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(deviceStr));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
    
    private static string GetCpuId()
    {
        ManagementClass mc = new ManagementClass("Win32_Processor");
        ManagementObjectCollection moc = mc.GetInstances();
        foreach (ManagementObject mo in moc)
        {
            return mo.Properties["ProcessorId"].Value.ToString();
        }
        return "UNKNOWN";
    }
    
    private static string GetMotherboardId()
    {
        ManagementClass mc = new ManagementClass("Win32_BaseBoard");
        ManagementObjectCollection moc = mc.GetInstances();
        foreach (ManagementObject mo in moc)
        {
            return mo.Properties["SerialNumber"].Value.ToString();
        }
        return "UNKNOWN";
    }
    
    // تفعيل الترخيص (يُستخدم في نافذة التفعيل)
    public static async Task<(bool success, string message)> ActivateLicense(
        string serial, 
        string programName)
    {
        try
        {
            using (HttpClient client = new HttpClient())
            {
                var activationData = new
                {
                    serial = serial,
                    programName = programName,
                    deviceId = GetDeviceId()
                };
                
                var json = JsonSerializer.Serialize(activationData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await client.PostAsync(
                    $"{SERVER_URL}/api/activate", 
                    content
                );
                
                var responseString = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JsonElement>(responseString);
                
                if (result.GetProperty("success").GetBoolean())
                {
                    // حفظ السيريال محلياً
                    SaveLicenseLocally(serial);
                    return (true, "تم تفعيل البرنامج بنجاح!");
                }
                else
                {
                    string errorMsg = result.GetProperty("message").GetString();
                    return (false, errorMsg);
                }
            }
        }
        catch (Exception ex)
        {
            return (false, $"خطأ في الاتصال: {ex.Message}");
        }
    }
    
    // التحقق من الترخيص (يُستخدم عند كل تشغيل للبرنامج)
    public static async Task<bool> CheckLicense()
    {
        // قراءة السيريال المحفوظ
        string serial = LoadLicenseLocally();
        if (string.IsNullOrEmpty(serial))
        {
            return false; // لا يوجد ترخيص
        }
        
        try
        {
            using (HttpClient client = new HttpClient())
            {
                var checkData = new
                {
                    serial = serial,
                    deviceId = GetDeviceId()
                };
                
                var json = JsonSerializer.Serialize(checkData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await client.PostAsync(
                    $"{SERVER_URL}/api/check-license", 
                    content
                );
                
                var responseString = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JsonElement>(responseString);
                
                return result.GetProperty("valid").GetBoolean();
            }
        }
        catch
        {
            // في حالة عدم الاتصال بالسيرفر، يمكنك السماح بالعمل أو الرفض
            return false;
        }
    }
    
    // حفظ الترخيص محلياً (مشفر)
    private static void SaveLicenseLocally(string serial)
    {
        // يُفضل تشفير السيريال قبل الحفظ
        string encrypted = EncryptString(serial);
        File.WriteAllText(LICENSE_FILE, encrypted);
    }
    
    // قراءة الترخيص المحفوظ
    private static string LoadLicenseLocally()
    {
        if (!File.Exists(LICENSE_FILE))
            return null;
            
        string encrypted = File.ReadAllText(LICENSE_FILE);
        return DecryptString(encrypted);
    }
    
    // تشفير بسيط (يُفضل استخدام AES)
    private static string EncryptString(string text)
    {
        byte[] data = Encoding.UTF8.GetBytes(text);
        return Convert.ToBase64String(data);
    }
    
    private static string DecryptString(string encrypted)
    {
        byte[] data = Convert.FromBase64String(encrypted);
        return Encoding.UTF8.GetString(data);
    }
}

// ============================================
// في نافذة تفعيل البرنامج
// ============================================
public partial class ActivationForm : Form
{
    private async void btnActivate_Click(object sender, EventArgs e)
    {
        string serial = txtSerial.Text.Trim();
        
        if (string.IsNullOrEmpty(serial))
        {
            MessageBox.Show("الرجاء إدخال السيريال", "خطأ");
            return;
        }
        
        btnActivate.Enabled = false;
        btnActivate.Text = "جاري التفعيل...";
        
        var (success, message) = await LicenseManager.ActivateLicense(
            serial, 
            "برنامج المحاسبة Pro v1.0"
        );
        
        btnActivate.Enabled = true;
        btnActivate.Text = "تفعيل";
        
        if (success)
        {
            MessageBox.Show(message, "نجاح", MessageBoxButtons.OK, MessageBoxIcon.Information);
            this.DialogResult = DialogResult.OK;
            this.Close();
        }
        else
        {
            MessageBox.Show(message, "خطأ", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}

// ============================================
// في النافذة الرئيسية للبرنامج (Program.cs)
// ============================================
[STAThread]
static async Task Main()
{
    Application.EnableVisualStyles();
    Application.SetCompatibleTextRenderingDefault(false);
    
    // التحقق من الترخيص عند التشغيل
    bool isLicensed = await LicenseManager.CheckLicense();
    
    if (!isLicensed)
    {
        // عرض نافذة التفعيل
        ActivationForm activationForm = new ActivationForm();
        if (activationForm.ShowDialog() != DialogResult.OK)
        {
            MessageBox.Show("البرنامج غير مفعّل. سيتم الإغلاق.", "تنبيه");
            return; // إغلاق البرنامج
        }
    }
    
    // البرنامج مفعّل، تشغيل النافذة الرئيسية
    Application.Run(new MainForm());
}
```

---

### 2️⃣ إذا برنامجك بلغة **Python**

```python
# ملف: license_manager.py
import requests
import hashlib
import platform
import uuid
import json
import os

SERVER_URL = "http://localhost:8080"
LICENSE_FILE = "license.dat"

def get_device_id():
    """توليد معرف فريد للجهاز"""
    hostname = platform.node()
    mac = hex(uuid.getnode())
    device_str = f"{hostname}-{mac}"
    return hashlib.md5(device_str.encode()).hexdigest()

def activate_license(serial, program_name):
    """تفعيل الترخيص"""
    try:
        data = {
            "serial": serial,
            "programName": program_name,
            "deviceId": get_device_id()
        }
        
        response = requests.post(f"{SERVER_URL}/api/activate", json=data)
        result = response.json()
        
        if result.get("success"):
            # حفظ السيريال محلياً
            save_license_locally(serial)
            return True, "تم تفعيل البرنامج بنجاح!"
        else:
            return False, result.get("message", "خطأ في التفعيل")
            
    except Exception as e:
        return False, f"خطأ في الاتصال: {str(e)}"

def check_license():
    """التحقق من الترخيص"""
    serial = load_license_locally()
    if not serial:
        return False
    
    try:
        data = {
            "serial": serial,
            "deviceId": get_device_id()
        }
        
        response = requests.post(f"{SERVER_URL}/api/check-license", json=data)
        result = response.json()
        
        return result.get("valid", False)
        
    except:
        return False

def save_license_locally(serial):
    """حفظ الترخيص محلياً"""
    with open(LICENSE_FILE, 'w') as f:
        f.write(serial)

def load_license_locally():
    """قراءة الترخيص المحفوظ"""
    if os.path.exists(LICENSE_FILE):
        with open(LICENSE_FILE, 'r') as f:
            return f.read().strip()
    return None

# ============================================
# في برنامجك الرئيسي
# ============================================
if __name__ == "__main__":
    # التحقق من الترخيص
    if not check_license():
        print("البرنامج غير مفعّل!")
        serial = input("أدخل السيريال: ")
        
        success, message = activate_license(serial, "برنامج المحاسبة Python")
        print(message)
        
        if not success:
            exit()
    
    # البرنامج مفعّل، تشغيل البرنامج
    print("✅ البرنامج مفعّل ويعمل الآن!")
    # ... بقية كود برنامجك
```

---

### 3️⃣ إذا برنامجك بلغة **JavaScript/Electron** (تطبيقات Desktop)

```javascript
// ملف: licenseManager.js
const axios = require('axios');
const os = require('os');
const crypto = require('crypto');
const fs = require('fs');

const SERVER_URL = 'http://localhost:8080';
const LICENSE_FILE = 'license.dat';

function getDeviceId() {
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const deviceStr = `${hostname}-${platform}-${arch}`;
    return crypto.createHash('md5').update(deviceStr).digest('hex');
}

async function activateLicense(serial, programName) {
    try {
        const response = await axios.post(`${SERVER_URL}/api/activate`, {
            serial: serial,
            programName: programName,
            deviceId: getDeviceId()
        });

        if (response.data.success) {
            saveLicenseLocally(serial);
            return { success: true, message: 'تم تفعيل البرنامج بنجاح!' };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        return { success: false, message: 'خطأ في الاتصال' };
    }
}

async function checkLicense() {
    const serial = loadLicenseLocally();
    if (!serial) return false;

    try {
        const response = await axios.post(`${SERVER_URL}/api/check-license`, {
            serial: serial,
            deviceId: getDeviceId()
        });

        return response.data.valid === true;
    } catch {
        return false;
    }
}

function saveLicenseLocally(serial) {
    fs.writeFileSync(LICENSE_FILE, serial);
}

function loadLicenseLocally() {
    if (fs.existsSync(LICENSE_FILE)) {
        return fs.readFileSync(LICENSE_FILE, 'utf8').trim();
    }
    return null;
}

module.exports = { activateLicense, checkLicense, getDeviceId };
```

---

## 🔐 إضافة endpoint للتحقق

أضف هذا في `server/routes.ts`:

```typescript
// Check license endpoint (for client apps)
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
        message: "الجهاز غير مطابق",
      });
    }

    res.json({
      valid: true,
      programName: license.program_name,
      activationDate: license.activation_date,
    });
  } catch (error) {
    res.json({ valid: false, message: "خطأ في السيرفر" });
  }
});
```

---

## 🚀 سيناريو الاستخدام الكامل

### السيناريو 1: عميل جديد

```
اليوم 1 - المدير (أنت):
├─ تفتح لوحة التحكم
├─ تولد سيريال: ABCD-1234-EFGH-5678
├─ تكتب ملاحظات: "شركة الأمل - 10 مستخدمين"
└─ ترسل السيريال للعميل عبر Email/WhatsApp

اليوم 1 - العميل:
├─ يحمّل برنامجك ويثبته
├─ يفتح البرنامج لأول مرة
├─ تظهر نافذة التفعيل
├─ يدخل السيريال: ABCD-1234-EFGH-5678
├─ يضغط "تفعيل"
├─ البرنامج يتصل بسيرفرك ويُفعّل
└─ البرنامج يعمل بنجاح! ✅

اليوم 2 - العميل:
├─ يفتح البرنامج مرة أخرى
├─ البرنامج يتحقق تلقائياً من السيرفر
├─ التحقق ناجح
└─ البرنامج يعمل مباشرة ✅

اليوم 2 - المدير (أنت):
├─ تفتح لوحة التحكم
├─ ترى في الجدول:
│  | السيريال | اسم البرنامج | معرف الجهاز | نشط | تاريخ التفعيل |
│  | ABCD-1234 | برنامجي Pro | PC-AHMED-X | ✅   | 2025-10-23     |
└─ يمكنك إضافة ملاحظات أو حذف الترخيص
```

---

## ⚠️ ملاحظات مهمة للأمان

### 1. تشفير الاتصال
في الإنتاج، استخدم **HTTPS** وليس HTTP:
```javascript
const SERVER_URL = 'https://your-domain.com'; // ✅ آمن
// ❌ const SERVER_URL = 'http://your-domain.com'; // غير آمن
```

### 2. حماية السيريال المحفوظ
لا تحفظ السيريال كنص عادي، استخدم تشفير:
```csharp
// ✅ جيد
SaveEncrypted(serial, key);

// ❌ سيء
File.WriteAllText("license.txt", serial);
```

### 3. التحقق الدوري
تحقق من الترخيص كل فترة وليس فقط عند التشغيل:
```csharp
// كل ساعة مثلاً
Timer checkTimer = new Timer(3600000); // 1 hour
checkTimer.Elapsed += async (s, e) => {
    bool valid = await LicenseManager.CheckLicense();
    if (!valid) {
        Application.Exit();
    }
};
```

---

## 📊 المراقبة والإدارة

في لوحة التحكم، يمكنك:

✅ **رؤية جميع التراخيص**: من فعّل؟ متى؟ على أي جهاز؟  
✅ **تعديل الملاحظات**: تتبع العملاء والباقات  
✅ **حذف التراخيص**: إلغاء الترخيص من النظام نهائياً  
✅ **مراقبة الحالة**: أي ترخيص نشط وأيها معطل  

---

## 🎯 الخلاصة

```
[برنامجك] ←→ [API] ←→ [سيرفرك المركزي] ←→ [قاعدة البيانات]
    ↓                                              ↓
[المستخدم]                              [لوحة التحكم (أنت)]
```

**النظام يعمل كالتالي:**
1. أنت تولد السيريال من لوحة التحكم
2. ترسله للعميل
3. العميل يُفعّل برنامجك بالسيريال
4. برنامجك يتصل بسيرفرك للتفعيل
5. سيرفرك يحفظ البيانات ويسمح بالتفعيل
6. في كل مرة يفتح العميل البرنامج، يتحقق من السيرفر

**بهذه الطريقة:**
- ✅ أنت تتحكم في جميع التراخيص
- ✅ لا يمكن نسخ السيريال لأكثر من جهاز
- ✅ يمكنك إلغاء أي ترخيص في أي وقت
- ✅ تعرف كل المعلومات عن كل ترخيص

---

**جاهز للبدء؟** 🚀

