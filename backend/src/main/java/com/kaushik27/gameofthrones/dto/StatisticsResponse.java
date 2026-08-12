package com.kaushik27.gameofthrones.dto;

import java.time.Instant;

public record StatisticsResponse(
        long characters, long houses, long relationships, long episodes, long quotes,
        long battles, long events, String database, Instant generatedAt) {
}
