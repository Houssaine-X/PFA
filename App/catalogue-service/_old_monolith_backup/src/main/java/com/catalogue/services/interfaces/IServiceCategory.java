package com.catalogue.services.interfaces;

import com.catalogue.dtos.CategoryDTO;

import java.util.List;

public interface IServiceCategory {
    CategoryDTO createCategory(CategoryDTO categoryDTO);
    CategoryDTO getCategoryById(Long id);
    List<CategoryDTO> getAllCategories();
    CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO);
    void deleteCategory(Long id);
    CategoryDTO getCategoryByNom(String nom);
}

