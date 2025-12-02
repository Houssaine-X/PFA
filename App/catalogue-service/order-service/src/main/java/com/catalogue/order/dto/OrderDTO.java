package com.catalogue.order.dto;

import com.catalogue.order.entity.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {

    private Long id;

    private String orderNumber;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Delivery address is required")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String adresseLivraison;

    private OrderStatus status;

    private BigDecimal montantTotal;

    private Instant createdAt;

    private Instant updatedAt;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    @Builder.Default
    private List<OrderItemDTO> orderItems = new ArrayList<>();
}

