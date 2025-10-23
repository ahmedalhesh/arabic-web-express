# 📡 دليل استخدام API للمستخدمين النهائيين

هذا الملف يوضح كيفية تفعيل البرنامج من جانب المستخدم النهائي.

## 🔑 تفعيل البرنامج

عندما يحصل المستخدم على سيريال من المدير، يمكنه تفعيل برنامجه كالتالي:

### باستخدام cURL

```bash
curl -X POST http://localhost:8080/api/activate \
  -H "Content-Type: application/json" \
  -d '{
    "serial": "ABCD-1234-EFGH-5678",
    "programName": "برنامج المحاسبة Pro",
    "deviceId": "PC-AHMED-2024"
  }'
```

### باستخدام Python

```python
import requests
import hashlib
import platform

def get_device_id():
    """توليد معرف فريد للجهاز"""
    hostname = platform.node()
    mac = hex(uuid.getnode())
    device_str = f"{hostname}-{mac}"
    return hashlib.md5(device_str.encode()).hexdigest()

def activate_license(serial, program_name):
    """تفعيل الترخيص"""
    url = "http://localhost:8080/api/activate"
    
    data = {
        "serial": serial,
        "programName": program_name,
        "deviceId": get_device_id()
    }
    
    try:
        response = requests.post(url, json=data)
        result = response.json()
        
        if result.get("success"):
            print("✅ تم تفعيل البرنامج بنجاح!")
            print(f"اسم البرنامج: {result['license']['program_name']}")
            print(f"معرف الجهاز: {result['license']['device_id']}")
            print(f"تاريخ التفعيل: {result['license']['activation_date']}")
            return True
        else:
            print(f"❌ خطأ: {result.get('message')}")
            return False
            
    except Exception as e:
        print(f"❌ خطأ في الاتصال: {e}")
        return False

# مثال على الاستخدام
if __name__ == "__main__":
    serial = input("أدخل السيريال: ")
    program = input("أدخل اسم البرنامج: ")
    activate_license(serial, program)
```

### باستخدام JavaScript/Node.js

```javascript
const axios = require('axios');
const os = require('os');
const crypto = require('crypto');

function getDeviceId() {
    // توليد معرف فريد للجهاز
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const deviceStr = `${hostname}-${platform}-${arch}`;
    return crypto.createHash('md5').update(deviceStr).digest('hex');
}

async function activateLicense(serial, programName) {
    try {
        const response = await axios.post('http://localhost:8080/api/activate', {
            serial: serial,
            programName: programName,
            deviceId: getDeviceId()
        });

        if (response.data.success) {
            console.log('✅ تم تفعيل البرنامج بنجاح!');
            console.log('اسم البرنامج:', response.data.license.program_name);
            console.log('معرف الجهاز:', response.data.license.device_id);
            console.log('تاريخ التفعيل:', response.data.license.activation_date);
            return true;
        } else {
            console.log('❌ خطأ:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ خطأ في الاتصال:', error.message);
        return false;
    }
}

// مثال على الاستخدام
activateLicense('ABCD-1234-EFGH-5678', 'برنامج المحاسبة Pro');
```

### باستخدام C#

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Management;

public class LicenseActivator
{
    private static readonly HttpClient client = new HttpClient();
    
    public static string GetDeviceId()
    {
        // توليد معرف فريد للجهاز
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
        return "";
    }
    
    private static string GetMotherboardId()
    {
        ManagementClass mc = new ManagementClass("Win32_BaseBoard");
        ManagementObjectCollection moc = mc.GetInstances();
        foreach (ManagementObject mo in moc)
        {
            return mo.Properties["SerialNumber"].Value.ToString();
        }
        return "";
    }
    
    public static async Task<bool> ActivateLicense(string serial, string programName)
    {
        try
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
                "http://localhost:8080/api/activate", 
                content
            );
            
            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseString);
            
            if (result.GetProperty("success").GetBoolean())
            {
                Console.WriteLine("✅ تم تفعيل البرنامج بنجاح!");
                var license = result.GetProperty("license");
                Console.WriteLine($"اسم البرنامج: {license.GetProperty("program_name").GetString()}");
                Console.WriteLine($"معرف الجهاز: {license.GetProperty("device_id").GetString()}");
                Console.WriteLine($"تاريخ التفعيل: {license.GetProperty("activation_date").GetString()}");
                return true;
            }
            else
            {
                Console.WriteLine($"❌ خطأ: {result.GetProperty("message").GetString()}");
                return false;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ خطأ في الاتصال: {ex.Message}");
            return false;
        }
    }
    
    public static async Task Main(string[] args)
    {
        Console.Write("أدخل السيريال: ");
        string serial = Console.ReadLine();
        
        Console.Write("أدخل اسم البرنامج: ");
        string program = Console.ReadLine();
        
        await ActivateLicense(serial, program);
    }
}
```

## 📋 معلمات التفعيل

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `serial` | string | ✅ | السيريال الذي حصل عليه المستخدم من المدير |
| `programName` | string | ✅ | اسم البرنامج الذي يتم تفعيله |
| `deviceId` | string | ✅ | معرف فريد للجهاز (يُنشأ تلقائياً) |

## ✅ الاستجابة الناجحة

```json
{
  "success": true,
  "message": "تم تفعيل الترخيص بنجاح",
  "license": {
    "serial_number": "ABCD-1234-EFGH-5678",
    "program_name": "برنامج المحاسبة Pro",
    "device_id": "a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8",
    "active": 1,
    "activation_date": "2025-10-23T17:45:00.000Z",
    "notes": "العميل أحمد"
  }
}
```

## ❌ الأخطاء المحتملة

### السيريال غير موجود
```json
{
  "success": false,
  "message": "السيريال غير موجود"
}
```

### السيريال مفعّل بالفعل
```json
{
  "success": false,
  "message": "السيريال مفعّل بالفعل"
}
```

### حقول مفقودة
```json
{
  "success": false,
  "message": "جميع الحقول مطلوبة"
}
```

## 💡 نصائح هامة

1. **معرف الجهاز**: 
   - يجب أن يكون فريداً لكل جهاز
   - يُنصح باستخدام معلومات الهاردوير (CPU ID، MAC Address، إلخ)
   - احفظ المعرف لاستخدامه في التحقق اللاحق

2. **السيريال**:
   - كل سيريال يُستخدم مرة واحدة فقط
   - لا يمكن تفعيل نفس السيريال على جهاز آخر
   - تأكد من صحة السيريال قبل المحاولة

3. **اسم البرنامج**:
   - استخدم اسماً واضحاً ومميزاً
   - يُستخدم لتتبع البرامج المختلفة
   - يمكن أن يكون بالعربية أو الإنجليزية

## 🔒 الأمان

- الـ API عام ولا يتطلب مصادقة للتفعيل
- لكن السيريال يجب أن يكون صالحاً وموجوداً
- كل سيريال مرتبط بجهاز واحد فقط
- لا يمكن إعادة تفعيل السيريال بعد التفعيل الأول

---

Made with ❤️ for ArabicWebExpress

