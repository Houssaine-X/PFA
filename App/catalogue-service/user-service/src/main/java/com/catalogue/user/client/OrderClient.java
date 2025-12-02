package com.catalogue.user.client;

import com.catalogue.user.dto.OrderDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

/**
 * Feign client to communicate with Order Service
 */
@FeignClient(name = "order-service")
public interface OrderClient {

    @GetMapping("/api/orders/user/{userId}")
    List<OrderDTO> getOrdersByUserId(@PathVariable("userId") Long userId);
}

