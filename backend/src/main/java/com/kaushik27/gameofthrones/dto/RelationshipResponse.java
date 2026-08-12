package com.kaushik27.gameofthrones.dto;

public record RelationshipResponse(
        long id, String relatedCharacterId, String relatedCharacterName,
        String type, String subtype, String label) {
}
