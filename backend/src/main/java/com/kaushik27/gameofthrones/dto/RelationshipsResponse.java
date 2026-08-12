package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record RelationshipsResponse(List<RelationshipResponse> items, int itemsCount) {
}
