package com.catalogue.controllers;

import com.catalogue.dtos.OrderDTO;
import com.catalogue.entities.OrderStatus;
import com.catalogue.services.interfaces.IServiceOrder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final IServiceOrder orderService;

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderDTO orderDTO) {
        OrderDTO created = orderService.createOrder(orderDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDTO> updateOrder(@PathVariable Long id, @Valid @RequestBody OrderDTO orderDTO) {
        OrderDTO updated = orderService.updateOrder(id, orderDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderDTO> getOrderByNumber(@PathVariable String orderNumber) {
        OrderDTO order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/client")
    public ResponseEntity<List<OrderDTO>> getOrdersByClient(@RequestParam String email) {
        List<OrderDTO> orders = orderService.getOrdersByClient(email);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderDTO>> getOrdersByStatus(@PathVariable OrderStatus status) {
        List<OrderDTO> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<OrderDTO>> getOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end) {
        List<OrderDTO> orders = orderService.getOrdersByDateRange(start, end);
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        OrderDTO updated = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}

