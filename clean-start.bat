@echo off
echo Cleaning Next.js cache...

taskkill /F /IM node.exe 2>nul

if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo Cache cleared!
echo Starting dev server...

npm run dev
