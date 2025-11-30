package com.catalogue.order.mapper;

import com.catalogue.order.dto.OrderItemDTO;
import com.catalogue.order.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {

    @Mapping(target = "order", ignore = true)
    OrderItem toEntity(OrderItemDTO orderItemDTO);

    OrderItemDTO toDTO(OrderItem orderItem);

    List<OrderItemDTO> toDTOList(List<OrderItem> orderItems);
}

