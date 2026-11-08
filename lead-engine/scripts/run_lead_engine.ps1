<#
=============================================================================
Lead Engine Master 1-Click Production Launcher (Windows 11)
Automates environment verification, container boot, healthcheck polling,
and launches the Mission Control Executive Cockpit in your browser
=============================================================================
#>

[CmdletBinding()]
param (
    [int]$HarvesterPort = 8000,
    [int]$N8nPort = 5679,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "   🚀 LEAD ENGINE: CLIENT ACQUISITION STACK BOOTSTRAPPER" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Resolve repository root
$repoRoot = [System.IO.Path]::GetFullPath("$PSScriptRoot\..")
Set-Location -Path $repoRoot

# 2. Verify or initialize .env file
$envPath = Join-Path $repoRoot ".env"
$envExamplePath = Join-Path $repoRoot ".env.example"

if (-not (Test-Path $envPath)) {
    Write-Warning "[SETUP] .env file not detected. Copying from .env.example..."
    Copy-Item -Path $envExamplePath -Destination $envPath
    Write-Host "[SUCCESS] Created initial .env configuration template." -ForegroundColor Green
}

# 3. Check Docker Desktop availability
Write-Host "[CHECK] Verifying Docker Desktop & WSL2 engine..." -NoNewline
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host " [FAILED]" -ForegroundColor Red
        Write-Error "Docker Desktop does not appear to be running. Please start Docker Desktop and re-run this script."
        exit 1
    }
    Write-Host " [ONLINE]" -ForegroundColor Green
} catch {
    Write-Host " [NOT FOUND]" -ForegroundColor Red
    Write-Error "Docker command failed. Ensure Docker Desktop is installed and in your PATH."
    exit 1
}

# 4. Check for Evolution API container
Write-Host "[CHECK] Checking Evolution API WhatsApp Gateway..." -NoNewline
$evoContainer = docker ps --filter "name=evolution_gateway" --format "{{.Names}}" 2>$null
if ($evoContainer) {
    Write-Host " [DETECTED: $evoContainer on port 8080]" -ForegroundColor Green
} else {
    Write-Host " [STANDBY: Evolution API container not running; 1-click wa.me will be used]" -ForegroundColor Yellow
}

# 5. Boot / Rebuild Containers via Docker Compose
Write-Host "`n[DOCKER] Building and launching Lead Engine containers..." -ForegroundColor Cyan
docker compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to launch Docker containers. Check docker-compose logs above."
    exit 1
}

# 6. Wait for Harvester API and PostgreSQL to report healthy
Write-Host "`n[HEALTH] Awaiting service healthcheck convergence..." -NoNewline
$healthy = $false
$targetUrl = "http://localhost:$HarvesterPort/health"

for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    Write-Host "." -NoNewline
    try {
        $resp = Invoke-RestMethod -Uri $targetUrl -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($resp.status -eq "healthy" -or $resp.services.postgres -eq "connected") {
            $healthy = $true
            break
        }
    } catch {
        # Keep waiting
    }
}
Write-Host ""

if ($healthy) {
    Write-Host "[SUCCESS] All Lead Engine microservices converged to healthy state!" -ForegroundColor Green
} else {
    Write-Warning "[WARN] Services are still initializing in the background. Check logs via 'docker compose logs -f'"
}

# 7. Print endpoints & launch Cockpit
$dashboardUrl = "http://localhost:$HarvesterPort/dashboard"
$n8nUrl = "http://localhost:$N8nPort"

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "   🎉 LEAD ENGINE IS READY TO GENERATE & QUALIFY CLIENTS" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "• 🎛️  Mission Control Cockpit:  $dashboardUrl" -ForegroundColor Yellow
Write-Host "• ⚙️  n8n Orchestrator UI:     $n8nUrl" -ForegroundColor White
Write-Host "• 📡 Harvester REST API:       http://localhost:$HarvesterPort" -ForegroundColor White
Write-Host "• 💬 1-Click WhatsApp Direct:  Enabled (instant wa.me pre-filled pitches)" -ForegroundColor Green
Write-Host "======================================================================`n" -ForegroundColor Cyan

if (-not $NoBrowser) {
    Write-Host "[BROWSER] Launching Mission Control Cockpit in your default browser..." -ForegroundColor Cyan
    Start-Process $dashboardUrl
}
