@echo off
title Disaster911 Local Server — Watchdog
color 0A
echo ============================================
echo  Disaster911 Local Server — Auto Watchdog
echo  Site: http://localhost:8080
echo ============================================
echo.

:loop
echo [%time%] Checking server...
curl -s -o nul -w "%%{http_code}" http://localhost:8080 > temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
del temp_status.txt 2>nul

if "%STATUS%"=="200" (
    echo [%time%] OK — Server running at http://localhost:8080
) else (
    echo [%time%] SERVER DOWN — Restarting...
    taskkill /f /im python.exe 2>nul
    timeout /t 2 /nobreak >nul
    start /b "" python -m http.server 8080
    timeout /t 3 /nobreak >nul
    echo [%time%] Server restarted.
)

timeout /t 30 /nobreak >nul
goto loop
