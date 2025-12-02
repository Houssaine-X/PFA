package com.catalogue.payment.service;

import com.catalogue.payment.dto.PaymentDTO;
import com.catalogue.payment.dto.PayPalExecuteRequest;
import com.catalogue.payment.dto.PayPalPaymentRequest;
import com.catalogue.payment.dto.PayPalPaymentResponse;
import com.catalogue.payment.entity.Payment;
import com.catalogue.payment.entity.PaymentMethod;
import com.catalogue.payment.entity.PaymentStatus;
import com.catalogue.payment.mapper.PaymentMapper;
import com.catalogue.payment.repository.PaymentRepository;
import com.paypal.base.rest.PayPalRESTException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final PayPalService payPalService;

    @Transactional(readOnly = true)
    public List<PaymentDTO> getAllPayments() {
        log.info("Fetching all payments");
        return paymentRepository.findAll()
                .stream()
                .map(paymentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentDTO getPaymentById(Long id) {
        log.info("Fetching payment with id: {}", id);
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return paymentMapper.toDTO(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDTO> getPaymentsByOrderId(Long orderId) {
        log.info("Fetching payments for order id: {}", orderId);
        return paymentRepository.findByOrderId(orderId)
                .stream()
                .map(paymentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentDTO> getPaymentsByUserId(Long userId) {
        log.info("Fetching payments for user id: {}", userId);
        return paymentRepository.findByUserId(userId)
                .stream()
                .map(paymentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentDTO> getPaymentsByStatus(PaymentStatus status) {
        log.info("Fetching payments with status: {}", status);
        return paymentRepository.findByStatus(status)
                .stream()
                .map(paymentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentDTO createPayment(PaymentDTO paymentDTO) {
        log.info("Creating new payment for order: {}", paymentDTO.getOrderId());
        Payment payment = paymentMapper.toEntity(paymentDTO);
        Payment savedPayment = paymentRepository.save(payment);
        return paymentMapper.toDTO(savedPayment);
    }

    @Transactional
    public PaymentDTO updatePayment(Long id, PaymentDTO paymentDTO) {
        log.info("Updating payment with id: {}", id);
        Payment existingPayment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));

        existingPayment.setStatus(paymentDTO.getStatus());
        existingPayment.setTransactionId(paymentDTO.getTransactionId());
        existingPayment.setDescription(paymentDTO.getDescription());

        Payment updatedPayment = paymentRepository.save(existingPayment);
        return paymentMapper.toDTO(updatedPayment);
    }

    @Transactional
    public void deletePayment(Long id) {
        log.info("Deleting payment with id: {}", id);
        if (!paymentRepository.existsById(id)) {
            throw new RuntimeException("Payment not found with id: " + id);
        }
        paymentRepository.deleteById(id);
    }

    /**
     * Create a PayPal payment
     */
    @Transactional
    public PayPalPaymentResponse createPayPalPayment(PayPalPaymentRequest request) {
        log.info("Creating PayPal payment for order: {}", request.getOrderId());

        try {
            // Create payment in PayPal
            com.paypal.api.payments.Payment paypalPayment = payPalService.createPayment(
                    request.getAmount(),
                    request.getCurrency(),
                    request.getDescription(),
                    request.getCancelUrl(),
                    request.getSuccessUrl()
            );

            // Save payment record in database
            Payment payment = Payment.builder()
                    .orderId(request.getOrderId())
                    .userId(request.getUserId())
                    .amount(request.getAmount())
                    .paymentMethod(PaymentMethod.PAYPAL)
                    .status(PaymentStatus.PENDING)
                    .transactionId(paypalPayment.getId())
                    .description(request.getDescription())
                    .build();

            paymentRepository.save(payment);

            // Get approval URL
            String approvalUrl = payPalService.getApprovalUrl(paypalPayment);

            return PayPalPaymentResponse.builder()
                    .paymentId(paypalPayment.getId())
                    .status(paypalPayment.getState())
                    .approvalUrl(approvalUrl)
                    .message("Payment created successfully. Please complete payment via PayPal.")
                    .build();

        } catch (PayPalRESTException e) {
            log.error("Error creating PayPal payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create PayPal payment: " + e.getMessage());
        }
    }

    /**
     * Execute a PayPal payment after user approval
     */
    @Transactional
    public PayPalPaymentResponse executePayPalPayment(PayPalExecuteRequest request) {
        log.info("Executing PayPal payment: {}", request.getPaymentId());

        try {
            // Execute payment in PayPal
            com.paypal.api.payments.Payment executedPayment = payPalService.executePayment(
                    request.getPaymentId(),
                    request.getPayerId()
            );

            // Update payment status in database
            Payment payment = paymentRepository.findByTransactionId(request.getPaymentId())
                    .orElseThrow(() -> new RuntimeException("Payment not found with transaction ID: " + request.getPaymentId()));

            if ("approved".equalsIgnoreCase(executedPayment.getState())) {
                payment.setStatus(PaymentStatus.COMPLETED);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
            }

            paymentRepository.save(payment);

            return PayPalPaymentResponse.builder()
                    .paymentId(executedPayment.getId())
                    .status(executedPayment.getState())
                    .message("Payment executed successfully")
                    .build();

        } catch (PayPalRESTException e) {
            log.error("Error executing PayPal payment: {}", e.getMessage(), e);

            // Update payment status to failed
            paymentRepository.findByTransactionId(request.getPaymentId())
                    .ifPresent(payment -> {
                        payment.setStatus(PaymentStatus.FAILED);
                        paymentRepository.save(payment);
                    });

            throw new RuntimeException("Failed to execute PayPal payment: " + e.getMessage());
        }
    }

    /**
     * Cancel a PayPal payment
     */
    @Transactional
    public void cancelPayPalPayment(String paymentId) {
        log.info("Cancelling PayPal payment: {}", paymentId);

        Payment payment = paymentRepository.findByTransactionId(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with transaction ID: " + paymentId));

        payment.setStatus(PaymentStatus.CANCELLED);
        paymentRepository.save(payment);
    }
}

