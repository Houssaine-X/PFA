package com.catalogue.order.dto;

import com.catalogue.order.entity.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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

    @NotBlank(message = "Client email is required")
    @Email(message = "Email should be valid")
    private String clientEmail;

    @NotBlank(message = "Client last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String clientNom;

    @NotBlank(message = "Client first name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String clientPrenom;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String clientTelephone;

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

