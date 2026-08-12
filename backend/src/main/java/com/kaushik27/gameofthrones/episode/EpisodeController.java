package com.kaushik27.gameofthrones.episode;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/episodes")
class EpisodeController {
    private final EpisodeService service;
    EpisodeController(EpisodeService service) { this.service = service; }

    @GetMapping
    EpisodeService.EpisodePageResponse findAll(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int pageSize,
            @RequestParam(required = false) @Min(1) @Max(8) Integer season,
            @RequestParam(required = false) @Size(max = 100) String query) {
        return service.findAll(page, pageSize, season, query);
    }

    @GetMapping("/{episodeId}")
    EpisodeService.EpisodeResponse findById(@PathVariable String episodeId) { return service.findById(episodeId); }
}
