package com.kaushik27.gameofthrones.dto;

import java.util.List;

public record DatabaseTable(String name, String displayName, long recordCount, List<DatabaseColumn> columns) {}
