package com.kaushik27.gameofthrones.dto;

import java.time.LocalDate;
import java.util.List;

public record EpisodeResponse(
        String id, int season, int episode, String title, LocalDate airDate, int runtimeMinutes,
        String director, List<String> writers, String summary, List<String> themes,
        List<String> characterIds, List<String> eventIds) {
}
