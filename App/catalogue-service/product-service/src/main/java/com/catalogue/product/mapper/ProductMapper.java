package com.catalogue.product.mapper;

import com.catalogue.product.dto.ProductDTO;
import com.catalogue.product.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductDTO toDTO(Product product);

    Product toEntity(ProductDTO productDTO);

    List<ProductDTO> toDTOList(List<Product> products);

    void updateEntityFromDTO(ProductDTO productDTO, @MappingTarget Product product);
}

