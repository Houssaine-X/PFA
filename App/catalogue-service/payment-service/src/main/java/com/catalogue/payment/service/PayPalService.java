package com.catalogue.payment.service;

import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class PayPalService {

    private APIContext apiContext;

    public PayPalService() {
        log.info("PayPalService initialized without APIContext");
    }

    @Autowired(required = false)
    public void setApiContext(APIContext apiContext) {
        this.apiContext = apiContext;
        if (apiContext != null) {
            log.info("PayPal APIContext configured successfully");
        } else {
            log.warn("PayPal APIContext is not available. PayPal integration is disabled.");
        }
    }

    private void checkPayPalAvailability() {
        if (apiContext == null) {
            throw new IllegalStateException("PayPal integration is not configured. Please configure valid PayPal credentials.");
        }
    }

    /**
     * Create a PayPal payment
     *
     * @param total       Total amount
     * @param currency    Currency code (e.g., "USD", "EUR")
     * @param description Payment description
     * @param cancelUrl   URL to redirect if payment is cancelled
     * @param successUrl  URL to redirect if payment is successful
     * @return Created Payment object
     */
    public Payment createPayment(
            BigDecimal total,
            String currency,
            String description,
            String cancelUrl,
            String successUrl
    ) throws PayPalRESTException {
        checkPayPalAvailability();
        log.info("Creating PayPal payment for amount: {} {}", total, currency);

        Amount amount = new Amount();
        amount.setCurrency(currency);
        amount.setTotal(total.setScale(2, RoundingMode.HALF_UP).toString());

        Transaction transaction = new Transaction();
        transaction.setDescription(description);
        transaction.setAmount(amount);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");

        Payment payment = new Payment();
        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl);
        payment.setRedirectUrls(redirectUrls);

        Payment createdPayment = payment.create(apiContext);
        log.info("PayPal payment created successfully with ID: {}", createdPayment.getId());

        return createdPayment;
    }

    /**
     * Execute a PayPal payment after user approval
     *
     * @param paymentId Payment ID
     * @param payerId   Payer ID
     * @return Executed Payment object
     */
    public Payment executePayment(String paymentId, String payerId) throws PayPalRESTException {
        checkPayPalAvailability();
        log.info("Executing PayPal payment: {} for payer: {}", paymentId, payerId);

        Payment payment = new Payment();
        payment.setId(paymentId);

        PaymentExecution paymentExecute = new PaymentExecution();
        paymentExecute.setPayerId(payerId);

        Payment executedPayment = payment.execute(apiContext, paymentExecute);
        log.info("PayPal payment executed successfully: {}", executedPayment.getState());

        return executedPayment;
    }

    /**
     * Get payment details
     *
     * @param paymentId Payment ID
     * @return Payment object
     */
    public Payment getPaymentDetails(String paymentId) throws PayPalRESTException {
        checkPayPalAvailability();
        log.info("Fetching PayPal payment details for ID: {}", paymentId);
        return Payment.get(apiContext, paymentId);
    }

    /**
     * Extract approval URL from payment
     *
     * @param payment Payment object
     * @return Approval URL
     */
    public String getApprovalUrl(Payment payment) {
        return payment.getLinks().stream()
                .filter(link -> link.getRel().equals("approval_url"))
                .findFirst()
                .map(Links::getHref)
                .orElse(null);
    }

    /**
     * Check if PayPal integration is available
     *
     * @return true if PayPal is configured and available
     */
    public boolean isPayPalAvailable() {
        return apiContext != null;
    }
}

