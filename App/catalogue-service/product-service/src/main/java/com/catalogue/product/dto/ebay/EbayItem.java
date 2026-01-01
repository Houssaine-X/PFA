package com.catalogue.product.dto.ebay;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class EbayItem {
    private String itemId;
    private String title;
    private String shortDescription;
    private EbayImage image;  // Single object, not a list
    private List<EbayImage> additionalImages;  // Additional images as a list
    private EbayPrice price;
    private String itemWebUrl;
    private String itemAffiliateWebUrl;
    private List<EbayCategory> categories;
    private String condition;
    private String conditionId;
    private EbayItemLocation itemLocation;
}
