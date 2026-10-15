@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ========================================================
echo    OBSERVADOR EN TIEMPO REAL (DRIVE - GITHUB)
echo ========================================================
echo.
node scripts/sync-mapas.js --watch
pause
