@echo off
echo ===============================================
echo  E-Commerce Platform - Frontend Starter
echo ===============================================
echo.

echo Checking if backend services are running...
curl -s http://localhost:8761 >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Eureka Server is not responding!
    echo Please start backend services first using:
    echo   App\catalogue-service\start-all-services.bat
    echo.
    choice /C YN /M "Do you want to continue anyway"
    if errorlevel 2 exit /b
)

echo.
echo [OK] Backend services appear to be running
echo.

echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo.
echo Starting React development server...
echo The application will open at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start

