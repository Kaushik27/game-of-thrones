package com.kaushik27.gameofthrones.controller;

import com.kaushik27.gameofthrones.dto.EventsResponse;
import com.kaushik27.gameofthrones.service.StoryEventService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/events")
public class StoryEventController {
    private final StoryEventService service;

    public StoryEventController(StoryEventService service) {
        this.service = service;
    }

    @GetMapping
    EventsResponse findAll(
            @RequestParam(required = false) @Min(1) @Max(8) Integer season,
            @RequestParam(required = false) @Size(max = 40) String type) {
        return service.findAll(season, type);
    }
}
