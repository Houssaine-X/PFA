@echo off
echo ========================================
echo Starting Catalogue Microservices
echo ========================================
echo.

echo [1/6] Starting Config Server (Port 8888)...
start "Config Server" cmd /k "cd C:\Users\houss\catalogue-service\config-server && mvn spring-boot:run"
echo Waiting 20 seconds for Config Server to start...
timeout /t 20 /nobreak >nul
echo.

echo [2/6] Starting Eureka Server (Port 8761)...
start "Eureka Server" cmd /k "cd C:\Users\houss\catalogue-service\eureka-server && mvn spring-boot:run"
echo Waiting 30 seconds for Eureka Server to start...
timeout /t 30 /nobreak >nul
echo.

echo [3/6] Starting API Gateway (Port 8080)...
start "API Gateway" cmd /k "cd C:\Users\houss\catalogue-service\api-gateway && mvn spring-boot:run"
echo Waiting 25 seconds...
timeout /t 25 /nobreak >nul
echo.

echo [4/6] Starting Category Service (Port 8081)...
start "Category Service" cmd /k "cd C:\Users\houss\catalogue-service\category-service && mvn spring-boot:run"
echo Waiting 20 seconds...
timeout /t 20 /nobreak >nul
echo.

echo [5/6] Starting Product Service (Port 8082)...
start "Product Service" cmd /k "cd C:\Users\houss\catalogue-service\product-service && mvn spring-boot:run"
echo Waiting 20 seconds...
timeout /t 20 /nobreak >nul
echo.

echo [6/6] Starting Order Service (Port 8083)...
start "Order Service" cmd /k "cd C:\Users\houss\catalogue-service\order-service && mvn spring-boot:run"
echo.

echo ========================================
echo All services are starting!
echo ========================================
echo.
echo Config Server:    http://localhost:8888/actuator/health
echo Eureka Dashboard: http://localhost:8761
echo API Gateway:      http://localhost:8080/actuator/health
echo Category Service: http://localhost:8081/actuator/health
echo Product Service:  http://localhost:8082/actuator/health
echo Order Service:    http://localhost:8083/actuator/health
echo.
echo Access all services through API Gateway:
echo - Categories: http://localhost:8080/api/categories
echo - Products:   http://localhost:8080/api/products
echo - Orders:     http://localhost:8080/api/orders
echo.
echo Please wait 1-2 minutes for all services to fully start
echo and register with Eureka.
echo.
pause

