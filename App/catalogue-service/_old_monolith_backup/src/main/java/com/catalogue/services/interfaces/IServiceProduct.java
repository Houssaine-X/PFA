package com.catalogue.services.interfaces;

import com.catalogue.dtos.ProductDTO;

import java.math.BigDecimal;
import java.util.List;

public interface IServiceProduct {
    ProductDTO createProduct(ProductDTO productDTO);
    ProductDTO getProductById(Long id);
    List<ProductDTO> getAllProducts();
    ProductDTO updateProduct(Long id, ProductDTO productDTO);
    void deleteProduct(Long id);
    List<ProductDTO> getProductsByCategory(Long categoryId);
    List<ProductDTO> getAvailableProducts();
    List<ProductDTO> searchProducts(String keyword);
    List<ProductDTO> getProductsByPriceRange(BigDecimal minPrix, BigDecimal maxPrix);
    ProductDTO updateStock(Long id, Integer quantity);
}

