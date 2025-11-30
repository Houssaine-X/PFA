package com.catalogue.mappers;

import com.catalogue.dtos.OrderItemDTO;
import com.catalogue.entities.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {

    @Mapping(source = "order.id", target = "orderId")
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.nom", target = "productNom")
    OrderItemDTO toDTO(OrderItem orderItem);

    @Mapping(source = "orderId", target = "order.id")
    @Mapping(source = "productId", target = "product.id")
    OrderItem toEntity(OrderItemDTO orderItemDTO);

    List<OrderItemDTO> toDTOList(List<OrderItem> orderItems);

    @Mapping(source = "orderId", target = "order.id")
    @Mapping(source = "productId", target = "product.id")
    void updateEntityFromDTO(OrderItemDTO orderItemDTO, @MappingTarget OrderItem orderItem);
}

