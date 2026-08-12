package com.kaushik27.gameofthrones.repository;

import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

@Repository
public class ArchiveStatisticsRepository {
    private final EntityManager entityManager;

    public ArchiveStatisticsRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public long[] countAllDomains() {
        Object[] counts = (Object[]) entityManager.createNativeQuery("""
                select (select count(*) from character_records),
                       (select count(*) from houses),
                       (select count(*) from relationships),
                       (select count(*) from episodes),
                       (select count(*) from quotes),
                       (select count(*) from battles),
                       (select count(*) from story_events)
                """).getSingleResult();
        long[] result = new long[counts.length];
        for (int index = 0; index < counts.length; index++) {
            result[index] = ((Number) counts[index]).longValue();
        }
        return result;
    }
}
