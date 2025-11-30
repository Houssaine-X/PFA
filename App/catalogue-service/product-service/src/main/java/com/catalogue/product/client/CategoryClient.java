package com.catalogue.product.client;

import com.catalogue.product.dto.CategoryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client to communicate with Category Service
 */
@FeignClient(name = "category-service")
public interface CategoryClient {

    @GetMapping("/api/categories/{id}")
    CategoryDTO getCategoryById(@PathVariable("id") Long id);
}

