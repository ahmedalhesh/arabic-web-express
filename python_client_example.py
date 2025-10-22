#!/usr/bin/env python3
"""
مثال على استخدام Python Client للتحقق من التراخيص
Example Python Client for License Verification
"""

import requests
import platform
import hashlib

def get_device_id():
    """الحصول على معرف فريد للجهاز"""
    # استخدام اسم الجهاز + معلومات النظام لإنشاء معرف فريد
    device_info = f"{platform.node()}-{platform.system()}-{platform.machine()}"
    return hashlib.md5(device_info.encode()).hexdigest()

def check_license(serial_number, api_url="http://localhost:5000"):
    """
    التحقق من الترخيص وتفعيله
    
    Args:
        serial_number: رقم السيريال الذي حصل عليه المستخدم
        api_url: عنوان API الخاص بالخادم
    
    Returns:
        dict: معلومات الترخيص الكاملة
    """
    device_id = get_device_id()
    
    # إرسال طلب للتحقق من الترخيص
    response = requests.get(
        f"{api_url}/api/check",
        params={
            "serial": serial_number,
            "device": device_id
        }
    )
    
    if response.status_code != 200:
        return {
            "success": False,
            "error": "فشل الاتصال بالخادم"
        }
    
    data = response.json()
    return data

def main():
    """مثال على الاستخدام"""
    
    # السيريال الذي حصل عليه المستخدم من المسؤول
    # المستخدم يحتاج فقط إلى السيريال - كل شيء آخر يأتي من الخادم
    serial = input("أدخل رقم السيريال: ")
    
    print("\n🔍 جاري التحقق من الترخيص...")
    
    # التحقق من الترخيص
    result = check_license(serial)
    
    print("\n" + "="*50)
    
    if result.get("found"):
        print(f"✅ تم العثور على الترخيص")
        print(f"📦 اسم البرنامج: {result.get('program_name', 'غير محدد')}")
        print(f"📋 الحالة: {result.get('status', 'غير محدد')}")
        print(f"🔑 السيريال: {result.get('serial_number', 'غير محدد')}")
        
        if result.get("valid"):
            print(f"✅ الترخيص صالح ونشط")
            print(f"💻 رقم الجهاز: {result.get('device_id', 'غير محدد')}")
            
            if result.get('activation_date'):
                print(f"📅 تاريخ التفعيل: {result.get('activation_date')}")
            
            print("\n🎉 يمكنك استخدام البرنامج الآن!")
            return True
        else:
            print(f"❌ الترخيص غير صالح")
            if result.get('status') == "الجهاز غير مطابق":
                print(f"⚠️  هذا الترخيص مفعّل على جهاز آخر")
                print(f"💻 الجهاز المفعّل: {result.get('device_id', 'غير محدد')}")
            return False
    else:
        print(f"❌ لم يتم العثور على الترخيص")
        print(f"📋 {result.get('status', 'غير موجود')}")
        return False
    
    print("="*50 + "\n")

if __name__ == "__main__":
    main()
