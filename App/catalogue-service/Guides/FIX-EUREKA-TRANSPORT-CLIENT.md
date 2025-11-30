# Fix for Eureka Client TransportClientFactories Error

## Problem
The error occurred when starting the category-service (and potentially other services):

```
org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 
'com.netflix.discovery.shared.transport.jersey.TransportClientFactories<?>' available
```

This error indicates that the Eureka client couldn't find the proper transport client factory bean to communicate with the Eureka server.

## Root Causes

1. **Spring Cloud 2024.0.0 Changes**: In Spring Cloud 2024.0.0, the default Eureka client transport mechanism changed. The old Jersey 2 client was deprecated, and Jersey 3 support is incomplete in some configurations.

2. **Incorrect Global Dependency**: The parent POM had `spring-cloud-netflix-eureka-server` as a global dependency, which should only be in the eureka-server module.

3. **Missing HttpClient5 Dependency**: Spring Cloud 2024.0.0 prefers Apache HttpClient 5 as the transport mechanism for Eureka clients, but it wasn't explicitly included.

## Solution Applied

### 1. Fixed Parent POM (pom.xml)
**Removed** the eureka-server dependency from the parent POM's global dependencies section:
```xml
<!-- REMOVED THIS -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-netflix-eureka-server</artifactId>
</dependency>
```

This dependency should only be in the eureka-server module's POM, not globally.

### 2. Updated Service POMs
**Changed** in category-service, product-service, and order-service:

**Before:**
```xml
<!-- Eureka Client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

<!-- Jersey Client for Eureka (required for TransportClientFactories) -->
<dependency>
    <groupId>com.netflix.eureka</groupId>
    <artifactId>eureka-client-jersey3</artifactId>
</dependency>
```

**After:**
```xml
<!-- Eureka Client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

<!-- Apache HttpClient 5 for Eureka transport (required for Spring Cloud 2024.0.0) -->
<dependency>
    <groupId>org.apache.httpcomponents.client5</groupId>
    <artifactId>httpclient5</artifactId>
</dependency>
```

### 3. Why HttpClient5?
- Spring Cloud 2024.0.0 changed the default transport mechanism from Jersey to Apache HttpClient 5
- HttpClient5 is more stable and better integrated with Spring Boot 3.x
- The `httpclient5` dependency provides the `TransportClientFactories` implementation automatically

## Verification Steps

After applying the fix:

1. **Rebuild the project:**
   ```bash
   mvn clean install -DskipTests
   ```

2. **Start the services in order:**
   - Config Server (port 8888)
   - Eureka Server (port 8761)
   - Category Service (port 8081)
   - Product Service (port 8082)
   - Order Service (port 8083)
   - API Gateway (port 8080)

3. **Check Eureka Dashboard:**
   Open http://localhost:8761 and verify that all services are registered.

## Additional Notes

- The application.properties files remain unchanged - no special configuration is needed
- This fix is compatible with Spring Boot 3.4.1 and Spring Cloud 2024.0.0
- All three microservices (category, product, order) have been updated consistently

## Files Modified

1. `pom.xml` (parent POM) - Removed eureka-server global dependency
2. `category-service/pom.xml` - Updated Eureka dependencies
3. `product-service/pom.xml` - Updated Eureka dependencies
4. `order-service/pom.xml` - Updated Eureka dependencies

## Date Fixed
November 25, 2025

