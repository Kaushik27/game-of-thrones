package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record QuotePageResponse(
        List<QuoteResponse> items, long itemsCount, int page, int pageSize, int pagesCount, PageLinks links) {
    public QuotePageResponse withLinks(PageLinks links) {
        return new QuotePageResponse(items, itemsCount, page, pageSize, pagesCount, links);
    }
}
