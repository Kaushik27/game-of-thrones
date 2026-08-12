package com.kaushik27.gameofthrones.controller;

import com.kaushik27.gameofthrones.dto.RelationshipsResponse;
import com.kaushik27.gameofthrones.service.RelationshipService;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/characters/{characterId}/relationships")
public class RelationshipController {
    private final RelationshipService service;

    public RelationshipController(RelationshipService service) {
        this.service = service;
    }

    @GetMapping
    RelationshipsResponse findForCharacter(
            @PathVariable @Pattern(regexp = "[a-z0-9-]{1,100}") String characterId) {
        return service.findForCharacter(characterId);
    }
}
