@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ========================================================
echo    SINCRONIZADOR DE MAPAS MENTALES (DRIVE - GITHUB)
echo ========================================================
echo.
node scripts/sync-mapas.js
echo.
pause
