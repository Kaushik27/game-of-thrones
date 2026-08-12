package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record BattleResponse(
        String id, String name, int season, String location, List<CombatantResponse> combatants,
        String outcome, String casualties, List<String> linkedCharacterIds, List<String> linkedEventIds) {
}
