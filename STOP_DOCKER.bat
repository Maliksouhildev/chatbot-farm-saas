@echo off
echo ============================================
echo  Chatbot Farm - Stopping Docker Containers
echo ============================================
cd /d "%~dp0"
docker compose down
echo Done.
pause
