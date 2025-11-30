package com.catalogue.category.service;

import com.catalogue.category.dto.CategoryDTO;
import com.catalogue.category.entity.Category;
import com.catalogue.category.mapper.CategoryMapper;
import com.catalogue.category.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByNom(categoryDTO.getNom())) {
            throw new DataIntegrityViolationException("Category with name '" + categoryDTO.getNom() + "' already exists");
        }
        Category category = categoryMapper.toEntity(categoryDTO);
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toDTO(savedCategory);
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        return categoryMapper.toDTO(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categoryMapper.toDTOList(categories);
    }

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

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryByNom(String nom) {
        Category category = categoryRepository.findByNom(nom)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with name: " + nom));
        return categoryMapper.toDTO(category);
    }
}

