package com.catalogue.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayPalPaymentResponse {
    private String paymentId;
    private String status;
    private String approvalUrl;
    private String message;
}

