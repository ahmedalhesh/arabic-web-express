@echo off
echo ====================================
echo نظام تسجيل الدخول - ArabicWebExpress
echo ====================================
echo.

echo [1/2] Setting environment variables...
set SESSION_SECRET=ArabicWebExpress2024SecretKey
echo Done.
echo.

echo [2/2] Starting server...
npm run dev

pause
