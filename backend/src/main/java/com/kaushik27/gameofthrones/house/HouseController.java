package com.kaushik27.gameofthrones.house;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/houses")
class HouseController {

    private final HouseService service;

    HouseController(HouseService service) {
        this.service = service;
    }

    @GetMapping
    HouseService.HousesResponse findAll() {
        return service.findAll();
    }

    @GetMapping("/{houseName}")
    HouseResponse findByName(@PathVariable String houseName) {
        return service.findByName(houseName);
    }
}
