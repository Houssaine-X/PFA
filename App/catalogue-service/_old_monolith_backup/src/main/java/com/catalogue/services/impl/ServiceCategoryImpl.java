package com.catalogue.services.impl;

import com.catalogue.dtos.CategoryDTO;
import com.catalogue.entities.Category;
import com.catalogue.mappers.CategoryMapper;
import com.catalogue.repositories.CategoryRepository;
import com.catalogue.services.interfaces.IServiceCategory;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceCategoryImpl implements IServiceCategory {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByNom(categoryDTO.getNom())) {
            throw new DataIntegrityViolationException("Category with name '" + categoryDTO.getNom() + "' already exists");
        }
        Category category = categoryMapper.toEntity(categoryDTO);
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toDTO(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        return categoryMapper.toDTO(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categoryMapper.toDTOList(categories);
    }

    @Override
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));

        if (!existingCategory.getNom().equals(categoryDTO.getNom()) &&
                categoryRepository.existsByNom(categoryDTO.getNom())) {
            throw new DataIntegrityViolationException("Category with name '" + categoryDTO.getNom() + "' already exists");
        }

        categoryMapper.updateEntityFromDTO(categoryDTO, existingCategory);
        Category updatedCategory = categoryRepository.save(existingCategory);
        return categoryMapper.toDTO(updatedCategory);
    }

    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryByNom(String nom) {
        Category category = categoryRepository.findByNom(nom)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with name: " + nom));
        return categoryMapper.toDTO(category);
    }
}

