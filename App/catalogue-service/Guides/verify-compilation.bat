@echo off
echo ========================================
echo Verification de la Compilation
echo ========================================
echo.

echo [1/6] Compilation du Config Server...
cd config-server
call mvn clean compile -q
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Config Server - ECHEC
    cd ..
    pause
    exit /b 1
)
echo [OK] Config Server - SUCCESS
cd ..
echo.

echo [2/6] Compilation de l'Eureka Server...
cd eureka-server
call mvn clean compile -q
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Eureka Server - ECHEC
    cd ..
    pause
    exit /b 1
)
echo [OK] Eureka Server - SUCCESS
cd ..
echo.

echo [3/6] Compilation de l'API Gateway...
cd api-gateway
call mvn clean compile -q
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] API Gateway - ECHEC
    cd ..
    pause
    exit /b 1
)
echo [OK] API Gateway - SUCCESS
cd ..
echo.

echo [4/6] Compilation du Category Service...
cd category-service
call mvn clean compile -q
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Category Service - ECHEC
    cd ..
    pause
    exit /b 1
)
echo [OK] Category Service - SUCCESS
cd ..
echo.

echo [5/6] Compilation du Product Service...
cd product-service
call mvn clean compile -q
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Product Service - ECHEC
    cd ..
    pause
    exit /b 1
)
echo [OK] Product Service - SUCCESS
cd ..
echo.

echo [6/6] Compilation de l'Order Service...
cd order-service
call mvn clean compile -q
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Order Service - ECHEC
    cd ..
    pause
    exit /b 1
)
echo [OK] Order Service - SUCCESS
cd ..
echo.

echo ========================================
echo TOUS LES SERVICES COMPILENT AVEC SUCCES!
echo ========================================
echo.
echo Services valides:
echo   [OK] Config Server (Port 8888)
echo   [OK] Eureka Server (Port 8761)
echo   [OK] API Gateway (Port 8080)
echo   [OK] Category Service (Port 8081)
echo   [OK] Product Service (Port 8082)
echo   [OK] Order Service (Port 8083)
echo.
echo Vous pouvez maintenant demarrer les services avec:
echo   start-all-services.bat
echo.
pause

