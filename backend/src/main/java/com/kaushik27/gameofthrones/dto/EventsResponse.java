package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record EventsResponse(
        List<EventResponse> items,
        long itemsCount,
        int page,
        int pageSize,
        int pagesCount,
        PageLinks links) {

    public EventsResponse withLinks(PageLinks links) {
        return new EventsResponse(items, itemsCount, page, pageSize, pagesCount, links);
    }
}
