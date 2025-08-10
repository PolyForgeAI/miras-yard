@echo off
echo Starting local server for Mira's Yard...
echo.

REM Try Python 3 first
python -c "import http.server; print('Python 3 found')" 2>nul
if %errorlevel% == 0 (
    echo Using Python 3...
    python -m http.server 8000
    goto :end
)

REM Try Python 2
python -c "import SimpleHTTPServer; print('Python 2 found')" 2>nul
if %errorlevel% == 0 (
    echo Using Python 2...
    python -m SimpleHTTPServer 8000
    goto :end
)

REM Try Node.js
where node >nul 2>nul
if %errorlevel% == 0 (
    echo Using Node.js...
    npx http-server -p 8000 -c-1
    goto :end
)

echo.
echo ERROR: No server available!
echo Please install Python or Node.js to run a local server.
echo.
echo Alternatives:
echo 1. Install Python: https://python.org
echo 2. Install Node.js: https://nodejs.org
echo 3. Use VS Code Live Server extension
echo.
pause

:end