package com.catalogue.mappers;

import com.catalogue.dtos.CategoryDTO;
import com.catalogue.entities.Category;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryDTO toDTO(Category category);

    Category toEntity(CategoryDTO categoryDTO);

    List<CategoryDTO> toDTOList(List<Category> categories);

    void updateEntityFromDTO(CategoryDTO categoryDTO, @MappingTarget Category category);
}

