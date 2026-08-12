package com.kaushik27.gameofthrones.controller;

import com.kaushik27.gameofthrones.dto.EpisodePageResponse;
import com.kaushik27.gameofthrones.dto.EpisodeResponse;
import com.kaushik27.gameofthrones.service.EpisodeService;
import com.kaushik27.gameofthrones.util.PageLinksFactory;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.validation.annotation.Validated;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/episodes")
public class EpisodeController {
    private final EpisodeService service;
    private final PageLinksFactory pageLinksFactory;
    public EpisodeController(EpisodeService service, PageLinksFactory pageLinksFactory) {
        this.service = service;
        this.pageLinksFactory = pageLinksFactory;
    }

    @GetMapping
    ResponseEntity<EpisodePageResponse> findAll(
            @RequestParam(defaultValue = "0") @Min(0) @Max(100_000) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int pageSize,
            @RequestParam(required = false) @Min(1) @Max(8) Integer season,
            @RequestParam(required = false) @Size(max = 100) String query) {
        EpisodePageResponse response = service.findAll(page, pageSize, season, query);
        response = response.withLinks(pageLinksFactory.create(response.page(), response.pagesCount()));
        return ResponseEntity.ok().header("Link", pageLinksFactory.toHeader(response.links()))
                .header("Cache-Control", "public, max-age=60, stale-while-revalidate=30").body(response);
    }

    @GetMapping("/{episodeId}")
    EpisodeResponse findById(
            @PathVariable @Pattern(regexp = "s\\d{2}e\\d{2}") String episodeId) {
        return service.findById(episodeId);
    }
}
