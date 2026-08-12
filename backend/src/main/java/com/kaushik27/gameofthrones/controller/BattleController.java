package com.kaushik27.gameofthrones.controller;

import com.kaushik27.gameofthrones.dto.BattleResponse;
import com.kaushik27.gameofthrones.dto.BattlesResponse;
import com.kaushik27.gameofthrones.service.BattleService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.kaushik27.gameofthrones.util.PageLinksFactory;

@Validated
@RestController
@RequestMapping("/api/v1/battles")
public class BattleController {
    private final BattleService service;
    private final PageLinksFactory pageLinksFactory;

    public BattleController(BattleService service, PageLinksFactory pageLinksFactory) {
        this.service = service;
        this.pageLinksFactory = pageLinksFactory;
    }

    @GetMapping
    ResponseEntity<BattlesResponse> findAll(
            @RequestParam(defaultValue = "0") @Min(0) @Max(100_000) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int pageSize,
            @RequestParam(required = false) @Min(1) @Max(8) Integer season) {
        BattlesResponse response = service.findAll(page, pageSize, season);
        response = response.withLinks(pageLinksFactory.create(response.page(), response.pagesCount()));
        return ResponseEntity.ok().header("Link", pageLinksFactory.toHeader(response.links()))
                .header("Cache-Control", "public, max-age=60, stale-while-revalidate=30").body(response);
    }

    @GetMapping("/{battleId}")
    BattleResponse findById(@PathVariable @Pattern(regexp = "[a-z0-9-]{1,100}") String battleId) {
        return service.findById(battleId);
    }
}
