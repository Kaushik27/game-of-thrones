package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record DatabaseTablesResponse(List<DatabaseTable> items, int itemsCount) {}
