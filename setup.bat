@echo off
echo 🚀 Setting up Monera Talent Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if .env file exists
if not exist .env (
    echo ⚙️ Creating .env file from template...
    copy .env.example .env
    echo 📝 Please edit .env file with your database credentials
) else (
    echo ✅ .env file already exists
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npm run db:generate

echo.
echo 🎉 Setup complete! Here's what you can do next:
echo.
echo 📋 Available commands:
echo    npm run dev          - Start development server
echo    npm run build        - Build for production
echo    npm run db:studio    - Open Prisma Studio
echo    npm run seed:demo    - Seed demo accounts
echo.
echo 🌐 URLs (after starting dev server):
echo    http://localhost:3001         - Main application
echo    http://localhost:3001/admin   - Admin panel
echo    http://localhost:3001/talent  - Talent dashboard
echo    http://localhost:3001/client  - Client dashboard
echo.
echo 🚀 Ready to start? Run: npm run dev
pause