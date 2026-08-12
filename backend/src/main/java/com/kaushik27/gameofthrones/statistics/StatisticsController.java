package com.kaushik27.gameofthrones.statistics;

import java.time.Instant;

import jakarta.persistence.EntityManager;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/statistics")
class StatisticsController {
    private final EntityManager entityManager;
    StatisticsController(EntityManager entityManager) { this.entityManager = entityManager; }

    @GetMapping
    @Transactional(readOnly = true)
    StatisticsResponse getStatistics() {
        return new StatisticsResponse(count("CharacterRecord"), count("HouseRecord"), count("RelationshipRecord"),
                count("EpisodeRecord"), count("QuoteRecord"), count("BattleRecord"), count("StoryEventRecord"),
                "H2", Instant.now());
    }

    private long count(String entity) {
        return entityManager.createQuery("select count(record) from " + entity + " record", Long.class).getSingleResult();
    }

    record StatisticsResponse(long characters, long houses, long relationships, long episodes, long quotes,
                              long battles, long events, String database, Instant generatedAt) { }
}
