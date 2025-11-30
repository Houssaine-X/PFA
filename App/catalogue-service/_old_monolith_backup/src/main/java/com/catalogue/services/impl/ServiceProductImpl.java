package com.catalogue.services.impl;

import com.catalogue.dtos.ProductDTO;
import com.catalogue.entities.Category;
import com.catalogue.entities.Product;
import com.catalogue.mappers.ProductMapper;
import com.catalogue.repositories.CategoryRepository;
import com.catalogue.repositories.ProductRepository;
import com.catalogue.services.interfaces.IServiceProduct;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceProductImpl implements IServiceProduct {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductDTO createProduct(ProductDTO productDTO) {
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + productDTO.getCategoryId()));

        Product product = productMapper.toEntity(productDTO);
        product.setCategory(category);
        Product savedProduct = productRepository.save(product);
        return productMapper.toDTO(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        return productMapper.toDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return productMapper.toDTOList(products);
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        if (productDTO.getCategoryId() != null && !productDTO.getCategoryId().equals(existingProduct.getCategory().getId())) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + productDTO.getCategoryId()));
            existingProduct.setCategory(category);
        }

        productMapper.updateEntityFromDTO(productDTO, existingProduct);
        Product updatedProduct = productRepository.save(existingProduct);
        return productMapper.toDTO(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new EntityNotFoundException("Category not found with id: " + categoryId);
        }
        List<Product> products = productRepository.findByCategoryId(categoryId);
        return productMapper.toDTOList(products);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAvailableProducts() {
        List<Product> products = productRepository.findByDisponibleTrue();
        return productMapper.toDTOList(products);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> searchProducts(String keyword) {
        List<Product> products = productRepository.findByNomContainingIgnoreCase(keyword);
        return productMapper.toDTOList(products);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByPriceRange(BigDecimal minPrix, BigDecimal maxPrix) {
        List<Product> products = productRepository.findByPrixBetween(minPrix, maxPrix);
        return productMapper.toDTOList(products);
    }

    @Override
    public ProductDTO updateStock(Long id, Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        product.setStockQuantity(quantity);
        product.setDisponible(quantity > 0);
        Product updatedProduct = productRepository.save(product);
        return productMapper.toDTO(updatedProduct);
    }
}

