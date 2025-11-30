@echo off
echo ========================================
echo Starting Working Catalogue Microservices
echo ========================================
echo.

echo [1/3] Starting Eureka Server (Port 8761)...
start "Eureka Server" cmd /k "cd eureka-server && ..\mvnw.cmd spring-boot:run"
echo Waiting 30 seconds for Eureka Server to start...
timeout /t 30 /nobreak >nul
echo.

echo [2/3] Starting Category Service (Port 8081)...
start "Category Service" cmd /k "cd category-service && ..\mvnw.cmd spring-boot:run"
echo Waiting 20 seconds...
timeout /t 20 /nobreak >nul
echo.

echo [3/3] Starting Product Service (Port 8082)...
start "Product Service" cmd /k "cd product-service && ..\mvnw.cmd spring-boot:run"
echo.

echo ========================================
echo All working services are starting!
echo ========================================
echo.
echo Eureka Dashboard: http://localhost:8761
echo Category Service: http://localhost:8081/api/categories
echo Product Service: http://localhost:8082/api/products
echo.
pause

