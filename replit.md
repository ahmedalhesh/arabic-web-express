# نظام إدارة تراخيص البرامج

## نظرة عامة
تطبيق ويب عربي بالكامل لإدارة تراخيص البرامج مع واجهة API للتحقق من التراخيص.

## المميزات الرئيسية
- واجهة عربية كاملة مع دعم RTL
- نظام تسجيل دخول آمن للمسؤول
- إدارة كاملة للتراخيص (إضافة، تعديل، حذف، بحث)
- لوحة تحكم احترافية مع إحصائيات
- واجهة API للتحقق من التراخيص (للبرامج المكتوبة بـ Python)
- قاعدة بيانات SQLite للتخزين
- دعم الوضع الليلي/النهاري

## التقنيات المستخدمة
### Frontend
- React 18 with TypeScript
- TailwindCSS for styling
- Shadcn/ui components
- TanStack Query for data fetching
- Wouter for routing
- Cairo font for Arabic text

### Backend
- Express.js with TypeScript
- SQLite3 database
- JWT authentication
- bcryptjs for password hashing

## البنية
```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components (Login, Dashboard)
│   │   └── lib/         # Utilities and helpers
├── server/              # Backend Express application
│   ├── auth.ts          # Authentication logic
│   ├── routes.ts        # API endpoints
│   └── storage.ts       # SQLite database operations
├── shared/              # Shared TypeScript schemas
│   └── schema.ts        # Zod schemas for validation
└── database.db          # SQLite database file
```

## بيانات تسجيل الدخول
- **اسم المستخدم**: aalhesh
- **كلمة المرور**: ah123m123ed

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### License Management (Protected)
- `GET /api/licenses` - Get all licenses
- `POST /api/licenses` - Create new license
- `PUT /api/licenses/:serial` - Update license
- `DELETE /api/licenses/:serial` - Delete license

### License Verification (Public)
- `GET /api/check?serial=XXXXX&device=YYYYY` - Verify license for Python clients

## قاعدة البيانات
### جدول licenses
| Field | Type | Description |
|-------|------|-------------|
| serial_number | TEXT PRIMARY KEY | رقم السيريال الفريد (يُدخل يدوياً) |
| program_name | TEXT | اسم البرنامج |
| active | INTEGER (BOOLEAN) | حالة التفعيل (تُملأ تلقائياً عند التفعيل) |
| device_id | TEXT | معرف الجهاز (يُملأ تلقائياً عند التفعيل) |
| activation_date | TEXT | تاريخ التفعيل (يُملأ تلقائياً عند التفعيل) |
| status | TEXT | الحالة (صالح، منتهي، موقوف، غير مفعّل) |
| notes | TEXT | ملاحظات إضافية |

### آلية التفعيل التلقائي
- عند إضافة ترخيص جديد، يتم إدخال رقم السيريال واسم البرنامج فقط
- الحقول (active, device_id, activation_date) تُملأ تلقائياً عند أول استدعاء لـ API /api/check مع device ID
- بمجرد تفعيل الترخيص على جهاز معين، لا يمكن تفعيله على جهاز آخر

## تنسيق التاريخ
يتم عرض التواريخ بتنسيق DD/MM/YYYY (مثل: 22/10/2025)

## التشغيل
```bash
npm run dev
```

يعمل التطبيق على المنفذ 5000 (frontend + backend على نفس المنفذ).

## Last Updated
October 22, 2025
