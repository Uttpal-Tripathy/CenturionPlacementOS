@echo off
setlocal
cd /d "%~dp0"

echo Starting Centurion PlacementOS...
echo.

rem --- Start the SQL API server (port 4000), if not already running ---
powershell -NoProfile -Command "try { Invoke-WebRequest -Uri http://localhost:4000/health -TimeoutSec 2 -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo Starting API server on port 4000...
    start "PlacementOS API (port 4000)" "%~dp0sql-backend\start-api.bat"
) else (
    echo API server already running on port 4000.
)

rem --- Start the static app server (port 8080), if not already running ---
powershell -NoProfile -Command "try { Invoke-WebRequest -Uri http://localhost:8080/ -TimeoutSec 2 -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo Starting app server on port 8080...
    start "PlacementOS App (port 8080)" "%~dp0start-app.bat"
) else (
    echo App server already running on port 8080.
)

echo.
echo Waiting for servers to come up...
timeout /t 4 /nobreak >nul

echo Opening http://localhost:8080/ in your browser...
start "" "http://localhost:8080/"

echo.
echo Done. Two server windows are running in the background - closing them stops the app.
echo You can re-run this file (or the desktop shortcut) anytime to relaunch.
pause
