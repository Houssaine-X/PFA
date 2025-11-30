# Fix for Order Service Port Conflict (Port 8080 Already in Use)

## Problem
Order Service failed to start with the error:
```
Web server failed to start. Port 8080 was already in use.
```

Even though the `application.properties` file specified `server.port=8083`, the service attempted to start on port 8080 (the default Spring Boot port).

## Root Cause

**Missing Bootstrap Configuration Files**

The order-service (and category-service) were missing `bootstrap.properties` files. Without this file, the services cannot connect to the Config Server at startup to fetch their centralized configuration, including the correct port number.

**What happens without bootstrap.properties:**
1. Service starts up
2. **Cannot** connect to Config Server (no bootstrap config to tell it where to look)
3. Falls back to default Spring Boot behavior
4. Uses default port **8080** instead of the configured port from Config Server
5. Conflicts with API Gateway which actually uses port 8080

## Solution Applied

### 1. Created bootstrap.properties for Order Service
**File:** `order-service/src/main/resources/bootstrap.properties`

```properties
# Bootstrap Configuration for Order Service
spring.application.name=order-service
spring.cloud.config.uri=http://localhost:8888
spring.cloud.config.fail-fast=true
spring.cloud.config.retry.max-attempts=5
spring.cloud.config.retry.initial-interval=1000
```

### 2. Created bootstrap.properties for Category Service
**File:** `category-service/src/main/resources/bootstrap.properties`

```properties
# Bootstrap Configuration for Category Service
spring.application.name=category-service
spring.cloud.config.uri=http://localhost:8888
spring.cloud.config.fail-fast=true
spring.cloud.config.retry.max-attempts=5
spring.cloud.config.retry.initial-interval=1000
```

### 3. Product Service Already Had Bootstrap Config ✅
The product-service already had its bootstrap.properties file, which is why it likely worked correctly.

## Why Bootstrap.properties is Required

In Spring Cloud applications, **bootstrap.properties** is loaded **BEFORE** application.properties:

```
Startup Sequence:
1. bootstrap.properties is loaded first
2. Connect to Config Server (using bootstrap config)
3. Fetch centralized configuration from Config Server
4. Load application.properties (local overrides)
5. Start the application with merged configuration
```

**Without bootstrap.properties:**
- Services can't find Config Server
- Fall back to local application.properties only
- May use default values if properties are missing

## Port Configuration Summary

| Service          | Port | Bootstrap Config |
|------------------|------|------------------|
| Config Server    | 8888 | Not needed       |
| Eureka Server    | 8761 | Not needed       |
| Category Service | 8081 | ✅ Now added     |
| Product Service  | 8082 | ✅ Already exists|
| Order Service    | 8083 | ✅ Now added     |
| API Gateway      | 8080 | Uses config import |

## How It Works Now

1. **Config Server** starts on port 8888
2. **Order Service** starts:
   - Reads `bootstrap.properties`
   - Connects to Config Server at http://localhost:8888
   - Fetches `order-service.properties` (which specifies port 8083)
   - Starts successfully on port 8083 ✅

3. **API Gateway** can safely use port 8080 without conflicts

## Configuration Files Hierarchy

```
Config Server centralizes all configurations:
├── config/application.properties       (common config for all services)
├── config/order-service.properties     (order-specific: port 8083)
├── config/category-service.properties  (category-specific: port 8081)
└── config/product-service.properties   (product-specific: port 8082)

Each service has:
├── bootstrap.properties                (tells where Config Server is)
└── application.properties              (local overrides, fallback)
```

## Startup Order

**Always start services in this order:**

1. **Config Server** (8888) - Must be first!
2. **Eureka Server** (8761)
3. **Microservices** (can start in any order once Config + Eureka are up):
   - Category Service (8081)
   - Product Service (8082)
   - Order Service (8083)
4. **API Gateway** (8080) - Should be last

## Verification Steps

After rebuild, start order-service and verify:

```bash
# Check the startup logs should show:
Fetching config from server at: http://localhost:8888
Located environment: name=order-service, profiles=[default]
Tomcat initialized with port 8083 (http)  ✅ Correct port!
```

## Files Modified/Created

1. ✅ Created: `order-service/src/main/resources/bootstrap.properties`
2. ✅ Created: `category-service/src/main/resources/bootstrap.properties`
3. ✅ Verified: `product-service/src/main/resources/bootstrap.properties` (already existed)

## Date Fixed
November 25, 2025

## Note
If you still get a port conflict:
1. Make sure Config Server is running FIRST
2. Check if another process is using the port: `netstat -ano | findstr :8083`
3. If needed, kill the conflicting process or change the port in config server

