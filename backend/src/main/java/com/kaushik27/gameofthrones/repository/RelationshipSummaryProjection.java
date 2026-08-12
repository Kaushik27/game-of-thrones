package com.kaushik27.gameofthrones.repository;

public interface RelationshipSummaryProjection {
    long getId();
    String getRelatedCharacterId();
    String getRelatedCharacterName();
    String getType();
    String getSubtype();
    String getLabel();
}
