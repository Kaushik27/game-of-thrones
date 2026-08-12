package com.kaushik27.gameofthrones.controller;

import com.kaushik27.gameofthrones.dto.CharacterPageResponse;
import com.kaushik27.gameofthrones.dto.CharacterResponse;
import com.kaushik27.gameofthrones.entity.CharacterStatus;
import com.kaushik27.gameofthrones.service.CharacterService;

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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Validated
@RestController
@RequestMapping("/api/v1/characters")
public class CharacterController {

    private final CharacterService service;

    public CharacterController(CharacterService service) {
        this.service = service;
    }

    @GetMapping
    ResponseEntity<CharacterPageResponse> findAll(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "24") @Min(1) @Max(100) int pageSize,
            @RequestParam(required = false) @Size(max = 100) String house,
            @RequestParam(required = false) CharacterStatus status,
            @RequestParam(required = false) @Size(max = 100) String query) {
        CharacterPageResponse response = service.findAll(page, pageSize, house, status, query);
        return ResponseEntity.ok()
                .header("Link", selfLink())
                .body(response);
    }

    @GetMapping("/{characterId}")
    CharacterResponse findById(
            @PathVariable @Pattern(regexp = "[a-z0-9-]{1,100}") String characterId) {
        return service.findById(characterId);
    }

    private String selfLink() {
        return "<" + ServletUriComponentsBuilder.fromCurrentRequestUri().toUriString() + ">; rel=\"self\"";
    }
}
