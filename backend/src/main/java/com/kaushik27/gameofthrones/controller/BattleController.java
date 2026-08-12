package com.kaushik27.gameofthrones.controller;

import com.kaushik27.gameofthrones.dto.BattleResponse;
import com.kaushik27.gameofthrones.dto.BattlesResponse;
import com.kaushik27.gameofthrones.service.BattleService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/battles")
public class BattleController {
    private final BattleService service;

    public BattleController(BattleService service) {
        this.service = service;
    }

    @GetMapping
    BattlesResponse findAll(@RequestParam(required = false) @Min(1) @Max(8) Integer season) {
        return service.findAll(season);
    }

    @GetMapping("/{battleId}")
    BattleResponse findById(@PathVariable @Pattern(regexp = "[a-z0-9-]{1,100}") String battleId) {
        return service.findById(battleId);
    }
}
