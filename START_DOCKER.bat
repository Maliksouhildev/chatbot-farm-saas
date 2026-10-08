@echo off
echo ============================================
echo  Chatbot Farm - Docker Containers
echo ============================================
cd /d "%~dp0"
echo Starting all Docker containers...
docker compose up -d
echo.
echo Containers started! Check status:
docker compose ps
echo.
pause
