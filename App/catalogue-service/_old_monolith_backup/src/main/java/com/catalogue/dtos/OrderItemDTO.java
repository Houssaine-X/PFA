package com.catalogue.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {

    private Long id;

    private Long orderId;

    @NotNull(message = "Product ID is required")
    private Long productId;

    private String productNom;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private BigDecimal prixUnitaire;

    private BigDecimal sousTotal;
}

