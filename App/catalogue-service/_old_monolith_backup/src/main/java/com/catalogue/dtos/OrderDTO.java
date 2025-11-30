package com.catalogue.dtos;

import com.catalogue.entities.OrderStatus;
import jakarta.validation.constraints.*;
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

    @NotBlank(message = "Client email is required")
    @Email(message = "Invalid email format")
    private String clientEmail;

    @NotBlank(message = "Client last name is required")
    @Size(max = 100, message = "Client last name must not exceed 100 characters")
    private String clientNom;

    @NotBlank(message = "Client first name is required")
    @Size(max = 100, message = "Client first name must not exceed 100 characters")
    private String clientPrenom;

    @Pattern(regexp = "^[0-9+\\-\\s()]*$", message = "Invalid phone number format")
    private String clientTelephone;

    @NotBlank(message = "Delivery address is required")
    @Size(max = 500, message = "Delivery address must not exceed 500 characters")
    private String adresseLivraison;

    private OrderStatus status;

    private BigDecimal montantTotal;

    private Instant createdAt;

    private Instant updatedAt;

    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemDTO> orderItems;
}

