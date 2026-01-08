# E-Commerce Aggregator Platform

A centralized shopping platform that aggregates products from multiple e-commerce websites (Amazon, eBay, etc.) into one place. Users can search, compare prices, and get AI-powered recommendations to find the best deals without switching between sites.

## What It Does

- **Product Aggregation** – Search products across multiple e-commerce sources from a single interface
- **AI Recommendations** – Get smart suggestions to compare options and find the best match for your needs
- **Price Comparison** – View prices from different platforms side by side
- **Internal Catalog** – Browse and purchase from our own product inventory
- **User Accounts** – Register, log in, and track your order history
- **Secure Payments** – Checkout with PayPal for internal purchases

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Backend | Java 17, Spring Boot, Spring Cloud |
| Frontend | React, TypeScript, Tailwind CSS |
| Infrastructure | Netflix Eureka, API Gateway |
| Database | H2 (in-memory) |
| Payments | PayPal REST API |

## Architecture Overview

The backend is split into independent services that communicate through an API Gateway:

| Service | Port | Purpose |
|---------|------|---------|
| API Gateway | 8080 | Single entry point for all requests |
| Eureka Server | 8761 | Service registry and discovery |
| Config Server | 8888 | Centralized configuration |
| User Service | 8083 | Authentication and user data |
| Product Service | 8081 | Product catalog and inventory |
| Order Service | 8085 | Order processing |
| Payment Service | 8084 | PayPal payment handling |

## Getting Started

### Requirements

- Java 17 or higher
- Node.js 18 or higher

### Start the Backend

```bash
cd App/catalogue-service
start-all-services.bat
```

Wait 2–3 minutes for services to initialize. Check http://localhost:8761 to verify all services are running.

### Start the Frontend

```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000 in your browser.

## Project Structure

```
App/catalogue-service/     Backend microservices
frontend/                  React web application
Documentation-Projet/      Project documentation
```

## API Reference

All API requests go through `http://localhost:8080`

| Resource | Endpoints |
|----------|-----------|
| Users | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/{id}` |
| Products | `GET/POST /api/products`, `GET/PUT /api/products/{id}` |
| Orders | `GET/POST /api/orders`, `GET /api/orders/user/{userId}` |
| Payments | `POST /api/payments/paypal/create`, `POST /api/payments/paypal/execute` |

## About

This project was developed as an academic engineering project (PFA). It demonstrates how to build a distributed system that aggregates data from multiple external sources and uses AI to enhance the user's shopping experience.
