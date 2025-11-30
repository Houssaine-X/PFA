package com.catalogue.services.interfaces;

import com.catalogue.dtos.OrderItemDTO;

import java.util.List;

public interface IServiceOrderItem {
    OrderItemDTO createOrderItem(OrderItemDTO orderItemDTO);
    OrderItemDTO getOrderItemById(Long id);
    List<OrderItemDTO> getAllOrderItems();
    OrderItemDTO updateOrderItem(Long id, OrderItemDTO orderItemDTO);
    void deleteOrderItem(Long id);
    List<OrderItemDTO> getOrderItemsByOrder(Long orderId);
    List<OrderItemDTO> getOrderItemsByProduct(Long productId);
}

