package com.catalogue.product.controller;

import com.catalogue.product.dto.ebay.EbaySearchResponse;
import com.catalogue.product.service.EbayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/ebay")
@RequiredArgsConstructor
@Slf4j
public class EbayProductController {

    private final EbayService ebayService;

    /**
     * Get featured products from eBay
     * GET /api/products/ebay/featured
     */
    @GetMapping("/featured")
    public ResponseEntity<EbaySearchResponse> getFeaturedProducts() {
        log.info("Fetching featured products from eBay");
        EbaySearchResponse response = ebayService.getFeaturedProducts();
        return ResponseEntity.ok(response);
    }

    /**
     * Search products on eBay
     * GET /api/products/ebay/search?q=laptop&limit=10
     */
    @GetMapping("/search")
    public ResponseEntity<EbaySearchResponse> searchProducts(
            @RequestParam String q,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        log.info("Searching eBay products: q={}, limit={}", q, limit);
        EbaySearchResponse response = ebayService.searchProducts(q, limit);
        return ResponseEntity.ok(response);
    }

    /**
     * Search products by category
     * GET /api/products/ebay/category/electronics?limit=10
     */
    @GetMapping("/category/{categoryName}")
    public ResponseEntity<EbaySearchResponse> getProductsByCategory(
            @PathVariable String categoryName,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        log.info("Searching eBay products by category: {}", categoryName);
        EbaySearchResponse response = ebayService.searchByCategory(categoryName, limit);
        return ResponseEntity.ok(response);
    }
}
