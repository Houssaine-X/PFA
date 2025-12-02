package com.catalogue.payment.repository;

import com.catalogue.payment.entity.Payment;
import com.catalogue.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByOrderId(Long orderId);

    List<Payment> findByUserId(Long userId);

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByOrderIdAndUserId(Long orderId, Long userId);

    Optional<Payment> findByTransactionId(String transactionId);
}

