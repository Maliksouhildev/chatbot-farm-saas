@echo off
echo ============================================
echo  Chatbot Farm - Website Dev Server
echo ============================================
cd /d "%~dp0saas-web"
echo Installing dependencies if needed...
call npm install
echo.
echo Starting website on http://localhost:3000 ...
echo Press Ctrl+C to stop.
echo.
start http://localhost:3000
npm run dev
pause
