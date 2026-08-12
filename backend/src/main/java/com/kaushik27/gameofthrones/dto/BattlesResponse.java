package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record BattlesResponse(List<BattleResponse> items, int itemsCount) {
}
