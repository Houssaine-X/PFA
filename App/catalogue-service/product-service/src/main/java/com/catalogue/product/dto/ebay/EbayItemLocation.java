package com.catalogue.product.dto.ebay;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class EbayItemLocation {
    private String city;
    private String stateOrProvince;
    private String postalCode;
    private String country;
}
