# Catalogue Microservices - Quick Start

All 4 microservices are operational on:
- **Eureka Server**: Port 8761
- **Category Service**: Port 8081  
- **Product Service**: Port 8082
- **Order Service**: Port 8083

---

## 🌐 View Data (Just click these links!)

### REST APIs - View as JSON in Browser:
- **All Categories**: http://localhost:8081/api/categories
- **All Products**: http://localhost:8082/api/products
- **All Orders**: http://localhost:8083/api/orders

### Service Discovery:
- **Eureka Dashboard**: http://localhost:8761

### H2 Database Consoles:
- **Category DB**: http://localhost:8081/h2-console
- **Product DB**: http://localhost:8082/h2-console
- **Order DB**: http://localhost:8083/h2-console

**H2 Login Settings:**
```
JDBC URL: jdbc:h2:mem:category_db  (or product_db, order_db)
Username: sa
Password: (leave empty)
```

## 🔄 Start/Stop Services

### Start All Services:
```
start-all-services.bat
```

### Stop All Services:
Close the 4 CMD windows that opened


