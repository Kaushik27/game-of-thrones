package com.kaushik27.gameofthrones.episode;

import java.time.LocalDate;
import java.util.List;

import com.kaushik27.gameofthrones.common.JsonCollections;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
class EpisodeService {
    private final EpisodeRepository repository;
    private final JsonCollections json;

    EpisodeService(EpisodeRepository repository, JsonCollections json) {
        this.repository = repository;
        this.json = json;
    }

    EpisodePageResponse findAll(int page, int pageSize, Integer season, String query) {
        var pageable = PageRequest.of(page, pageSize, Sort.by("season", "episode"));
        boolean hasQuery = query != null && !query.isBlank();
        Page<EpisodeRecord> result = season != null && hasQuery
                ? repository.findBySeasonAndTitleContainingIgnoreCase(season, query, pageable)
                : season != null ? repository.findBySeason(season, pageable)
                : hasQuery ? repository.findByTitleContainingIgnoreCase(query, pageable)
                : repository.findAll(pageable);
        return new EpisodePageResponse(result.getContent().stream().map(this::response).toList(),
                result.getTotalElements(), result.getNumber(), result.getSize(), result.getTotalPages());
    }

    EpisodeResponse findById(String id) {
        return repository.findById(id).map(this::response)
                .orElseThrow(() -> new EpisodeNotFoundException(id));
    }

    private EpisodeResponse response(EpisodeRecord episode) {
        return new EpisodeResponse(episode.getId(), episode.getSeason(), episode.getEpisode(), episode.getTitle(),
                episode.getAirDate(), episode.getRuntimeMinutes(), episode.getDirector(), json.strings(episode.getWritersJson()),
                episode.getSummary(), json.strings(episode.getThemesJson()), json.strings(episode.getCharacterIdsJson()),
                json.strings(episode.getEventIdsJson()));
    }

    record EpisodeResponse(String id, int season, int episode, String title, LocalDate airDate, int runtimeMinutes,
                           String director, List<String> writers, String summary, List<String> themes,
                           List<String> characterIds, List<String> eventIds) { }
    record EpisodePageResponse(List<EpisodeResponse> items, long itemsCount, int page, int pageSize, int pagesCount) { }
}
