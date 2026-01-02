# E-Commerce Microservices Platform

A modern e-commerce platform built with microservices architecture using Spring Boot and React.

## Tech Stack

**Backend:** Spring Boot, Spring Cloud, Netflix Eureka, H2 Database  
**Frontend:** React, TypeScript, Tailwind CSS  
**Payments:** PayPal Integration

## Architecture

| Service | Port | Description |
|---------|------|-------------|
| Config Server | 8888 | Centralized configuration |
| Eureka Server | 8761 | Service discovery |
| API Gateway | 8080 | Routing & load balancing |
| User Service | 8083 | User management & authentication |
| Product Service | 8081 | Product catalog |
| Order Service | 8085 | Order management |
| Payment Service | 8084 | PayPal payments |

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- npm or yarn

### Run Backend

```bash
cd App/catalogue-service
start-all-services.bat
```

Wait 2-3 minutes for all services to start. Verify at http://localhost:8761

### Run Frontend

```bash
cd frontend
npm install
npm start
```

Access the app at http://localhost:3000

## API Endpoints

All requests go through the gateway at `http://localhost:8080`

| Resource | Endpoints |
|----------|-----------|
| Users | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/{id}` |
| Products | `GET/POST /api/products`, `GET/PUT /api/products/{id}` |
| Orders | `GET/POST /api/orders`, `GET /api/orders/user/{userId}` |
| Payments | `POST /api/payments/paypal/create`, `POST /api/payments/paypal/execute` |

## Project Structure

```
├── App/catalogue-service/    # Backend microservices
│   ├── config-server/
│   ├── eureka-server/
│   ├── api-gateway/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   └── payment-service/
├── frontend/                 # React application
└── Documentation-Projet/     # Project documentation
```

## License

This project was developed as part of an academic engineering project (PFA).

