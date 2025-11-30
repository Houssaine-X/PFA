package com.catalogue.services.impl;

import com.catalogue.dtos.OrderItemDTO;
import com.catalogue.entities.Order;
import com.catalogue.entities.OrderItem;
import com.catalogue.entities.Product;
import com.catalogue.mappers.OrderItemMapper;
import com.catalogue.repositories.OrderItemRepository;
import com.catalogue.repositories.OrderRepository;
import com.catalogue.repositories.ProductRepository;
import com.catalogue.services.interfaces.IServiceOrderItem;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceOrderItemImpl implements IServiceOrderItem {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderItemMapper orderItemMapper;

    @Override
    public OrderItemDTO createOrderItem(OrderItemDTO orderItemDTO) {
        Order order = orderRepository.findById(orderItemDTO.getOrderId())
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + orderItemDTO.getOrderId()));

        Product product = productRepository.findById(orderItemDTO.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + orderItemDTO.getProductId()));

        OrderItem orderItem = orderItemMapper.toEntity(orderItemDTO);
        orderItem.setOrder(order);
        orderItem.setProduct(product);
        orderItem.setPrixUnitaire(product.getPrix());
        orderItem.setSousTotal(product.getPrix().multiply(BigDecimal.valueOf(orderItemDTO.getQuantity())));

        OrderItem savedOrderItem = orderItemRepository.save(orderItem);
        return orderItemMapper.toDTO(savedOrderItem);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderItemDTO getOrderItemById(Long id) {
        OrderItem orderItem = orderItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("OrderItem not found with id: " + id));
        return orderItemMapper.toDTO(orderItem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderItemDTO> getAllOrderItems() {
        List<OrderItem> orderItems = orderItemRepository.findAll();
        return orderItemMapper.toDTOList(orderItems);
    }

    @Override
    public OrderItemDTO updateOrderItem(Long id, OrderItemDTO orderItemDTO) {
        OrderItem existingOrderItem = orderItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("OrderItem not found with id: " + id));

        orderItemMapper.updateEntityFromDTO(orderItemDTO, existingOrderItem);
        OrderItem updatedOrderItem = orderItemRepository.save(existingOrderItem);
        return orderItemMapper.toDTO(updatedOrderItem);
    }

    @Override
    public void deleteOrderItem(Long id) {
        if (!orderItemRepository.existsById(id)) {
            throw new EntityNotFoundException("OrderItem not found with id: " + id);
        }
        orderItemRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderItemDTO> getOrderItemsByOrder(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new EntityNotFoundException("Order not found with id: " + orderId);
        }
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        return orderItemMapper.toDTOList(orderItems);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderItemDTO> getOrderItemsByProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new EntityNotFoundException("Product not found with id: " + productId);
        }
        List<OrderItem> orderItems = orderItemRepository.findByProductId(productId);
        return orderItemMapper.toDTOList(orderItems);
    }
}

