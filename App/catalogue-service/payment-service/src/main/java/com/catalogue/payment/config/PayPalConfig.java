package com.catalogue.payment.config;

import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.OAuthTokenCredential;
import com.paypal.base.rest.PayPalRESTException;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import java.util.HashMap;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "paypal")
@Data
@Slf4j
public class PayPalConfig {

    private boolean enabled = false;
    private String clientId;
    private String clientSecret;
    private String mode; // sandbox or live

    @Bean
    public Map<String, String> paypalSdkConfig() {
        Map<String, String> configMap = new HashMap<>();
        configMap.put("mode", mode);
        return configMap;
    }

    @Bean
    @Lazy
    @ConditionalOnProperty(prefix = "paypal", name = "enabled", havingValue = "true")
    public OAuthTokenCredential oAuthTokenCredential() {
        if (!enabled || clientId == null || clientId.startsWith("YOUR_") || clientSecret == null || clientSecret.startsWith("YOUR_")) {
            log.warn("PayPal credentials not configured properly. PayPal integration will be disabled.");
            return null;
        }
        log.info("Initializing PayPal OAuth token credential");
        return new OAuthTokenCredential(clientId, clientSecret, paypalSdkConfig());
    }

    @Bean
    @Lazy
    @ConditionalOnProperty(prefix = "paypal", name = "enabled", havingValue = "true")
    public APIContext apiContext() throws PayPalRESTException {
        if (!enabled || clientId == null || clientId.startsWith("YOUR_") || clientSecret == null || clientSecret.startsWith("YOUR_")) {
            log.warn("PayPal credentials not configured. PayPal API context will not be created.");
            return null;
        }
        try {
            APIContext context = new APIContext(oAuthTokenCredential().getAccessToken());
            context.setConfigurationMap(paypalSdkConfig());
            log.info("PayPal API context initialized successfully in {} mode", mode);
            return context;
        } catch (PayPalRESTException e) {
            log.error("Failed to initialize PayPal API context: {}", e.getMessage());
            throw e;
        }
    }
}

