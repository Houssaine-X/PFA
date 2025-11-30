package com.catalogue.repositories;

import com.catalogue.entities.Order;
import com.catalogue.entities.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByClientEmail(String clientEmail);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByCreatedAtBetween(Instant start, Instant end);
}

