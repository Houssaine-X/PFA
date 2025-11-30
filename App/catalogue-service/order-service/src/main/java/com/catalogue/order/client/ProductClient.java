package com.catalogue.order.client;

import com.catalogue.order.dto.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Feign client to communicate with Product Service
 */
@FeignClient(name = "product-service")
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    ProductDTO getProductById(@PathVariable("id") Long id);

    @PatchMapping("/api/products/{id}/stock")
    ProductDTO updateStock(@PathVariable("id") Long id, @RequestParam("quantity") Integer quantity);
}

