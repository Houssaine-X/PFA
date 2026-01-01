package com.catalogue.product.dto.ebay;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class EbaySearchResponse {
    private String href;
    private Integer total;
    private Integer limit;
    private Integer offset;
    private List<EbayItem> itemSummaries;
}
