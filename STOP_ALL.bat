@echo off
title Chatbot Farm - Stop All Services
color 0C
echo ======================================================================
echo                  STOPPING CHATBOT FARM SERVICES                       
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/2] Stopping Docker Containers (Evolution, Postgres, Redis)...
docker compose stop
echo Containers stopped.
echo.

echo [2/2] Stopping Next.js Web Server process on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Terminating process PID %%a listening on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)
echo Web server stopped.
echo.

echo ======================================================================
echo                ALL CHATBOT FARM SERVICES HAVE BEEN STOPPED            
echo ======================================================================
echo.
pause
