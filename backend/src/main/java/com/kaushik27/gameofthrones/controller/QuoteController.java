package com.kaushik27.gameofthrones.controller;

import com.kaushik27.gameofthrones.dto.QuotePageResponse;
import com.kaushik27.gameofthrones.service.QuoteService;
import com.kaushik27.gameofthrones.util.PageLinksFactory;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/quotes")
public class QuoteController {
    private final QuoteService service;
    private final PageLinksFactory pageLinksFactory;

    public QuoteController(QuoteService service, PageLinksFactory pageLinksFactory) {
        this.service = service;
        this.pageLinksFactory = pageLinksFactory;
    }

    @GetMapping
    ResponseEntity<QuotePageResponse> findAll(
            @RequestParam(defaultValue = "0") @Min(0) @Max(100_000) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int pageSize,
            @RequestParam(required = false) @Min(1) @Max(8) Integer season,
            @RequestParam(required = false) @Size(max = 100) String house) {
        QuotePageResponse response = service.findAll(page, pageSize, season, house);
        response = response.withLinks(pageLinksFactory.create(response.page(), response.pagesCount()));
        return ResponseEntity.ok().header("Link", pageLinksFactory.toHeader(response.links()))
                .header("Cache-Control", "public, max-age=60, stale-while-revalidate=30").body(response);
    }
}
