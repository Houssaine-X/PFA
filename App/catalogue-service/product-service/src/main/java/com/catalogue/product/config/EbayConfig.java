package com.catalogue.product.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "ebay.api")
@Data
public class EbayConfig {
    
    private String clientId;
    private String clientSecret;
    private String oauthUrl;
    private String apiUrl;
    private String marketplaceId;
    
    // Default values - Using Production API for real eBay products
    public EbayConfig() {
        this.oauthUrl = "https://api.ebay.com/identity/v1/oauth2/token";
        this.apiUrl = "https://api.ebay.com/buy/browse/v1";
        this.marketplaceId = "EBAY_US";
    }
}
