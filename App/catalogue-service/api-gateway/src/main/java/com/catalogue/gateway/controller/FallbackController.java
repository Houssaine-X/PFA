package com.catalogue.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Fallback Controller for Circuit Breaker
 */
@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/category")
    public ResponseEntity<Map<String, String>> categoryFallback() {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Category Service is currently unavailable");
        response.put("message", "Please try again later");
        return new ResponseEntity<>(response, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @GetMapping("/product")
    public ResponseEntity<Map<String, String>> productFallback() {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Product Service is currently unavailable");
        response.put("message", "Please try again later");
        return new ResponseEntity<>(response, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @GetMapping("/order")
    public ResponseEntity<Map<String, String>> orderFallback() {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Order Service is currently unavailable");
        response.put("message", "Please try again later");
        return new ResponseEntity<>(response, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, String>> userFallback() {
        Map<String, String> response = new HashMap<>();
        response.put("error", "User Service is currently unavailable");
        response.put("message", "Please try again later");
        return new ResponseEntity<>(response, HttpStatus.SERVICE_UNAVAILABLE);
    }
}

