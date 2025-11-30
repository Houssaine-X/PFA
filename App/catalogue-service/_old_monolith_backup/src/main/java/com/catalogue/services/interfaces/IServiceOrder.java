package com.catalogue.services.interfaces;

import com.catalogue.dtos.OrderDTO;
import com.catalogue.entities.OrderStatus;

import java.time.Instant;
import java.util.List;

public interface IServiceOrder {
    OrderDTO createOrder(OrderDTO orderDTO);
    OrderDTO getOrderById(Long id);
    List<OrderDTO> getAllOrders();
    OrderDTO updateOrder(Long id, OrderDTO orderDTO);
    void deleteOrder(Long id);
    OrderDTO getOrderByNumber(String orderNumber);
    List<OrderDTO> getOrdersByClient(String clientEmail);
    List<OrderDTO> getOrdersByStatus(OrderStatus status);
    List<OrderDTO> getOrdersByDateRange(Instant start, Instant end);
    OrderDTO updateOrderStatus(Long id, OrderStatus status);
}

