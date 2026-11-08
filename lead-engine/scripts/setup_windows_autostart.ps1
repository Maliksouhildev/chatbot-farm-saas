# =============================================================================
# Lead Engine Windows 11 Autostart Provisioning Script
# Configures the Lead Engine to start silently whenever the PC turns on
# Creates:
# 1. Windows Task Scheduler job: "LeadEngine_AutoBoot" (triggers at user logon)
# 2. Windows Startup folder fallback shortcut (silent invisible VBS wrapper)
# =============================================================================

$ErrorActionPreference = "Continue"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$BootScript = Join-Path $ScriptDir "background_boot.ps1"
$TaskName = "LeadEngine_AutoBoot"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Configuring Windows 11 Silent Autostart for Lead Engine..." -ForegroundColor Cyan
Write-Host "Target Boot Script: $BootScript" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# 1. Register Scheduled Task via Task Scheduler
# -----------------------------------------------------------------------------
$taskRegistered = $false
try {
    # Check if task already exists
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "Existing scheduled task '$TaskName' detected. Updating..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    }

    $Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$BootScript`""
    $Trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
    $Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 24)

    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "Autostarts Lead Engine background service with zero-memory idle profile on Windows logon." | Out-Null
    
    $check = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($check) {
        Write-Host "[SUCCESS] Windows Scheduled Task '$TaskName' registered successfully!" -ForegroundColor Green
        $taskRegistered = $true
    }
} catch {
    Write-Host "[WARNING] Could not register via Task Scheduler (may require elevated admin privileges): $_" -ForegroundColor Yellow
}

# -----------------------------------------------------------------------------
# 2. Setup Silent VBScript Fallback in Startup Directory (shell:startup)
# -----------------------------------------------------------------------------
$StartupDir = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Startup)
$VbsWrapper = Join-Path $ScriptDir "launch_hidden.vbs"

# VBScript creates a truly 100% invisible process (WindowStyle 0) with no black terminal flash
$VbsContent = @"
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$BootScript`"", 0, False
"@

Set-Content -Path $VbsWrapper -Value $VbsContent -Encoding ASCII

# Create shortcut in Startup folder pointing to VBScript
$WshShell = New-Object -ComObject WScript.Shell
$ShortcutPath = Join-Path $StartupDir "LeadEngine_Boot.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$VbsWrapper`""
$Shortcut.WorkingDirectory = $ProjectRoot
$Shortcut.Description = "Lead Engine Background Silent Auto-Starter"
$Shortcut.Save()

Write-Host "[SUCCESS] Windows Startup Folder shortcut registered at:" -ForegroundColor Green
Write-Host "  $ShortcutPath" -ForegroundColor Gray
Write-Host "  Points to invisible launcher: $VbsWrapper" -ForegroundColor Gray

Write-Host "`n[COMPLETED] Autostart configuration complete!" -ForegroundColor Cyan
Write-Host "• The Lead Engine will now start automatically whenever your PC boots." -ForegroundColor White
Write-Host "• It operates in dormant standby (<200MB RAM, 0% CPU) until you send a message." -ForegroundColor White
Write-Host "• To test immediately, run: powershell.exe -ExecutionPolicy Bypass -File `"$BootScript`"" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
