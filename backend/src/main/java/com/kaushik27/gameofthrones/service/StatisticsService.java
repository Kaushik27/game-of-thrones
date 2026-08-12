package com.kaushik27.gameofthrones.service;

import java.time.Instant;

import com.kaushik27.gameofthrones.dto.StatisticsResponse;
import com.kaushik27.gameofthrones.repository.RealmStatisticsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StatisticsService {
    private final RealmStatisticsRepository repository;

    public StatisticsService(RealmStatisticsRepository repository) {
        this.repository = repository;
    }

    public StatisticsResponse getStatistics() {
        long[] counts = repository.countAllDomains();
        return new StatisticsResponse(counts[0], counts[1], counts[2], counts[3], counts[4], counts[5], counts[6],
                "H2", Instant.now());
    }
}
