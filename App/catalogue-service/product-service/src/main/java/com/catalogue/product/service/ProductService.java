package com.catalogue.product.service;

import com.catalogue.product.dto.ProductDTO;
import com.catalogue.product.entity.Product;
import com.catalogue.product.mapper.ProductMapper;
import com.catalogue.product.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductDTO createProduct(ProductDTO productDTO) {
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
    public List<ProductDTO> getProductsByCategoryName(String categoryName) {
        List<Product> products = productRepository.findByCategoryName(categoryName);
        return productMapper.toDTOList(products);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> searchProductsByCategory(String categoryName) {
        List<Product> products = productRepository.findByCategoryNameContainingIgnoreCase(categoryName);
        return productMapper.toDTOList(products);
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
}
