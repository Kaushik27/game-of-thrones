package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record BattlesResponse(
        List<BattleResponse> items,
        long itemsCount,
        int page,
        int pageSize,
        int pagesCount,
        PageLinks links) {

    public BattlesResponse withLinks(PageLinks links) {
        return new BattlesResponse(items, itemsCount, page, pageSize, pagesCount, links);
    }
}
