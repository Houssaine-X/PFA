package com.catalogue.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String adresseLivraison;
    private String status;
    private BigDecimal montantTotal;
    private Instant createdAt;
    private Instant updatedAt;
    private List<OrderItemDTO> orderItems;
}

