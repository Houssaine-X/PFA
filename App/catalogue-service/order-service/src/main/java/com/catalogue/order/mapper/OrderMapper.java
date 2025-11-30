package com.catalogue.order.mapper;

import com.catalogue.order.dto.OrderDTO;
import com.catalogue.order.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {OrderItemMapper.class})
public interface OrderMapper {

    @Mapping(target = "orderItems", source = "orderItems")
    OrderDTO toDTO(Order order);

    @Mapping(target = "orderItems", source = "orderItems")
    Order toEntity(OrderDTO orderDTO);

    List<OrderDTO> toDTOList(List<Order> orders);

    void updateEntityFromDTO(OrderDTO orderDTO, @MappingTarget Order order);
}

