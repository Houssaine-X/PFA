package com.catalogue.payment.service;

import com.catalogue.payment.dto.PayPalExecuteRequest;
import com.catalogue.payment.dto.PayPalPaymentRequest;
import com.catalogue.payment.dto.PayPalPaymentResponse;
import com.catalogue.payment.entity.Payment;
import com.catalogue.payment.entity.PaymentMethod;
import com.catalogue.payment.entity.PaymentStatus;
import com.catalogue.payment.mapper.PaymentMapper;
import com.catalogue.payment.repository.PaymentRepository;
import com.paypal.api.payments.Links;
import com.paypal.base.rest.PayPalRESTException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PaymentService PayPal integration
 */
@ExtendWith(MockitoExtension.class)
class PaymentServicePayPalTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentMapper paymentMapper;

    @Mock
    private PayPalService payPalService;

    @InjectMocks
    private PaymentService paymentService;

    private PayPalPaymentRequest paymentRequest;
    private com.paypal.api.payments.Payment mockPayPalPayment;
    private Payment mockPayment;

    @BeforeEach
    void setUp() {
        // Setup test data
        paymentRequest = PayPalPaymentRequest.builder()
                .orderId(1L)
                .userId(1L)
                .amount(new BigDecimal("99.99"))
                .currency("USD")
                .description("Order #1 Payment")
                .cancelUrl("http://localhost:3000/cancel")
                .successUrl("http://localhost:3000/success")
                .build();

        mockPayPalPayment = new com.paypal.api.payments.Payment();
        mockPayPalPayment.setId("PAYID-123456");
        mockPayPalPayment.setState("created");

        Links approvalLink = new Links();
        approvalLink.setRel("approval_url");
        approvalLink.setHref("https://www.sandbox.paypal.com/checkoutnow?token=EC-TEST");
        List<Links> links = new ArrayList<>();
        links.add(approvalLink);
        mockPayPalPayment.setLinks(links);

        mockPayment = Payment.builder()
                .id(1L)
                .orderId(1L)
                .userId(1L)
                .amount(new BigDecimal("99.99"))
                .paymentMethod(PaymentMethod.PAYPAL)
                .status(PaymentStatus.PENDING)
                .transactionId("PAYID-123456")
                .description("Order #1 Payment")
                .build();
    }

    @Test
    void testCreatePayPalPayment_Success() throws PayPalRESTException {
        // Given
        when(payPalService.createPayment(any(), any(), any(), any(), any())).thenReturn(mockPayPalPayment);
        when(payPalService.getApprovalUrl(mockPayPalPayment)).thenReturn("https://www.sandbox.paypal.com/checkoutnow?token=EC-TEST");
        when(paymentRepository.save(any(Payment.class))).thenReturn(mockPayment);

        // When
        PayPalPaymentResponse response = paymentService.createPayPalPayment(paymentRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getPaymentId()).isEqualTo("PAYID-123456");
        assertThat(response.getStatus()).isEqualTo("created");
        assertThat(response.getApprovalUrl()).isEqualTo("https://www.sandbox.paypal.com/checkoutnow?token=EC-TEST");
        assertThat(response.getMessage()).contains("Payment created successfully");

        verify(payPalService).createPayment(
                paymentRequest.getAmount(),
                paymentRequest.getCurrency(),
                paymentRequest.getDescription(),
                paymentRequest.getCancelUrl(),
                paymentRequest.getSuccessUrl()
        );
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void testCreatePayPalPayment_PayPalError() throws PayPalRESTException {
        // Given
        when(payPalService.createPayment(any(), any(), any(), any(), any()))
                .thenThrow(new PayPalRESTException("PayPal API Error"));

        // When & Then
        assertThatThrownBy(() -> paymentService.createPayPalPayment(paymentRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to create PayPal payment");

        verify(paymentRepository, never()).save(any());
    }

    @Test
    void testExecutePayPalPayment_Success() throws PayPalRESTException {
        // Given
        PayPalExecuteRequest executeRequest = PayPalExecuteRequest.builder()
                .paymentId("PAYID-123456")
                .payerId("PAYER-123")
                .build();

        com.paypal.api.payments.Payment executedPayment = new com.paypal.api.payments.Payment();
        executedPayment.setId("PAYID-123456");
        executedPayment.setState("approved");

        when(payPalService.executePayment(anyString(), anyString())).thenReturn(executedPayment);
        when(paymentRepository.findByTransactionId("PAYID-123456")).thenReturn(Optional.of(mockPayment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(mockPayment);

        // When
        PayPalPaymentResponse response = paymentService.executePayPalPayment(executeRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getPaymentId()).isEqualTo("PAYID-123456");
        assertThat(response.getStatus()).isEqualTo("approved");
        assertThat(response.getMessage()).contains("Payment executed successfully");

        verify(payPalService).executePayment("PAYID-123456", "PAYER-123");
        verify(paymentRepository).findByTransactionId("PAYID-123456");
        verify(paymentRepository).save(argThat(payment ->
                payment.getStatus() == PaymentStatus.COMPLETED
        ));
    }

    @Test
    void testExecutePayPalPayment_PaymentNotFound() throws PayPalRESTException {
        // Given
        PayPalExecuteRequest executeRequest = PayPalExecuteRequest.builder()
                .paymentId("PAYID-NOTFOUND")
                .payerId("PAYER-123")
                .build();

        com.paypal.api.payments.Payment executedPayment = new com.paypal.api.payments.Payment();
        executedPayment.setId("PAYID-NOTFOUND");
        executedPayment.setState("approved");

        when(payPalService.executePayment(anyString(), anyString())).thenReturn(executedPayment);
        when(paymentRepository.findByTransactionId("PAYID-NOTFOUND")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> paymentService.executePayPalPayment(executeRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Payment not found");
    }

    @Test
    void testExecutePayPalPayment_ExecutionFailed() throws PayPalRESTException {
        // Given
        PayPalExecuteRequest executeRequest = PayPalExecuteRequest.builder()
                .paymentId("PAYID-123456")
                .payerId("PAYER-123")
                .build();

        when(payPalService.executePayment(anyString(), anyString()))
                .thenThrow(new PayPalRESTException("Execution failed"));
        when(paymentRepository.findByTransactionId("PAYID-123456")).thenReturn(Optional.of(mockPayment));

        // When & Then
        assertThatThrownBy(() -> paymentService.executePayPalPayment(executeRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to execute PayPal payment");

        // Verify payment status was updated to FAILED
        verify(paymentRepository).save(argThat(payment ->
                payment.getStatus() == PaymentStatus.FAILED
        ));
    }

    @Test
    void testCancelPayPalPayment_Success() {
        // Given
        when(paymentRepository.findByTransactionId("PAYID-123456")).thenReturn(Optional.of(mockPayment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(mockPayment);

        // When
        paymentService.cancelPayPalPayment("PAYID-123456");

        // Then
        verify(paymentRepository).findByTransactionId("PAYID-123456");
        verify(paymentRepository).save(argThat(payment ->
                payment.getStatus() == PaymentStatus.CANCELLED
        ));
    }

    @Test
    void testCancelPayPalPayment_NotFound() {
        // Given
        when(paymentRepository.findByTransactionId("PAYID-NOTFOUND")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> paymentService.cancelPayPalPayment("PAYID-NOTFOUND"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Payment not found");
    }
}

