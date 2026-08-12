package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record EventResponse(
        String id, int season, String title, String date, String type,
        List<String> houses, List<String> characterIds, String summary) {
}
