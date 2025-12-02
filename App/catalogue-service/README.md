# Catalogue Microservices - Quick Start

All 5 microservices are operational on:
- **Eureka Server**: Port 8761
- **Product Service**: Port 8082 (with embedded category information)
- **Order Service**: Port 8083
- **Payment Service**: Port 8084
- **User Service**: Port 8085

---

## 🌐 View Data (Just click these links!)

### REST APIs - View as JSON in Browser:
- **All Products**: http://localhost:8082/api/products (with embedded category)
- **All Orders**: http://localhost:8083/api/orders
- **All Payments**: http://localhost:8084/api/payments
- **All Users**: http://localhost:8085/api/users

### Service Discovery:
- **Eureka Dashboard**: http://localhost:8761

### H2 Database Consoles:
- **Product DB**: http://localhost:8082/h2-console
- **Order DB**: http://localhost:8083/h2-console
- **Payment DB**: http://localhost:8084/h2-console
- **User DB**: http://localhost:8085/h2-console

**H2 Login Settings:**
```
JDBC URL: jdbc:h2:mem:product_db  (or order_db, payment_db, user_db)
Username: sa
Password: (leave empty)
```

## 🔄 Start/Stop Services

### Start All Services:
```
start-all-services.bat
```

### Stop All Services:
Close the CMD windows that opened


