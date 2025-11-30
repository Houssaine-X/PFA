package com.catalogue.services.impl;

import com.catalogue.dtos.OrderDTO;
import com.catalogue.dtos.OrderItemDTO;
import com.catalogue.entities.Order;
import com.catalogue.entities.OrderItem;
import com.catalogue.entities.OrderStatus;
import com.catalogue.entities.Product;
import com.catalogue.mappers.OrderMapper;
import com.catalogue.repositories.OrderRepository;
import com.catalogue.repositories.ProductRepository;
import com.catalogue.services.interfaces.IServiceOrder;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceOrderImpl implements IServiceOrder {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;

    @Override
    public OrderDTO createOrder(OrderDTO orderDTO) {
        Order order = orderMapper.toEntity(orderDTO);
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemDTO itemDTO : orderDTO.getOrderItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + itemDTO.getProductId()));

            if (product.getStockQuantity() < itemDTO.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getNom());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPrixUnitaire(product.getPrix());
            orderItem.setSousTotal(product.getPrix().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));

            orderItems.add(orderItem);
            total = total.add(orderItem.getSousTotal());

            product.setStockQuantity(product.getStockQuantity() - itemDTO.getQuantity());
            product.setDisponible(product.getStockQuantity() > 0);
        }

        order.setOrderItems(orderItems);
        order.setMontantTotal(total);

        Order savedOrder = orderRepository.save(order);
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        return orderMapper.toDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orderMapper.toDTOList(orders);
    }

    @Override
    public OrderDTO updateOrder(Long id, OrderDTO orderDTO) {
        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));

        orderMapper.updateEntityFromDTO(orderDTO, existingOrder);
        Order updatedOrder = orderRepository.save(existingOrder);
        return orderMapper.toDTO(updatedOrder);
    }

    @Override
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new EntityNotFoundException("Order not found with id: " + id);
        }
        orderRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with number: " + orderNumber));
        return orderMapper.toDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByClient(String clientEmail) {
        List<Order> orders = orderRepository.findByClientEmail(clientEmail);
        return orderMapper.toDTOList(orders);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatus(status);
        return orderMapper.toDTOList(orders);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByDateRange(Instant start, Instant end) {
        List<Order> orders = orderRepository.findByCreatedAtBetween(start, end);
        return orderMapper.toDTOList(orders);
    }

    @Override
    public OrderDTO updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDTO(updatedOrder);
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

