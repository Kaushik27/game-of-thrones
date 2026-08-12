package com.kaushik27.gameofthrones.relationship;

import java.util.List;

import jakarta.persistence.EntityManager;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/characters/{characterId}/relationships")
class RelationshipController {
    private final RelationshipRepository repository;
    private final EntityManager entityManager;

    RelationshipController(RelationshipRepository repository, EntityManager entityManager) {
        this.repository = repository;
        this.entityManager = entityManager;
    }

    @GetMapping
    @Transactional(readOnly = true)
    RelationshipsResponse findForCharacter(@PathVariable String characterId) {
        List<RelationshipResponse> items = repository.findBySourceIdOrTargetIdOrderByTypeAsc(characterId, characterId).stream()
                .map(record -> {
                    String relatedId = record.getSourceId().equals(characterId) ? record.getTargetId() : record.getSourceId();
                    String relatedName = entityManager.createQuery("select character.name from CharacterRecord character where character.id = :id", String.class)
                            .setParameter("id", relatedId).getSingleResult();
                    return new RelationshipResponse(record.getId(), relatedId, relatedName, record.getType(), record.getSubtype(), record.getLabel());
                }).toList();
        return new RelationshipsResponse(items, items.size());
    }

    record RelationshipResponse(long id, String relatedCharacterId, String relatedCharacterName, String type, String subtype, String label) { }
    record RelationshipsResponse(List<RelationshipResponse> items, int itemsCount) { }
}
