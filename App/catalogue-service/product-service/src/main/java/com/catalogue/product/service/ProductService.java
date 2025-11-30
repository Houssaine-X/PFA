package com.catalogue.product.service;

import com.catalogue.product.dto.CategoryDTO;
import com.catalogue.product.dto.ProductDTO;
import com.catalogue.product.entity.Product;
import com.catalogue.product.mapper.ProductMapper;
import com.catalogue.product.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final RestTemplate restTemplate;

    public ProductDTO createProduct(ProductDTO productDTO) {
        // Validate category exists by calling category-service
        validateCategoryExists(productDTO.getCategoryId());

        Product product = productMapper.toEntity(productDTO);
        Product savedProduct = productRepository.save(product);
        return productMapper.toDTO(savedProduct);
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        return productMapper.toDTO(product);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return productMapper.toDTOList(products);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategoryId(Long categoryId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        return productMapper.toDTOList(products);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(Long categoryId) {
        return getProductsByCategoryId(categoryId);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getAvailableProducts() {
        List<Product> products = productRepository.findByDisponibleTrue();
        return productMapper.toDTOList(products);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> searchProducts(String nom) {
        List<Product> products = productRepository.findByNomContainingIgnoreCase(nom);
        return productMapper.toDTOList(products);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByPriceRange(java.math.BigDecimal minPrix, java.math.BigDecimal maxPrix) {
        List<Product> products = productRepository.findByPrixBetween(minPrix, maxPrix);
        return productMapper.toDTOList(products);
    }

    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        if (productDTO.getCategoryId() != null && !productDTO.getCategoryId().equals(existingProduct.getCategoryId())) {
            validateCategoryExists(productDTO.getCategoryId());
        }

        productMapper.updateEntityFromDTO(productDTO, existingProduct);
        Product updatedProduct = productRepository.save(existingProduct);
        return productMapper.toDTO(updatedProduct);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    public ProductDTO updateStock(Long id, Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        product.setStockQuantity(quantity);
        product.setDisponible(quantity > 0);

        Product updatedProduct = productRepository.save(product);
        return productMapper.toDTO(updatedProduct);
    }

    private void validateCategoryExists(Long categoryId) {
        try {
            String categoryServiceUrl = "http://localhost:8081/api/categories/" + categoryId;
            restTemplate.getForObject(categoryServiceUrl, CategoryDTO.class);
        } catch (Exception e) {
            throw new EntityNotFoundException("Category not found with id: " + categoryId);
        }
    }
}
