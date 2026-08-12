package com.kaushik27.gameofthrones.service;

import com.kaushik27.gameofthrones.dto.EpisodePageResponse;
import com.kaushik27.gameofthrones.dto.EpisodeResponse;
import com.kaushik27.gameofthrones.entity.EpisodeRecord;
import com.kaushik27.gameofthrones.exception.EpisodeNotFoundException;
import com.kaushik27.gameofthrones.repository.EpisodeRepository;
import com.kaushik27.gameofthrones.util.JsonCollections;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EpisodeService {
    private final EpisodeRepository repository;
    private final JsonCollections json;

    public EpisodeService(EpisodeRepository repository, JsonCollections json) {
        this.repository = repository;
        this.json = json;
    }

    public EpisodePageResponse findAll(int page, int pageSize, Integer season, String query) {
        var pageable = PageRequest.of(page, pageSize, Sort.by("season", "episode"));
        boolean hasQuery = query != null && !query.isBlank();
        Page<EpisodeRecord> result = season != null && hasQuery
                ? repository.findBySeasonAndTitleContainingIgnoreCase(season, query, pageable)
                : season != null ? repository.findBySeason(season, pageable)
                : hasQuery ? repository.findByTitleContainingIgnoreCase(query, pageable)
                : repository.findAll(pageable);
        return new EpisodePageResponse(result.getContent().stream().map(this::response).toList(),
                result.getTotalElements(), result.getNumber(), result.getSize(), result.getTotalPages(), null);
    }

    public EpisodeResponse findById(String id) {
        return repository.findById(id).map(this::response)
                .orElseThrow(() -> new EpisodeNotFoundException(id));
    }

    private EpisodeResponse response(EpisodeRecord episode) {
        return new EpisodeResponse(episode.getId(), episode.getSeason(), episode.getEpisode(), episode.getTitle(),
                episode.getAirDate(), episode.getRuntimeMinutes(), episode.getDirector(), json.strings(episode.getWritersJson()),
                episode.getSummary(), json.strings(episode.getThemesJson()), json.strings(episode.getCharacterIdsJson()),
                json.strings(episode.getEventIdsJson()));
    }

}
