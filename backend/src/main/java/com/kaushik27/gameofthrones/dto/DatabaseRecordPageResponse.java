package com.kaushik27.gameofthrones.dto;

import java.util.List;
import java.util.Map;

public record DatabaseRecordPageResponse(
        String table,
        List<Map<String, Object>> items,
        long itemsCount,
        int page,
        int pageSize,
        int pagesCount,
        PageLinks links) {}
