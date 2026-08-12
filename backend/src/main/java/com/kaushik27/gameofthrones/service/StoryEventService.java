package com.kaushik27.gameofthrones.service;

import com.kaushik27.gameofthrones.dto.EventResponse;
import com.kaushik27.gameofthrones.dto.EventsResponse;
import com.kaushik27.gameofthrones.entity.StoryEventRecord;
import com.kaushik27.gameofthrones.repository.StoryEventRepository;
import com.kaushik27.gameofthrones.util.JsonCollections;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

    public EventsResponse findAll(int page, int pageSize, Integer season, String type) {
        boolean hasType = type != null && !type.isBlank();
        var pageable = PageRequest.of(page, pageSize, Sort.by("season", "title"));
        Page<StoryEventRecord> records = season != null && hasType
                ? repository.findBySeasonAndTypeIgnoreCaseOrderByTitle(season, type, pageable)
                : season != null ? repository.findBySeasonOrderByTitle(season, pageable)
                : hasType ? repository.findByTypeIgnoreCaseOrderBySeasonAsc(type, pageable)
                : repository.findAllByOrderBySeasonAscTitleAsc(pageable);
        var items = records.getContent().stream().map(event -> new EventResponse(
                event.getId(), event.getSeason(), event.getTitle(), event.getDate(), event.getType(),
                json.strings(event.getHousesJson()), json.strings(event.getCharacterIdsJson()), event.getSummary())).toList();
        return new EventsResponse(items, records.getTotalElements(), records.getNumber(), records.getSize(), records.getTotalPages(), null);
    }
}
