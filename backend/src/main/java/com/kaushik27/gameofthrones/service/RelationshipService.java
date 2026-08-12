package com.kaushik27.gameofthrones.service;

import java.util.List;

import com.kaushik27.gameofthrones.dto.RelationshipResponse;
import com.kaushik27.gameofthrones.dto.RelationshipsResponse;
import com.kaushik27.gameofthrones.repository.RelationshipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RelationshipService {
    private final RelationshipRepository repository;

    public RelationshipService(RelationshipRepository repository) {
        this.repository = repository;
    }

    public RelationshipsResponse findForCharacter(String characterId) {
        List<RelationshipResponse> items = repository.findSummariesForCharacter(characterId).stream()
                .map(record -> new RelationshipResponse(record.getId(), record.getRelatedCharacterId(),
                        record.getRelatedCharacterName(), record.getType(), record.getSubtype(), record.getLabel()))
                .toList();
        return new RelationshipsResponse(items, items.size());
    }
}
