package com.kaushik27.gameofthrones.character;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
class CharacterService {

    private final CharacterRepository repository;

    CharacterService(CharacterRepository repository) {
        this.repository = repository;
    }

    CharacterPageResponse findAll(int page, int pageSize, String house, CharacterStatus status, String query) {
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("name").ascending());
        boolean hasHouse = house != null && !house.isBlank();
        boolean hasQuery = query != null && !query.isBlank();
        Page<CharacterRecord> result;

        if (hasHouse && status != null && hasQuery) {
            result = repository.findByHouseIgnoreCaseAndStatusAndNameContainingIgnoreCaseOrHouseIgnoreCaseAndStatusAndActorContainingIgnoreCase(
                    house, status, query, house, status, query, pageable);
        } else if (hasHouse && hasQuery) {
            result = repository.findByHouseIgnoreCaseAndNameContainingIgnoreCaseOrHouseIgnoreCaseAndActorContainingIgnoreCase(
                    house, query, house, query, pageable);
        } else if (status != null && hasQuery) {
            result = repository.findByStatusAndNameContainingIgnoreCaseOrStatusAndActorContainingIgnoreCase(
                    status, query, status, query, pageable);
        } else if (hasHouse && status != null) {
            result = repository.findByHouseIgnoreCaseAndStatus(house, status, pageable);
        } else if (hasHouse) {
            result = repository.findByHouseIgnoreCase(house, pageable);
        } else if (status != null) {
            result = repository.findByStatus(status, pageable);
        } else if (hasQuery) {
            result = repository.findByNameContainingIgnoreCaseOrActorContainingIgnoreCase(query, query, pageable);
        } else {
            result = repository.findAll(pageable);
        }
        return CharacterPageResponse.from(result);
    }

    CharacterResponse findById(String id) {
        return repository.findById(id)
                .map(CharacterResponse::from)
                .orElseThrow(() -> new CharacterNotFoundException(id));
    }
}
