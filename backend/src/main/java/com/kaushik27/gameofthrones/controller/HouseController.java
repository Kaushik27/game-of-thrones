package com.kaushik27.gameofthrones.controller;

import com.kaushik27.gameofthrones.dto.HouseResponse;
import com.kaushik27.gameofthrones.dto.HousesResponse;
import com.kaushik27.gameofthrones.service.HouseService;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/houses")
public class HouseController {

    private final HouseService service;

    public HouseController(HouseService service) {
        this.service = service;
    }

    @GetMapping
    HousesResponse findAll() {
        return service.findAll();
    }

    @GetMapping("/{houseName}")
    HouseResponse findByName(
            @PathVariable @Pattern(regexp = "[A-Za-z][A-Za-z -]{0,99}") String houseName) {
        return service.findByName(houseName);
    }
}
