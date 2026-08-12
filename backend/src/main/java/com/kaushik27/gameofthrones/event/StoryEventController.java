package com.kaushik27.gameofthrones.event;

import java.util.List;

import com.kaushik27.gameofthrones.common.JsonCollections;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/events")
class StoryEventController {
    private final StoryEventRepository repository;
    private final JsonCollections json;
    StoryEventController(StoryEventRepository repository, JsonCollections json) { this.repository = repository; this.json = json; }

    @GetMapping
    @Transactional(readOnly = true)
    EventsResponse findAll(@RequestParam(required = false) @Min(1) @Max(8) Integer season,
                           @RequestParam(required = false) @Size(max = 40) String type) {
        boolean hasType = type != null && !type.isBlank();
        List<StoryEventRecord> records = season != null && hasType ? repository.findBySeasonAndTypeIgnoreCaseOrderByTitle(season, type)
                : season != null ? repository.findBySeasonOrderByTitle(season)
                : hasType ? repository.findByTypeIgnoreCaseOrderBySeasonAsc(type)
                : repository.findAllByOrderBySeasonAscTitleAsc();
        List<EventResponse> items = records.stream().map(event -> new EventResponse(event.getId(), event.getSeason(),
                event.getTitle(), event.getDate(), event.getType(), json.strings(event.getHousesJson()),
                json.strings(event.getCharacterIdsJson()), event.getSummary())).toList();
        return new EventsResponse(items, items.size());
    }

    record EventResponse(String id, int season, String title, String date, String type,
                         List<String> houses, List<String> characterIds, String summary) { }
    record EventsResponse(List<EventResponse> items, int itemsCount) { }
}
