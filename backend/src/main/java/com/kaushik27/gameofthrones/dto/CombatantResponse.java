package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record CombatantResponse(String side, List<String> houses, List<String> characters) {
}
