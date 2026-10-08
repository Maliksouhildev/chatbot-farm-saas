$WshShell = New-Object -ComObject WScript.Shell

$desktop = [Environment]::GetFolderPath('Desktop')
$startup = [Environment]::GetFolderPath('Startup')
$targetDir = 'C:\Users\Public\projects\chatbot-farm'

# 1. Desktop Start Shortcut
$startLnkPath = Join-Path $desktop "Start Chatbot Farm.lnk"
$shortcut = $WshShell.CreateShortcut($startLnkPath)
$shortcut.TargetPath = Join-Path $targetDir "START_ALL.bat"
$shortcut.WorkingDirectory = $targetDir
$shortcut.Description = "Start Chatbot Farm, Docker containers, and Web Server"
$shortcut.IconLocation = "shell32.dll, 24" # Play/check/tree or folder icon
$shortcut.Save()
Write-Host "Created Desktop Shortcut: $startLnkPath"

# 2. Desktop Stop Shortcut
$stopLnkPath = Join-Path $desktop "Stop Chatbot Farm.lnk"
$shortcutStop = $WshShell.CreateShortcut($stopLnkPath)
$shortcutStop.TargetPath = Join-Path $targetDir "STOP_ALL.bat"
$shortcutStop.WorkingDirectory = $targetDir
$shortcutStop.Description = "Stop Chatbot Farm Docker containers and Web Server"
$shortcutStop.IconLocation = "shell32.dll, 131" # Red stop/cross icon
$shortcutStop.Save()
Write-Host "Created Desktop Shortcut: $stopLnkPath"

# 3. Windows Startup Auto-Run Shortcut
$startupLnkPath = Join-Path $startup "Start Chatbot Farm.lnk"
$shortcutAuto = $WshShell.CreateShortcut($startupLnkPath)
$shortcutAuto.TargetPath = Join-Path $targetDir "START_ALL.bat"
$shortcutAuto.WorkingDirectory = $targetDir
$shortcutAuto.Description = "Automatically launch Chatbot Farm on Windows restart"
$shortcutAuto.IconLocation = "shell32.dll, 24"
$shortcutAuto.Save()
Write-Host "Created Windows Startup Shortcut: $startupLnkPath"
