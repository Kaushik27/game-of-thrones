package com.kaushik27.gameofthrones.service;

import java.time.Instant;

import com.kaushik27.gameofthrones.dto.StatisticsResponse;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StatisticsService {
    private final EntityManager entityManager;

    public StatisticsService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public StatisticsResponse getStatistics() {
        return new StatisticsResponse(count("CharacterRecord"), count("HouseRecord"), count("RelationshipRecord"),
                count("EpisodeRecord"), count("QuoteRecord"), count("BattleRecord"), count("StoryEventRecord"),
                "H2", Instant.now());
    }

    private long count(String entity) {
        return entityManager.createQuery("select count(record) from " + entity + " record", Long.class)
                .getSingleResult();
    }
}
