# =============================================================================
# Lead Engine Windows 11 Autostart Uninstallation Script
# Removes the Task Scheduler task and Startup directory shortcuts
# =============================================================================

$ErrorActionPreference = "Continue"

$TaskName = "LeadEngine_AutoBoot"
$StartupDir = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Startup)
$ShortcutPath = Join-Path $StartupDir "LeadEngine_Boot.lnk"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VbsWrapper = Join-Path $ScriptDir "launch_hidden.vbs"

Write-Host "Removing Lead Engine Windows 11 Autostart configurations..." -ForegroundColor Cyan

# 1. Unregister Scheduled Task
try {
    $existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existing) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "[SUCCESS] Unregistered Windows Scheduled Task '$TaskName'." -ForegroundColor Green
    } else {
        Write-Host "Scheduled task '$TaskName' was not found." -ForegroundColor Gray
    }
} catch {
    Write-Host "Warning removing scheduled task: $_" -ForegroundColor Yellow
}

# 2. Remove Startup shortcut
if (Test-Path $ShortcutPath) {
    Remove-Item -Path $ShortcutPath -Force
    Write-Host "[SUCCESS] Removed Startup folder shortcut: $ShortcutPath" -ForegroundColor Green
}

# 3. Remove VBS wrapper
if (Test-Path $VbsWrapper) {
    Remove-Item -Path $VbsWrapper -Force
    Write-Host "[SUCCESS] Cleaned up $VbsWrapper" -ForegroundColor Green
}

Write-Host "`nLead Engine autostart has been completely uninstalled." -ForegroundColor Green
