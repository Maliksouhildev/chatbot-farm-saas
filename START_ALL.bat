@echo off
title Chatbot Farm - Master Startup Launcher
color 0B
echo ======================================================================
echo             CHATBOT FARM - FULL SYSTEM AUTO-LAUNCHER                  
echo ======================================================================
echo.

cd /d "%~dp0"

:: ----------------------------------------------------------------------
:: STEP 1: Verify and Launch Docker Desktop if not running
:: ----------------------------------------------------------------------
echo [1/4] Checking Docker Desktop status...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker daemon is not running. Launching Docker Desktop...
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    ) else (
        echo Warning: Docker Desktop executable not found at standard path.
    )

    echo Waiting for Docker engine to initialize...
    :WAIT_DOCKER
    timeout /t 3 /nobreak >nul
    docker info >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        <nul set /p=.
        goto WAIT_DOCKER
    )
    echo.
    echo Docker Desktop is now running and ready!
) else (
    echo Docker Desktop is already running.
)
echo.

:: ----------------------------------------------------------------------
:: STEP 2: Start Required Docker Containers (Evolution, Postgres, Redis, n8n)
:: ----------------------------------------------------------------------
echo [2/4] Starting Docker Containers...
echo Running docker compose up -d for Evolution API, Postgres, and Redis...
docker compose up -d

echo Checking for n8n workflow containers...
docker start ai_clipper-n8n-1 ai_clipper-qdrant-1 n8n_redis >nul 2>&1

echo.
echo Active Containers Status:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

:: ----------------------------------------------------------------------
:: STEP 3: Start SaaS Web Server (Next.js on Port 3000)
:: ----------------------------------------------------------------------
echo [3/4] Checking Chatbot Farm Web App on http://localhost:3000 ...

curl.exe -s -o nul -w "%%{http_code}" http://127.0.0.1:3000 | findstr "200 304" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Web App server is already running on http://localhost:3000.
) else (
    echo Launching Next.js Dev Server in background window...
    start "Chatbot Farm Web Server" cmd /k "cd /d %~dp0saas-web && npm run dev"
    
    echo Waiting for Web App to compile and become available...
    :WAIT_WEB
    timeout /t 2 /nobreak >nul
    curl.exe -s -o nul -w "%%{http_code}" http://127.0.0.1:3000 | findstr "200 304" >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        <nul set /p=.
        goto WAIT_WEB
    )
    echo.
    echo Web App is ready on http://localhost:3000!
)
echo.

:: ----------------------------------------------------------------------
:: STEP 4: Open Browser and Display Summary
:: ----------------------------------------------------------------------
echo [4/4] Opening Chatbot Farm Dashboard in your default browser...
start http://localhost:3000

echo.
echo ======================================================================
echo                  ALL CHATBOT FARM SERVICES ARE LIVE!                  
echo ======================================================================
echo   * Main Web Dashboard : http://localhost:3000
echo   * Evolution API (v2) : http://localhost:8080
echo   * n8n Automation     : http://localhost:5678
echo   * PostgreSQL DB      : localhost:5432 (evolution)
echo   * Redis Cache        : localhost:6379
echo ======================================================================
echo.
echo You can keep this window open or close it. Everything is running.
echo To stop all services at any time, run STOP_ALL.bat or use the Stop shortcut.
echo.
pause
