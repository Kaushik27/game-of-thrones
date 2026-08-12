package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record EpisodePageResponse(
        List<EpisodeResponse> items, long itemsCount, int page, int pageSize, int pagesCount, PageLinks links) {
    public EpisodePageResponse withLinks(PageLinks links) {
        return new EpisodePageResponse(items, itemsCount, page, pageSize, pagesCount, links);
    }
}
