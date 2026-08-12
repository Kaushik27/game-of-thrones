package com.kaushik27.gameofthrones.quote;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/quotes")
class QuoteController {
    private final QuoteRepository repository;
    QuoteController(QuoteRepository repository) { this.repository = repository; }

    @GetMapping
    @Transactional(readOnly = true)
    QuotePageResponse findAll(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int pageSize,
            @RequestParam(required = false) @Min(1) @Max(8) Integer season,
            @RequestParam(required = false) @Size(max = 100) String house) {
        var pageable = PageRequest.of(page, pageSize, Sort.by("id"));
        boolean hasHouse = house != null && !house.isBlank();
        Page<QuoteRecord> result = season != null && hasHouse
                ? repository.findBySeasonAndCharacterHouseIgnoreCase(season, house, pageable)
                : season != null ? repository.findBySeason(season, pageable)
                : hasHouse ? repository.findByCharacterHouseIgnoreCase(house, pageable)
                : repository.findAll(pageable);
        List<QuoteResponse> items = result.getContent().stream().map(quote -> new QuoteResponse(
                quote.getId(), quote.getCharacterId(), quote.getCharacter().getName(), quote.getCharacter().getHouse(),
                quote.getText(), quote.getSeason())).toList();
        return new QuotePageResponse(items, result.getTotalElements(), result.getNumber(), result.getSize(), result.getTotalPages());
    }

    record QuoteResponse(String id, String characterId, String characterName, String house, String text, int season) { }
    record QuotePageResponse(List<QuoteResponse> items, long itemsCount, int page, int pageSize, int pagesCount) { }
}
