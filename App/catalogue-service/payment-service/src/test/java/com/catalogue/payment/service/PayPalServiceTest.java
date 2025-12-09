package com.catalogue.payment.service;

import com.catalogue.payment.config.PayPalConfig;
import com.paypal.api.payments.Payment;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for PayPalService
 */
@ExtendWith(MockitoExtension.class)
class PayPalServiceTest {

    @Mock
    private APIContext apiContext;

    private PayPalService payPalService;

    @BeforeEach
    void setUp() {
        payPalService = new PayPalService();
        payPalService.setApiContext(apiContext);
    }

    @Test
    void testGetApprovalUrl_Success() {
        // Given
        Payment payment = new Payment();
        com.paypal.api.payments.Links approvalLink = new com.paypal.api.payments.Links();
        approvalLink.setRel("approval_url");
        approvalLink.setHref("https://www.sandbox.paypal.com/checkoutnow?token=EC-12345");
        payment.getLinks().add(approvalLink);

        // When
        String approvalUrl = payPalService.getApprovalUrl(payment);

        // Then
        assertThat(approvalUrl).isEqualTo("https://www.sandbox.paypal.com/checkoutnow?token=EC-12345");
    }

    @Test
    void testGetApprovalUrl_NoApprovalLink() {
        // Given
        Payment payment = new Payment();

        // When
        String approvalUrl = payPalService.getApprovalUrl(payment);

        // Then
        assertThat(approvalUrl).isNull();
    }
}

