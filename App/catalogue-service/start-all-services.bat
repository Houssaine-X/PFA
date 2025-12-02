@echo off
echo ========================================
echo Starting Catalogue Microservices
echo ========================================
echo.

echo [1/7] Starting Config Server (Port 8888)...
start "Config Server" cmd /k "cd C:\Users\houss\catalogue-service\config-server && mvn spring-boot:run"
echo Waiting 20 seconds for Config Server to start...
timeout /t 20 /nobreak >nul
echo.

echo [2/7] Starting Eureka Server (Port 8761)...
start "Eureka Server" cmd /k "cd C:\Users\houss\catalogue-service\eureka-server && mvn spring-boot:run"
echo Waiting 30 seconds for Eureka Server to start...
timeout /t 30 /nobreak >nul
echo.

echo [3/7] Starting API Gateway (Port 8080)...
start "API Gateway" cmd /k "cd C:\Users\houss\catalogue-service\api-gateway && mvn spring-boot:run"
echo Waiting 25 seconds...
timeout /t 25 /nobreak >nul
echo.

echo [4/7] Starting Product Service (Port 8082)...
start "Product Service" cmd /k "cd C:\Users\houss\catalogue-service\product-service && mvn spring-boot:run"
echo Waiting 20 seconds...
timeout /t 20 /nobreak >nul
echo.

echo [5/7] Starting Order Service (Port 8083)...
start "Order Service" cmd /k "cd C:\Users\houss\catalogue-service\order-service && mvn spring-boot:run"
echo Waiting 20 seconds...
timeout /t 20 /nobreak >nul
echo.

echo [6/7] Starting Payment Service (Port 8084)...
start "Payment Service" cmd /k "cd C:\Users\houss\catalogue-service\payment-service && mvn spring-boot:run"
echo Waiting 20 seconds...
timeout /t 20 /nobreak >nul
echo.

echo [7/7] Starting User Service (Port 8085)...
start "User Service" cmd /k "cd C:\Users\houss\catalogue-service\user-service && mvn spring-boot:run"
echo.

echo ========================================
echo All services are starting!
echo ========================================
echo.
echo Config Server:    http://localhost:8888/actuator/health
echo Eureka Dashboard: http://localhost:8761
echo API Gateway:      http://localhost:8080/actuator/health
echo Product Service:  http://localhost:8082/actuator/health
echo Order Service:    http://localhost:8083/actuator/health
echo Payment Service:  http://localhost:8084/actuator/health
echo User Service:     http://localhost:8085/actuator/health
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

