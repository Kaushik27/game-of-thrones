package com.kaushik27.gameofthrones.repository;

import java.util.List;

public record DatabaseTableDefinition(String name, String displayName, long recordCount, List<DatabaseColumnDefinition> columns) {}
