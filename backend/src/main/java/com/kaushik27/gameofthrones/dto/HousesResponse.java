package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record HousesResponse(List<HouseResponse> items, int itemsCount) {
}
