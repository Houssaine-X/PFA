package com.catalogue.order.service;

import com.catalogue.order.client.ProductClient;
import com.catalogue.order.dto.OrderDTO;
import com.catalogue.order.dto.OrderItemDTO;
import com.catalogue.order.dto.ProductDTO;
import com.catalogue.order.entity.Order;
import com.catalogue.order.entity.OrderItem;
import com.catalogue.order.entity.OrderStatus;
import com.catalogue.order.mapper.OrderMapper;
import com.catalogue.order.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final ProductClient productClient;

    public OrderDTO createOrder(OrderDTO orderDTO) {
        // Validate products and calculate totals
        BigDecimal montantTotal = BigDecimal.ZERO;

        for (OrderItemDTO itemDTO : orderDTO.getOrderItems()) {
            ProductDTO product = productClient.getProductById(itemDTO.getProductId());

            if (!product.getDisponible()) {
                throw new IllegalStateException("Product " + product.getNom() + " is not available");
            }

            if (product.getStockQuantity() < itemDTO.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product " + product.getNom());
            }

            BigDecimal itemTotal = product.getPrix().multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            itemDTO.setPrixUnitaire(product.getPrix());
            itemDTO.setSousTotal(itemTotal);
            itemDTO.setProductNom(product.getNom());

            montantTotal = montantTotal.add(itemTotal);
        }

        orderDTO.setOrderNumber(generateOrderNumber());
        orderDTO.setStatus(OrderStatus.PENDING);
        orderDTO.setMontantTotal(montantTotal);

        Order order = orderMapper.toEntity(orderDTO);

        // Set bidirectional relationship
        for (OrderItem item : order.getOrderItems()) {
            item.setOrder(order);
        }

        Order savedOrder = orderRepository.save(order);

        // Update stock for each product
        for (OrderItemDTO itemDTO : orderDTO.getOrderItems()) {
            ProductDTO product = productClient.getProductById(itemDTO.getProductId());
            int newStock = product.getStockQuantity() - itemDTO.getQuantity();
            productClient.updateStock(itemDTO.getProductId(), newStock);
        }

        return orderMapper.toDTO(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        return orderMapper.toDTO(order);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with number: " + orderNumber));
        return orderMapper.toDTO(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orderMapper.toDTOList(orders);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByClientEmail(String clientEmail) {
        List<Order> orders = orderRepository.findByClientEmail(clientEmail);
        return orderMapper.toDTOList(orders);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatus(status);
        return orderMapper.toDTOList(orders);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByDateRange(Instant startDate, Instant endDate) {
        List<Order> orders = orderRepository.findByCreatedAtBetween(startDate, endDate);
        return orderMapper.toDTOList(orders);
    }

    public OrderDTO updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDTO(updatedOrder);
    }

    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel a delivered order");
        }

        // Restore stock for cancelled orders
        for (OrderItem item : order.getOrderItems()) {
            ProductDTO product = productClient.getProductById(item.getProductId());
            int newStock = product.getStockQuantity() + item.getQuantity();
            productClient.updateStock(item.getProductId(), newStock);
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new EntityNotFoundException("Order not found with id: " + id);
        }
        orderRepository.deleteById(id);
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
