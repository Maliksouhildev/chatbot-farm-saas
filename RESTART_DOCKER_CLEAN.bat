@echo off
title Chatbot Farm - Clean Docker Restarter
echo =======================================================
echo   Chatbot Farm - Clean Docker Restarter (Admin Fix)
echo =======================================================
echo.
echo Terminating hung Docker backend processes and services...
echo.

:: Request elevation if not running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges to clear hung Docker kernel handles...
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo [1/4] Killing stale Docker backend processes...
taskkill /F /IM com.docker.backend.exe >nul 2>&1
taskkill /F /IM "Docker Desktop.exe" >nul 2>&1
taskkill /F /IM docker.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Starting Docker Desktop Service...
net start com.docker.service >nul 2>&1

echo [3/4] Launching Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
echo Waiting 15 seconds for Docker engine to initialize...
timeout /t 15 /nobreak

echo [4/4] Starting Chatbot Farm Docker containers...
cd /d "C:\Users\Public\projects\chatbot-farm"
docker compose up -d

echo.
echo =======================================================
echo   Status of Containers:
echo =======================================================
docker compose ps
echo.
echo Everything is restarted! You can now use the website.
pause
