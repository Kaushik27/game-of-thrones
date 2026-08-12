package com.kaushik27.gameofthrones.dto;

public record QuoteResponse(
        String id, String characterId, String characterName, String house, String text, int season) {
}
