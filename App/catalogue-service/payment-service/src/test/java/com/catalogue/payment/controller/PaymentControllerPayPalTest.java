package com.catalogue.payment.controller;

import com.catalogue.payment.dto.PayPalExecuteRequest;
import com.catalogue.payment.dto.PayPalPaymentRequest;
import com.catalogue.payment.dto.PayPalPaymentResponse;
import com.catalogue.payment.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for PaymentController PayPal endpoints
 */
@WebMvcTest(PaymentController.class)
class PaymentControllerPayPalTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaymentService paymentService;

    @Test
    void testCreatePayPalPayment_Success() throws Exception {
        // Given
        PayPalPaymentRequest request = PayPalPaymentRequest.builder()
                .orderId(1L)
                .userId(1L)
                .amount(new BigDecimal("99.99"))
                .currency("USD")
                .description("Order #1 Payment")
                .cancelUrl("http://localhost:3000/cancel")
                .successUrl("http://localhost:3000/success")
                .build();

        PayPalPaymentResponse response = PayPalPaymentResponse.builder()
                .paymentId("PAYID-123456")
                .status("created")
                .approvalUrl("https://www.sandbox.paypal.com/checkoutnow?token=EC-TEST")
                .message("Payment created successfully")
                .build();

        when(paymentService.createPayPalPayment(any(PayPalPaymentRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/payments/paypal/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentId").value("PAYID-123456"))
                .andExpect(jsonPath("$.status").value("created"))
                .andExpect(jsonPath("$.approvalUrl").value("https://www.sandbox.paypal.com/checkoutnow?token=EC-TEST"))
                .andExpect(jsonPath("$.message").value("Payment created successfully"));
    }

    @Test
    void testCreatePayPalPayment_ValidationError() throws Exception {
        // Given - Invalid request (missing required fields)
        PayPalPaymentRequest request = PayPalPaymentRequest.builder()
                .orderId(1L)
                .build();

        // When & Then
        mockMvc.perform(post("/api/payments/paypal/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testExecutePayPalPayment_Success() throws Exception {
        // Given
        PayPalExecuteRequest request = PayPalExecuteRequest.builder()
                .paymentId("PAYID-123456")
                .payerId("PAYER-123")
                .build();

        PayPalPaymentResponse response = PayPalPaymentResponse.builder()
                .paymentId("PAYID-123456")
                .status("approved")
                .message("Payment executed successfully")
                .build();

        when(paymentService.executePayPalPayment(any(PayPalExecuteRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/payments/paypal/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").value("PAYID-123456"))
                .andExpect(jsonPath("$.status").value("approved"))
                .andExpect(jsonPath("$.message").value("Payment executed successfully"));
    }

    @Test
    void testCancelPayPalPayment_Success() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/payments/paypal/cancel/PAYID-123456"))
                .andExpect(status().isNoContent());
    }
}

