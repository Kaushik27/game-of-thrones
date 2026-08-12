package com.kaushik27.gameofthrones.service;

import java.util.List;

import com.kaushik27.gameofthrones.dto.EventResponse;
import com.kaushik27.gameofthrones.dto.EventsResponse;
import com.kaushik27.gameofthrones.entity.StoryEventRecord;
import com.kaushik27.gameofthrones.repository.StoryEventRepository;
import com.kaushik27.gameofthrones.util.JsonCollections;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StoryEventService {
    private final StoryEventRepository repository;
    private final JsonCollections json;

    public StoryEventService(StoryEventRepository repository, JsonCollections json) {
        this.repository = repository;
        this.json = json;
    }

    public EventsResponse findAll(Integer season, String type) {
        boolean hasType = type != null && !type.isBlank();
        List<StoryEventRecord> records = season != null && hasType
                ? repository.findBySeasonAndTypeIgnoreCaseOrderByTitle(season, type)
                : season != null ? repository.findBySeasonOrderByTitle(season)
                : hasType ? repository.findByTypeIgnoreCaseOrderBySeasonAsc(type)
                : repository.findAllByOrderBySeasonAscTitleAsc();
        List<EventResponse> items = records.stream().map(event -> new EventResponse(
                event.getId(), event.getSeason(), event.getTitle(), event.getDate(), event.getType(),
                json.strings(event.getHousesJson()), json.strings(event.getCharacterIdsJson()), event.getSummary())).toList();
        return new EventsResponse(items, items.size());
    }
}
