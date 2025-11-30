@echo off
echo ========================================
echo Testing Catalogue Microservices APIs
echo ========================================
echo.

echo [TEST 1] Creating a Category...
curl -X POST http://localhost:8081/api/categories -H "Content-Type: application/json" -d "{\"nom\":\"Electronics\",\"description\":\"Electronic devices and accessories\"}"
echo.
echo.

echo [TEST 2] Getting All Categories...
curl http://localhost:8081/api/categories
echo.
echo.

echo [TEST 3] Creating a Product...
curl -X POST http://localhost:8082/api/products -H "Content-Type: application/json" -d "{\"nom\":\"Gaming Laptop\",\"description\":\"High-performance gaming laptop\",\"prix\":1499.99,\"stockQuantity\":15,\"categoryId\":1}"
echo.
echo.

echo [TEST 4] Getting All Products...
curl http://localhost:8082/api/products
echo.
echo.

echo [TEST 5] Creating an Order...
curl -X POST http://localhost:8083/api/orders -H "Content-Type: application/json" -d "{\"clientEmail\":\"john.doe@example.com\",\"clientNom\":\"Doe\",\"clientPrenom\":\"John\",\"clientTelephone\":\"1234567890\",\"adresseLivraison\":\"123 Main Street, City, Country\",\"orderItems\":[{\"productId\":1,\"quantity\":2}]}"
echo.
echo.

echo [TEST 6] Getting All Orders...
curl http://localhost:8083/api/orders
echo.
echo.

echo [TEST 7] Checking Product Stock (should be reduced)...
curl http://localhost:8082/api/products/1
echo.
echo.

echo ========================================
echo All tests completed!
echo ========================================
pause
# Catalogue Microservices Architecture

This project demonstrates a complete microservices architecture using Spring Boot and Spring Cloud for an e-commerce catalogue and order management system.

## Architecture Overview

The application is divided into 4 microservices:

1. **Eureka Server** (Port 8761) - Service Discovery
2. **Category Service** (Port 8081) - Manages product categories
3. **Product Service** (Port 8082) - Manages products with references to categories
4. **Order Service** (Port 8083) - Manages orders with inter-service communication

## Technology Stack

- **Java 17**
- **Spring Boot 3.5.6**
- **Spring Cloud 2024.0.0**
- **Spring Data JPA**
- **MySQL 8**
- **Flyway** (Database Migrations)
- **MapStruct 1.6.3** (DTO Mapping)
- **Lombok** (Boilerplate Reduction)
- **Netflix Eureka** (Service Discovery)
- **OpenFeign** (Declarative REST Clients)

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- MySQL should be running on `localhost:3306`
- MySQL root user with password: `root`

## Database Setup

The application will automatically create the following databases:
- `category_db`
- `product_db`
- `order_db`

Make sure MySQL is running and accessible with:
- **Username**: root
- **Password**: root

If you need different credentials, update the `application.properties` in each service.

## Building the Project

From the root directory `catalogue-service`:

```cmd
cd C:\Users\houss\catalogue-service
mvn clean install -f pom-parent.xml
```

Or build each service individually:

```cmd
cd eureka-server
mvn clean package

cd ..\category-service
mvn clean package

cd ..\product-service
mvn clean package

cd ..\order-service
mvn clean package
```

## Running the Microservices

**IMPORTANT**: Start services in this order:

### 1. Start Eureka Server (Service Discovery)
```cmd
cd C:\Users\houss\catalogue-service\eureka-server
mvn spring-boot:run
```
Wait until you see "Eureka Server started" and access: http://localhost:8761

### 2. Start Category Service
Open a new terminal:
```cmd
cd C:\Users\houss\catalogue-service\category-service
mvn spring-boot:run
```
Service will register with Eureka on port 8081

### 3. Start Product Service
Open a new terminal:
```cmd
cd C:\Users\houss\catalogue-service\product-service
mvn spring-boot:run
```
Service will register with Eureka on port 8082

### 4. Start Order Service
Open a new terminal:
```cmd
cd C:\Users\houss\catalogue-service\order-service
mvn spring-boot:run
```
Service will register with Eureka on port 8083

## Verifying the Services

1. **Eureka Dashboard**: http://localhost:8761
   - Should show all 3 services registered

2. **Service Health Checks**:
   - Category Service: http://localhost:8081/actuator/health
   - Product Service: http://localhost:8082/actuator/health
   - Order Service: http://localhost:8083/actuator/health

## API Endpoints

### Category Service (Port 8081)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/categories` | Create a new category |
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/{id}` | Get category by ID |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |
| GET | `/api/categories/search?nom={name}` | Search category by name |

### Product Service (Port 8082)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create a new product |
| GET | `/api/products` | Get all products |
| GET | `/api/products/{id}` | Get product by ID |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| GET | `/api/products/category/{categoryId}` | Get products by category |
| GET | `/api/products/available` | Get available products |
| GET | `/api/products/search?keyword={keyword}` | Search products |
| PATCH | `/api/products/{id}/stock?quantity={qty}` | Update stock |

### Order Service (Port 8083)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/{id}` | Get order by ID |
| PATCH | `/api/orders/{id}/status?status={status}` | Update order status |
| DELETE | `/api/orders/{id}` | Delete order |
| GET | `/api/orders/order-number/{orderNumber}` | Get order by order number |
| GET | `/api/orders/client/{email}` | Get orders by client email |
| GET | `/api/orders/status/{status}` | Get orders by status |

## Testing the Microservices

### 1. Create a Category
```bash
curl -X POST http://localhost:8081/api/categories ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"Electronics\",\"description\":\"Electronic devices\"}"
```

### 2. Create a Product
```bash
curl -X POST http://localhost:8082/api/products ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"Laptop\",\"description\":\"Gaming laptop\",\"prix\":1299.99,\"stockQuantity\":10,\"categoryId\":1}"
```

### 3. Create an Order
```bash
curl -X POST http://localhost:8083/api/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"clientEmail\":\"test@example.com\",\"clientNom\":\"Doe\",\"clientPrenom\":\"John\",\"adresseLivraison\":\"123 Main St\",\"orderItems\":[{\"productId\":1,\"quantity\":2}]}"
```

### 4. Get All Categories
```bash
curl http://localhost:8081/api/categories
```

### 5. Get All Products
```bash
curl http://localhost:8082/api/products
```

### 6. Get All Orders
```bash
curl http://localhost:8083/api/orders
```

## Inter-Service Communication

- **Product Service** calls **Category Service** using Feign Client to validate categories and enrich product data
- **Order Service** calls **Product Service** to:
  - Validate product availability
  - Get product prices
  - Update stock quantities
  - Enrich order data with product names

All service-to-service communication is handled through Eureka service discovery.

## Database Schema

Each service has its own database:

### category_db
- `categories` table

### product_db
- `products` table (with `category_id` reference)

### order_db
- `orders` table
- `order_items` table (with `product_id` reference)

## Troubleshooting

### Services not registering with Eureka
- Ensure Eureka Server is running first
- Check firewall settings
- Verify `eureka.client.service-url.defaultZone` in application.properties

### Database connection errors
- Verify MySQL is running
- Check credentials in `application.properties`
- Ensure databases are created (auto-created if permissions allow)

### Feign client errors
- Ensure all dependent services are running and registered with Eureka
- Check service names match in `@FeignClient` annotations

## Project Structure

```
catalogue-service/
├── pom-parent.xml (Parent POM)
├── eureka-server/ (Service Discovery)
├── category-service/ (Category Microservice)
├── product-service/ (Product Microservice)
└── order-service/ (Order Microservice)
```

## Key Features Implemented

✅ Service Discovery with Eureka
✅ Independent databases per service
✅ Inter-service communication with Feign
✅ Database migrations with Flyway
✅ DTO mapping with MapStruct
✅ Input validation
✅ RESTful APIs
✅ Health checks with Actuator
✅ Transaction management
✅ Stock management
✅ Order processing workflow

## Future Enhancements

- API Gateway (Spring Cloud Gateway)
- Distributed tracing (Sleuth/Zipkin)
- Circuit breaker (Resilience4j)
- Configuration server (Spring Cloud Config)
- Message broker (RabbitMQ/Kafka)
- Authentication/Authorization (Spring Security + JWT)
- Docker containerization
- Kubernetes deployment

## License

This project is for educational purposes.

