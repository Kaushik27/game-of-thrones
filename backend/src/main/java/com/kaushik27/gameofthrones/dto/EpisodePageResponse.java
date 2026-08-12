package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record EpisodePageResponse(
        List<EpisodeResponse> items, long itemsCount, int page, int pageSize, int pagesCount) {
}
