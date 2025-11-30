package com.catalogue.category.repository;

import com.catalogue.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNom(String nom);
    boolean existsByNom(String nom);
}

