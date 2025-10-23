Write-Host "====================================" -ForegroundColor Cyan
Write-Host "نظام تسجيل الدخول - ArabicWebExpress" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Setting environment variables..." -ForegroundColor Yellow
$env:SESSION_SECRET = "ArabicWebExpress2024SecretKey"
Write-Host "Done." -ForegroundColor Green
Write-Host ""

Write-Host "[2/2] Starting server..." -ForegroundColor Yellow
npm run dev
