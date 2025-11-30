package com.catalogue.mappers;

import com.catalogue.dtos.ProductDTO;
import com.catalogue.entities.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.nom", target = "categoryNom")
    ProductDTO toDTO(Product product);

    @Mapping(source = "categoryId", target = "category.id")
    Product toEntity(ProductDTO productDTO);

    List<ProductDTO> toDTOList(List<Product> products);

    @Mapping(source = "categoryId", target = "category.id")
    void updateEntityFromDTO(ProductDTO productDTO, @MappingTarget Product product);
}

