package com.kaushik27.gameofthrones.controller;

import com.kaushik27.gameofthrones.dto.StatisticsResponse;
import com.kaushik27.gameofthrones.service.StatisticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/statistics")
public class StatisticsController {
    private final StatisticsService service;

    public StatisticsController(StatisticsService service) {
        this.service = service;
    }

    @GetMapping
    StatisticsResponse getStatistics() {
        return service.getStatistics();
    }
}
