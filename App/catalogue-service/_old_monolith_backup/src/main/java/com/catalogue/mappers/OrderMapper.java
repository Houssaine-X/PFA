package com.catalogue.mappers;

import com.catalogue.dtos.OrderDTO;
import com.catalogue.entities.Order;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {OrderItemMapper.class})
public interface OrderMapper {

    OrderDTO toDTO(Order order);

    Order toEntity(OrderDTO orderDTO);

    List<OrderDTO> toDTOList(List<Order> orders);

    void updateEntityFromDTO(OrderDTO orderDTO, @MappingTarget Order order);
}

