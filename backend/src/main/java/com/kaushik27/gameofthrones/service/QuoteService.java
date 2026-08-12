package com.kaushik27.gameofthrones.service;

import java.util.List;

import com.kaushik27.gameofthrones.dto.QuotePageResponse;
import com.kaushik27.gameofthrones.dto.QuoteResponse;
import com.kaushik27.gameofthrones.entity.QuoteRecord;
import com.kaushik27.gameofthrones.repository.QuoteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class QuoteService {
    private final QuoteRepository repository;

    public QuoteService(QuoteRepository repository) {
        this.repository = repository;
    }

    public QuotePageResponse findAll(int page, int pageSize, Integer season, String house) {
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
        return new QuotePageResponse(items, result.getTotalElements(), result.getNumber(), result.getSize(), result.getTotalPages(), null);
    }
}
