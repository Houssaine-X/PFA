package com.catalogue.repositories;

import com.catalogue.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByDisponibleTrue();
    List<Product> findByNomContainingIgnoreCase(String nom);
    List<Product> findByPrixBetween(BigDecimal minPrix, BigDecimal maxPrix);
}

