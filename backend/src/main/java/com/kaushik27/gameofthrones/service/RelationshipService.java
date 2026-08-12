package com.kaushik27.gameofthrones.service;

import java.util.List;

import com.kaushik27.gameofthrones.dto.RelationshipResponse;
import com.kaushik27.gameofthrones.dto.RelationshipsResponse;
import com.kaushik27.gameofthrones.repository.RelationshipRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RelationshipService {
    private final RelationshipRepository repository;
    private final EntityManager entityManager;

    public RelationshipService(RelationshipRepository repository, EntityManager entityManager) {
        this.repository = repository;
        this.entityManager = entityManager;
    }

    public RelationshipsResponse findForCharacter(String characterId) {
        List<RelationshipResponse> items = repository
                .findBySourceIdOrTargetIdOrderByTypeAsc(characterId, characterId).stream()
                .map(record -> {
                    String relatedId = record.getSourceId().equals(characterId)
                            ? record.getTargetId() : record.getSourceId();
                    String relatedName = entityManager.createQuery(
                                    "select character.name from CharacterRecord character where character.id = :id", String.class)
                            .setParameter("id", relatedId).getSingleResult();
                    return new RelationshipResponse(record.getId(), relatedId, relatedName,
                            record.getType(), record.getSubtype(), record.getLabel());
                }).toList();
        return new RelationshipsResponse(items, items.size());
    }
}
