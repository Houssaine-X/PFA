package com.catalogue.product.service;

import com.catalogue.product.config.EbayConfig;
import com.catalogue.product.dto.ebay.EbayOAuthResponse;
import com.catalogue.product.dto.ebay.EbaySearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class EbayService {

    private final WebClient webClient;
    private final EbayConfig ebayConfig;
    
    private String cachedAccessToken;
    private Instant tokenExpiryTime;

    /**
     * Get OAuth access token for eBay API
     */
    private String getAccessToken() {
        // Check if we have a valid cached token
        if (cachedAccessToken != null && tokenExpiryTime != null && 
            Instant.now().isBefore(tokenExpiryTime)) {
            log.info("Using cached eBay access token");
            return cachedAccessToken;
        }

        log.info("Requesting new eBay access token");
        
        // Create credentials string for Basic Auth
        String credentials = ebayConfig.getClientId() + ":" + ebayConfig.getClientSecret();
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());

        // Prepare form data
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "client_credentials");
        formData.add("scope", "https://api.ebay.com/oauth/api_scope");

        try {
            EbayOAuthResponse response = webClient.post()
                    .uri(ebayConfig.getOauthUrl())
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + encodedCredentials)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(EbayOAuthResponse.class)
                    .block();

            if (response != null && response.getAccessToken() != null) {
                cachedAccessToken = response.getAccessToken();
                // Set expiry time with 5 minutes buffer
                tokenExpiryTime = Instant.now().plusSeconds(response.getExpiresIn() - 300);
                log.info("Successfully obtained eBay access token");
                return cachedAccessToken;
            }
        } catch (Exception e) {
            log.error("Error getting eBay access token: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to authenticate with eBay API", e);
        }

        throw new RuntimeException("Failed to obtain access token from eBay");
    }

    /**
     * Search for products on eBay
     * @param query Search query string
     * @param limit Number of items to retrieve (default: 10, max: 200)
     * @return EbaySearchResponse containing list of items
     */
    public EbaySearchResponse searchProducts(String query, Integer limit) {
        String accessToken = getAccessToken();
        
        // Validate and set default limit
        final Integer finalLimit;
        if (limit == null || limit <= 0) {
            finalLimit = 10;
        } else if (limit > 200) {
            finalLimit = 200;
        } else {
            finalLimit = limit;
        }

        log.info("Searching eBay for: {} (limit: {})", query, finalLimit);

        try {
            String searchUrl = ebayConfig.getApiUrl() + "/item_summary/search";
            
            EbaySearchResponse response = webClient.get()
                    .uri(searchUrl + "?q={query}&limit={limit}", query, finalLimit)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .header("X-EBAY-C-MARKETPLACE-ID", ebayConfig.getMarketplaceId())
                    .retrieve()
                    .bodyToMono(EbaySearchResponse.class)
                    .block();

            log.info("eBay search returned {} items", 
                    response != null && response.getItemSummaries() != null ? 
                    response.getItemSummaries().size() : 0);

            return response;
        } catch (Exception e) {
            log.error("Error searching eBay products: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to search eBay products", e);
        }
    }

    /**
     * Get featured products (electronics by default)
     */
    public EbaySearchResponse getFeaturedProducts() {
        return searchProducts("electronics", 20);
    }

    /**
     * Search products by category
     */
    public EbaySearchResponse searchByCategory(String category, Integer limit) {
        return searchProducts(category, limit);
    }
}
