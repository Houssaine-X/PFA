package com.catalogue.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Gateway Route Configuration
 * Defines routing rules for microservices
 */
@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Category Service Route
                .route("category-service", r -> r
                        .path("/api/categories/**")
                        .filters(f -> f
                                .addRequestHeader("X-Gateway-Route", "category-service")
                                .circuitBreaker(config -> config
                                        .setName("categoryServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/category")))
                        .uri("lb://category-service"))

                // Product Service Route
                .route("product-service", r -> r
                        .path("/api/products/**")
                        .filters(f -> f
                                .addRequestHeader("X-Gateway-Route", "product-service")
                                .circuitBreaker(config -> config
                                        .setName("productServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/product")))
                        .uri("lb://product-service"))

                // Order Service Route
                .route("order-service", r -> r
                        .path("/api/orders/**")
                        .filters(f -> f
                                .addRequestHeader("X-Gateway-Route", "order-service")
                                .circuitBreaker(config -> config
                                        .setName("orderServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/order")))
                        .uri("lb://order-service"))

                // Eureka Server Route
                .route("eureka-server", r -> r
                        .path("/eureka/**")
                        .uri("http://localhost:8761"))

                .build();
    }
}

