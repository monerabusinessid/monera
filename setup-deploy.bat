@echo off
echo.
echo ================================
echo Monera - Quick Deployment Setup
echo ================================
echo.

REM Check if .env exists
if exist .env (
    echo WARNING: .env file already exists!
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo.
        echo Deployment cancelled
        exit /b 1
    )
)

REM Copy .env.example to .env
echo Creating .env file...
copy .env.example .env >nul

echo.
echo .env file created successfully!
echo.
echo ========================================
echo IMPORTANT: Edit .env file and update:
echo ========================================
echo 1. DATABASE_URL (Supabase connection)
echo 2. NEXT_PUBLIC_SUPABASE_URL
echo 3. SUPABASE_SERVICE_ROLE_KEY
echo 4. JWT_SECRET (random 32 characters)
echo 5. SMTP credentials
echo 6. NEXT_PUBLIC_SITE_URL (your domain)
echo.
echo See CLOUDFLARE_DEPLOY.md for full guide
echo.
echo Next steps:
echo 1. Edit .env with your values
echo 2. Test: npm run dev
echo 3. Push: git push origin main
echo 4. Deploy on Cloudflare Pages
echo.
pause
