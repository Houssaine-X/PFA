package com.catalogue.payment.controller;

import com.catalogue.payment.dto.PaymentDTO;
import com.catalogue.payment.dto.PayPalExecuteRequest;
import com.catalogue.payment.dto.PayPalPaymentRequest;
import com.catalogue.payment.dto.PayPalPaymentResponse;
import com.catalogue.payment.entity.PaymentStatus;
import com.catalogue.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        log.info("GET /api/payments - Fetching all payments");
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDTO> getPaymentById(@PathVariable Long id) {
        log.info("GET /api/payments/{} - Fetching payment by id", id);
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByOrderId(@PathVariable Long orderId) {
        log.info("GET /api/payments/order/{} - Fetching payments by order id", orderId);
        return ResponseEntity.ok(paymentService.getPaymentsByOrderId(orderId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByUserId(@PathVariable Long userId) {
        log.info("GET /api/payments/user/{} - Fetching payments by user id", userId);
        return ResponseEntity.ok(paymentService.getPaymentsByUserId(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByStatus(@PathVariable PaymentStatus status) {
        log.info("GET /api/payments/status/{} - Fetching payments by status", status);
        return ResponseEntity.ok(paymentService.getPaymentsByStatus(status));
    }

    @PostMapping
    public ResponseEntity<PaymentDTO> createPayment(@Valid @RequestBody PaymentDTO paymentDTO) {
        log.info("POST /api/payments - Creating new payment");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.createPayment(paymentDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentDTO> updatePayment(@PathVariable Long id,
                                                     @Valid @RequestBody PaymentDTO paymentDTO) {
        log.info("PUT /api/payments/{} - Updating payment", id);
        return ResponseEntity.ok(paymentService.updatePayment(id, paymentDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        log.info("DELETE /api/payments/{} - Deleting payment", id);
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    // PayPal specific endpoints

    @PostMapping("/paypal/create")
    public ResponseEntity<PayPalPaymentResponse> createPayPalPayment(
            @Valid @RequestBody PayPalPaymentRequest request) {
        log.info("POST /api/payments/paypal/create - Creating PayPal payment");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.createPayPalPayment(request));
    }

    @PostMapping("/paypal/execute")
    public ResponseEntity<PayPalPaymentResponse> executePayPalPayment(
            @Valid @RequestBody PayPalExecuteRequest request) {
        log.info("POST /api/payments/paypal/execute - Executing PayPal payment");
        return ResponseEntity.ok(paymentService.executePayPalPayment(request));
    }

    @PostMapping("/paypal/cancel/{paymentId}")
    public ResponseEntity<Void> cancelPayPalPayment(@PathVariable String paymentId) {
        log.info("POST /api/payments/paypal/cancel/{} - Cancelling PayPal payment", paymentId);
        paymentService.cancelPayPalPayment(paymentId);
        return ResponseEntity.noContent().build();
    }
}

