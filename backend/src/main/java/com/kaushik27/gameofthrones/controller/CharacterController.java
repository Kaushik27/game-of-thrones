package com.kaushik27.gameofthrones.controller;

import com.kaushik27.gameofthrones.dto.CharacterPageResponse;
import com.kaushik27.gameofthrones.dto.CharacterResponse;
import com.kaushik27.gameofthrones.dto.CharacterStatusFilter;
import com.kaushik27.gameofthrones.service.CharacterService;
import com.kaushik27.gameofthrones.util.PageLinksFactory;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/characters")
public class CharacterController {

    private final CharacterService service;
    private final PageLinksFactory pageLinksFactory;

    public CharacterController(CharacterService service, PageLinksFactory pageLinksFactory) {
        this.service = service;
        this.pageLinksFactory = pageLinksFactory;
    }

    @GetMapping
    ResponseEntity<CharacterPageResponse> findAll(
            @RequestParam(defaultValue = "0") @Min(0) @Max(100_000) int page,
            @RequestParam(defaultValue = "24") @Min(1) @Max(100) int pageSize,
            @RequestParam(required = false) @Size(max = 100) String house,
            @RequestParam(required = false) CharacterStatusFilter status,
            @RequestParam(required = false) @Size(max = 100) String query) {
        CharacterPageResponse response = service.findAll(page, pageSize, house, status, query);
        response = response.withLinks(pageLinksFactory.create(response.page(), response.pagesCount()));
        return ResponseEntity.ok()
                .header("Link", pageLinksFactory.toHeader(response.links()))
                .header("Cache-Control", "public, max-age=60, stale-while-revalidate=30")
                .body(response);
    }

    @GetMapping("/{characterId}")
    CharacterResponse findById(
            @PathVariable @Pattern(regexp = "[a-z0-9-]{1,100}") String characterId) {
        return service.findById(characterId);
    }

}
