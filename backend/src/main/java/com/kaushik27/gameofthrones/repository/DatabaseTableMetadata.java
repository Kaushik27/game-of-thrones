package com.kaushik27.gameofthrones.repository;

import java.util.List;

public record DatabaseTableMetadata(String name, String displayName, long recordCount, List<DatabaseColumnMetadata> columns) {}
