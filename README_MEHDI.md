# Chatbot Farm - Quick Start for Mehdi

## Project Location
All files are here: C:\Users\Public\projects\chatbot-farm

## How to Start the Website
Double-click: START_WEBSITE.bat
Then open your browser at: http://localhost:3000

## How to Start Docker Containers (n8n etc.)
Double-click: START_DOCKER.bat
n8n will be available at: http://localhost:5678

## How to Stop Docker
Double-click: STOP_DOCKER.bat

## How to Edit the Website Code
Open VS Code and open this folder:
C:\Users\Public\projects\chatbot-farm\saas-web

## n8n Workflows (n8n-as-code)
Open PowerShell and run:
  cd C:\Users\mlkme\.antigravity
  npx --yes n8nac env status --json

## Notes
- Both mlkme and mehdi have full access to all files
- Both accounts are in the docker-users group
- No admin rights needed to run the dev server or Docker

