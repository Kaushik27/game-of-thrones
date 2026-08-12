package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record EventsResponse(List<EventResponse> items, int itemsCount) {
}
