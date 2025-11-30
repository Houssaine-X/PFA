package com.catalogue.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO for Product data from product-service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String nom;
    private String description;
    private BigDecimal prix;
    private Integer stockQuantity;
    private String imageUrl;
    private Boolean disponible;
    private Long categoryId;
    private String categoryNom;
    private Instant createdAt;
    private Instant updatedAt;
}

