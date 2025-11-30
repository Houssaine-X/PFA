-- Product Service Migration
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    prix DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL,
    image_url VARCHAR(500),
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    category_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_id (category_id),
    INDEX idx_disponible (disponible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO products (nom, description, prix, stock_quantity, disponible, category_id) VALUES
('Laptop Dell XPS 13', 'High-performance ultrabook', 1299.99, 10, TRUE, 1),
('The Great Gatsby', 'Classic American novel', 12.99, 50, TRUE, 2),
('Blue Jeans', 'Comfortable denim jeans', 49.99, 30, TRUE, 3);

        if (productDTO.getCategoryId() != null && !productDTO.getCategoryId().equals(existingProduct.getCategoryId())) {
            // Validate new category
            try {
                categoryClient.getCategoryById(productDTO.getCategoryId());
            } catch (Exception e) {
                throw new EntityNotFoundException("Category not found with id: " + productDTO.getCategoryId());
            }
        }

        productMapper.updateEntityFromDTO(productDTO, existingProduct);
        Product updatedProduct = productRepository.save(existingProduct);
        return enrichWithCategoryName(productMapper.toDTO(updatedProduct));
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(Long categoryId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        List<ProductDTO> productDTOs = productMapper.toDTOList(products);
        productDTOs.forEach(this::enrichWithCategoryName);
        return productDTOs;
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getAvailableProducts() {
        List<Product> products = productRepository.findByDisponibleTrue();
        List<ProductDTO> productDTOs = productMapper.toDTOList(products);
        productDTOs.forEach(this::enrichWithCategoryName);
        return productDTOs;
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> searchProducts(String keyword) {
        List<Product> products = productRepository.findByNomContainingIgnoreCase(keyword);
        List<ProductDTO> productDTOs = productMapper.toDTOList(products);
        productDTOs.forEach(this::enrichWithCategoryName);
        return productDTOs;
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByPriceRange(BigDecimal minPrix, BigDecimal maxPrix) {
        List<Product> products = productRepository.findByPrixBetween(minPrix, maxPrix);
        List<ProductDTO> productDTOs = productMapper.toDTOList(products);
        productDTOs.forEach(this::enrichWithCategoryName);
        return productDTOs;
    }

    public ProductDTO updateStock(Long id, Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        product.setStockQuantity(quantity);
        product.setDisponible(quantity > 0);
        Product updatedProduct = productRepository.save(product);
        return enrichWithCategoryName(productMapper.toDTO(updatedProduct));
    }

    /**
     * Enrich ProductDTO with category name by calling category-service
     */
    private ProductDTO enrichWithCategoryName(ProductDTO productDTO) {
        try {
            CategoryDTO category = categoryClient.getCategoryById(productDTO.getCategoryId());
            productDTO.setCategoryNom(category.getNom());
        } catch (Exception e) {
            log.warn("Could not fetch category name for categoryId: {}", productDTO.getCategoryId());
            productDTO.setCategoryNom("Unknown");
        }
        return productDTO;
    }
}

