-- Order Service Migration
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    client_email VARCHAR(100) NOT NULL,
    client_nom VARCHAR(100) NOT NULL,
    client_prenom VARCHAR(100) NOT NULL,
    client_telephone VARCHAR(20),
    adresse_livraison VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL,
    montant_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_number (order_number),
    INDEX idx_client_email (client_email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    sous_total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO orders (order_number, client_email, client_nom, client_prenom, client_telephone, adresse_livraison, status, montant_total) VALUES
('ORD-SAMPLE01', 'john.doe@example.com', 'Doe', 'John', '1234567890', '123 Main St, City, Country', 'PENDING', 1299.99);

INSERT INTO order_items (order_id, product_id, quantity, prix_unitaire, sous_total) VALUES
(1, 1, 1, 1299.99, 1299.99);
package com.catalogue.order.service;

import com.catalogue.order.client.ProductClient;
import com.catalogue.order.dto.OrderDTO;
import com.catalogue.order.dto.OrderItemDTO;
import com.catalogue.order.dto.ProductDTO;
import com.catalogue.order.entity.Order;
import com.catalogue.order.entity.OrderItem;
import com.catalogue.order.entity.OrderStatus;
import com.catalogue.order.mapper.OrderItemMapper;
import com.catalogue.order.mapper.OrderMapper;
import com.catalogue.order.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final ProductClient productClient;

    public OrderDTO createOrder(OrderDTO orderDTO) {
        // Generate order number
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        orderDTO.setOrderNumber(orderNumber);
        orderDTO.setStatus(OrderStatus.PENDING);

        // Calculate total and validate products
        BigDecimal montantTotal = BigDecimal.ZERO;
        for (OrderItemDTO itemDTO : orderDTO.getOrderItems()) {
            // Fetch product details and validate
            ProductDTO product = productClient.getProductById(itemDTO.getProductId());

            if (!product.getDisponible()) {
                throw new IllegalStateException("Product " + product.getNom() + " is not available");
            }

            if (product.getStockQuantity() < itemDTO.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product " + product.getNom());
            }

            // Set prices
            itemDTO.setPrixUnitaire(product.getPrix());
            BigDecimal sousTotal = product.getPrix().multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            itemDTO.setSousTotal(sousTotal);
            montantTotal = montantTotal.add(sousTotal);

            // Update stock
            int newStock = product.getStockQuantity() - itemDTO.getQuantity();
            productClient.updateStock(product.getId(), newStock);
        }

        orderDTO.setMontantTotal(montantTotal);

        // Create order
        Order order = orderMapper.toEntity(orderDTO);

        // Link order items to order
        for (OrderItem item : order.getOrderItems()) {
            item.setOrder(order);
        }

        Order savedOrder = orderRepository.save(order);
        return enrichWithProductNames(orderMapper.toDTO(savedOrder));
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        return enrichWithProductNames(orderMapper.toDTO(order));
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        List<OrderDTO> orderDTOs = orderMapper.toDTOList(orders);
        orderDTOs.forEach(this::enrichWithProductNames);
        return orderDTOs;
    }

    public OrderDTO updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        return enrichWithProductNames(orderMapper.toDTO(updatedOrder));
    }

    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new EntityNotFoundException("Order not found with id: " + id);
        }
        orderRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with order number: " + orderNumber));
        return enrichWithProductNames(orderMapper.toDTO(order));
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByClientEmail(String clientEmail) {
        List<Order> orders = orderRepository.findByClientEmail(clientEmail);
        List<OrderDTO> orderDTOs = orderMapper.toDTOList(orders);
        orderDTOs.forEach(this::enrichWithProductNames);
        return orderDTOs;
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatus(status);
        List<OrderDTO> orderDTOs = orderMapper.toDTOList(orders);
        orderDTOs.forEach(this::enrichWithProductNames);
        return orderDTOs;
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByDateRange(Instant start, Instant end) {
        List<Order> orders = orderRepository.findByCreatedAtBetween(start, end);
        List<OrderDTO> orderDTOs = orderMapper.toDTOList(orders);
        orderDTOs.forEach(this::enrichWithProductNames);
        return orderDTOs;
    }

    /**
     * Enrich OrderDTO with product names by calling product-service
     */
    private OrderDTO enrichWithProductNames(OrderDTO orderDTO) {
        for (OrderItemDTO itemDTO : orderDTO.getOrderItems()) {
            try {
                ProductDTO product = productClient.getProductById(itemDTO.getProductId());
                itemDTO.setProductNom(product.getNom());
            } catch (Exception e) {
                log.warn("Could not fetch product name for productId: {}", itemDTO.getProductId());
                itemDTO.setProductNom("Unknown Product");
            }
        }
        return orderDTO;
    }
}

