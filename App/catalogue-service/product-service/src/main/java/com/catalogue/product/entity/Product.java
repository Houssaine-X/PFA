package com.catalogue.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nom;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private BigDecimal prix;

    @Column(nullable = false)
    private Integer stockQuantity;

    private String imageUrl;

    @Column(nullable = false)
    private Boolean disponible = true;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}

