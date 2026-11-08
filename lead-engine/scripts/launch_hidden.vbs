Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "D:\antigravity\bot farm\lead-engine\scripts\background_boot.ps1"", 0, False
