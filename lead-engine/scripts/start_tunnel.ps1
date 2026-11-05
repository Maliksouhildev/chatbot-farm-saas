<#
=============================================================================
Lead Engine Windows 11 PowerShell Tunneling & Webhook Sync Script
Launches ngrok tunnel, queries the local API, and updates .env WEBHOOK_URL
=============================================================================
#>

[CmdletBinding()]
param (
    [int]$N8nPort = 5678,
    [int]$HarvesterPort = 8000,
    [string]$EnvFilePath = "$PSScriptRoot\..\.env"
)

$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Lead Engine - Automated Tunnel & Webhook Sync (Windows 11)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Verify ngrok CLI is available
$ngrokCmd = Get-Command "ngrok" -ErrorAction SilentlyContinue
if (-not $ngrokCmd) {
    Write-Warning "ngrok CLI is not detected in your system PATH."
    Write-Host "Please install ngrok via winget or download from https://ngrok.com/download:" -ForegroundColor Yellow
    Write-Host "  winget install ngrok.ngrok" -ForegroundColor Green
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# 2. Check if ngrok is already running on port 4040
$existingTunnel = $null
try {
    $existingResponse = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($existingResponse.tunnels.Count -gt 0) {
        $existingTunnel = $existingResponse.tunnels[0].public_url
        Write-Host "[INFO] Detected existing active ngrok tunnel: $existingTunnel" -ForegroundColor Green
    }
} catch {
    # No existing instance running
}

if (-not $existingTunnel) {
    Write-Host "[INFO] Launching ngrok tunnel for n8n on port $N8nPort..." -ForegroundColor Cyan
    $process = Start-Process -FilePath "ngrok" -ArgumentList "http $N8nPort --log=stdout" -PassThru -WindowStyle Minimized

    Write-Host "[INFO] Waiting for ngrok API to initialize..." -NoNewline
    $publicUrl = $null
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Seconds 1
        Write-Host "." -NoNewline
        try {
            $resp = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($resp.tunnels -and $resp.tunnels.Count -gt 0) {
                # Find the HTTPS tunnel
                $httpsTunnel = $resp.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
                if ($httpsTunnel) {
                    $publicUrl = $httpsTunnel.public_url
                } else {
                    $publicUrl = $resp.tunnels[0].public_url
                }
                break
            }
        } catch {
            # Continue waiting
        }
    }
    Write-Host ""
} else {
    $publicUrl = $existingTunnel
}

if (-not $publicUrl) {
    Write-Error "[ERROR] Could not retrieve public tunnel URL from http://127.0.0.1:4040/api/tunnels"
    exit 1
}

Write-Host "`n[SUCCESS] Public Tunnel Established:" -ForegroundColor Green
Write-Host "  Public HTTPS URL: " -NoNewline
Write-Host $publicUrl -ForegroundColor Yellow -BackgroundColor Black

# 3. Synchronize with .env file
$resolvedEnv = [System.IO.Path]::GetFullPath($EnvFilePath)
if (Test-Path $resolvedEnv) {
    Write-Host "`n[INFO] Updating WEBHOOK_URL in: $resolvedEnv" -ForegroundColor Cyan
    $content = Get-Content -Path $resolvedEnv -Raw

    if ($content -match "WEBHOOK_URL=.*") {
        $updated = $content -replace "WEBHOOK_URL=.*", "WEBHOOK_URL=$publicUrl/"
    } else {
        $updated = $content + "`nWEBHOOK_URL=$publicUrl/`n"
    }

    Set-Content -Path $resolvedEnv -Value $updated -NoNewline
    Write-Host "[SUCCESS] .env file successfully synchronized with new tunnel URL." -ForegroundColor Green
} else {
    Write-Warning "[WARN] .env file not found at $resolvedEnv. Creating new template..."
    Set-Content -Path $resolvedEnv -Value "WEBHOOK_URL=$publicUrl/`n"
}

# 4. Print Webhook URLs for Quick Configuration
Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "  ACTIVE WEBHOOK ENDPOINTS FOR N8N & TELEGRAM" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "• Lead Ingestion Webhook:" -ForegroundColor White
Write-Host "  $publicUrl/webhook/lead-ingestion" -ForegroundColor Yellow
Write-Host "• Telegram HITL Callback Webhook:" -ForegroundColor White
Write-Host "  $publicUrl/webhook/telegram-hitl-trigger" -ForegroundColor Yellow
Write-Host "• Omnichannel Outreach Dispatch Webhook:" -ForegroundColor White
Write-Host "  $publicUrl/webhook/dispatch-outreach" -ForegroundColor Yellow
Write-Host "• Harvester API (Local):" -ForegroundColor White
Write-Host "  http://localhost:$HarvesterPort" -ForegroundColor Yellow
Write-Host "======================================================================`n" -ForegroundColor Cyan

Write-Host "Press Ctrl+C to terminate the tunnel session..." -ForegroundColor Gray
try {
    while ($true) {
        Start-Sleep -Seconds 5
    }
} finally {
    if ($process -and -not $process.HasExited) {
        Write-Host "`nStopping ngrok process..." -ForegroundColor Yellow
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
}
